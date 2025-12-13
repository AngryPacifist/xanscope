"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { GLOBE_NODES, GLOBE_ARCS, mockPnodes } from "@/lib/mock-data";

import "mapbox-gl/dist/mapbox-gl.css";

interface MapboxGlobeProps {
    className?: string;
    contained?: boolean;
}

interface NodeLocation {
    ip: string;
    lat: number;
    lng: number;
    city: string;
    country: string;
    version: string;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW5ncnlwYWNpZmlzdCIsImEiOiJjbWoyNXlmZDAwams5M2dzYm5mcmUyNHAzIn0.FWl2l-P9o1badVVrzmqg4g";

// Generate arcs between nearby nodes (for visual effect)
function generateArcs(nodes: NodeLocation[]): [number, number][][] {
    const arcs: [number, number][][] = [];
    const maxDistance = 50; // degrees

    for (let i = 0; i < nodes.length; i++) {
        // Connect each node to 1-3 nearest nodes
        const distances: { idx: number; dist: number }[] = [];
        for (let j = 0; j < nodes.length; j++) {
            if (i === j) continue;
            const dist = Math.sqrt(
                Math.pow(nodes[i].lat - nodes[j].lat, 2) +
                Math.pow(nodes[i].lng - nodes[j].lng, 2)
            );
            if (dist < maxDistance) {
                distances.push({ idx: j, dist });
            }
        }
        distances.sort((a, b) => a.dist - b.dist);
        const connections = Math.min(2, distances.length);
        for (let k = 0; k < connections; k++) {
            const j = distances[k].idx;
            // Avoid duplicate arcs
            if (i < j) {
                arcs.push([[nodes[i].lng, nodes[i].lat], [nodes[j].lng, nodes[j].lat]]);
            }
        }
    }
    return arcs;
}

// Build arcs GeoJSON from mock data
const getArcCoordinates = (startId: string, endId: string) => {
    const start = mockPnodes.find(n => n.id === startId);
    const end = mockPnodes.find(n => n.id === endId);
    if (!start?.longitude || !end?.longitude) return null;
    return {
        start: { lng: start.longitude, lat: start.latitude! },
        end: { lng: end.longitude, lat: end.latitude! }
    };
};


export function MapboxGlobe({ className, contained = false }: MapboxGlobeProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const isInitializedRef = useRef(false);
    const animationRef = useRef<number>(0);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [realNodes, setRealNodes] = useState<NodeLocation[]>([]);
    const nodesLoadedRef = useRef(false);
    const dashOffsetRef = useRef(0);

    // Fetch real node locations on mount
    useEffect(() => {
        if (nodesLoadedRef.current) return;
        nodesLoadedRef.current = true;

        fetch("/api/node-locations")
            .then(res => res.json())
            .then(data => {
                if (data.nodes && data.nodes.length > 0) {
                    setRealNodes(data.nodes);
                    console.log(`[Globe] Loaded ${data.nodes.length} real node locations`);
                }
            })
            .catch(err => console.warn("[Globe] Failed to load node locations:", err));
    }, []);

    useEffect(() => {
        // Prevent double initialization (React StrictMode)
        if (isInitializedRef.current) return;
        if (typeof window === "undefined") return;
        if (!mapContainerRef.current) return;

        // Clear any existing children in the container
        while (mapContainerRef.current.firstChild) {
            mapContainerRef.current.removeChild(mapContainerRef.current.firstChild);
        }

        isInitializedRef.current = true;
        let isUserInteracting = false;
        let currentLng = 20;
        let map: any = null;

        import("mapbox-gl").then((mapboxgl) => {
            // Double-check we haven't already created a map
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            mapboxgl.default.accessToken = MAPBOX_TOKEN;

            map = new mapboxgl.default.Map({
                container: mapContainerRef.current!,
                style: "mapbox://styles/mapbox/dark-v11",
                center: [20, 20],
                zoom: contained ? 1.0 : 2.1, // Lower zoom in contained to show more globe
                minZoom: contained ? 0.5 : 1.5, // Allow zooming out more in contained
                maxZoom: 6,
                projection: "globe" as any,
                attributionControl: false,
                pitchWithRotate: true,
                dragRotate: true,
                touchPitch: true,
                scrollZoom: true,
                doubleClickZoom: true,
                touchZoomRotate: true,
                renderWorldCopies: false,
            });

            mapInstanceRef.current = map;

            // Resize handler - stored for cleanup
            const handleResize = () => {
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.resize();
                }
            };
            window.addEventListener("resize", handleResize);

            // Store for cleanup
            (map as any)._resizeHandler = handleResize;

            // Momentum physics using easeTo for smooth inertia
            let velocityLng = 0;
            let velocityLat = 0;
            let prevCenter: { lng: number; lat: number } | null = null;
            let prevTime = 0;
            let momentumAnimating = false;

            // Immediately capture interaction on mousedown (before dragstart fires)
            map.on("mousedown", () => {
                isUserInteracting = true;
                momentumAnimating = false;
            });

            map.on("mouseup", () => {
                // For simple clicks (not drags), reset after short delay
                setTimeout(() => {
                    if (!momentumAnimating) {
                        isUserInteracting = false;
                        currentLng = map.getCenter().lng;
                    }
                }, 50);
            });

            map.on("dragstart", () => {
                isUserInteracting = true;
                momentumAnimating = false;
                velocityLng = 0;
                velocityLat = 0;
                const center = map.getCenter();
                prevCenter = { lng: center.lng, lat: center.lat };
                prevTime = performance.now();
            });

            map.on("drag", () => {
                const now = performance.now();
                const center = map.getCenter();
                const dt = now - prevTime;

                if (prevCenter && dt > 0 && dt < 100) {
                    velocityLng = (center.lng - prevCenter.lng) / dt * 16;
                    velocityLat = (center.lat - prevCenter.lat) / dt * 16;
                }

                prevCenter = { lng: center.lng, lat: center.lat };
                prevTime = now;
            });

            map.on("dragend", () => {
                isUserInteracting = false;
                const center = map.getCenter();
                currentLng = center.lng;

                // Apply momentum using easeTo if there's significant velocity
                const speed = Math.sqrt(velocityLng * velocityLng + velocityLat * velocityLat);
                if (speed > 0.02) {
                    momentumAnimating = true;
                    const targetLng = center.lng + velocityLng * 50;
                    const targetLat = Math.max(-55, Math.min(55, center.lat + velocityLat * 50));

                    map.easeTo({
                        center: [targetLng, targetLat],
                        duration: Math.min(2000, speed * 3000),
                        easing: (t: number) => 1 - Math.pow(1 - t, 3) // Ease out cubic
                    });

                    setTimeout(() => {
                        momentumAnimating = false;
                        currentLng = map.getCenter().lng;
                    }, Math.min(2000, speed * 3000));
                }
            });

            map.on("wheel", () => {
                isUserInteracting = true;
                momentumAnimating = false;
                setTimeout(() => {
                    isUserInteracting = false;
                    currentLng = map.getCenter().lng;
                }, 200);
            });

            map.on("touchstart", () => { isUserInteracting = true; momentumAnimating = false; });
            map.on("touchend", () => {
                isUserInteracting = false;
                currentLng = map.getCenter().lng;
            });

            map.on("style.load", () => {
                setMapLoaded(true);

                // No fog
                map.setFog(null as any);

                // Colorize map layers
                map.setPaintProperty("water", "fill-color", "#0B1120");

                if (map.getLayer("land")) {
                    map.setPaintProperty("land", "background-color", "#141C2B");
                }

                if (map.getLayer("admin-0-boundary")) {
                    map.setPaintProperty("admin-0-boundary", "line-color", "#00E0FF");
                    map.setPaintProperty("admin-0-boundary", "line-opacity", 0.5);
                }
                if (map.getLayer("admin-0-boundary-bg")) {
                    map.setPaintProperty("admin-0-boundary-bg", "line-color", "#00E0FF");
                    map.setPaintProperty("admin-0-boundary-bg", "line-opacity", 0.2);
                }
                if (map.getLayer("admin-1-boundary")) {
                    map.setPaintProperty("admin-1-boundary", "line-color", "#00E0FF");
                    map.setPaintProperty("admin-1-boundary", "line-opacity", 0.15);
                }

                // Data sources - use real nodes when available, fall back to mock
                const useRealData = realNodes.length > 0;

                const nodesGeoJSON = {
                    type: "FeatureCollection",
                    features: useRealData
                        ? realNodes.map((node, idx) => ({
                            type: "Feature",
                            properties: { id: node.ip, city: node.city, country: node.country },
                            geometry: { type: "Point", coordinates: [node.lng, node.lat] },
                        }))
                        : GLOBE_NODES.map(node => ({
                            type: "Feature",
                            properties: { id: node.id, status: node.status },
                            geometry: { type: "Point", coordinates: [node.lng, node.lat] },
                        })),
                };

                // Arcs: only show in mock mode (no real traffic data available)
                const arcsGeoJSON = {
                    type: "FeatureCollection",
                    features: useRealData
                        ? [] // No arcs for real data - we don't have traffic info
                        : GLOBE_ARCS.map(([startId, endId]: [string, string]) => {
                            const coords = getArcCoordinates(startId, endId);
                            if (!coords) return null;
                            return {
                                type: "Feature",
                                properties: {},
                                geometry: {
                                    type: "LineString",
                                    coordinates: [[coords.start.lng, coords.start.lat], [coords.end.lng, coords.end.lat]],
                                },
                            };
                        }).filter(Boolean),
                };

                console.log(`[Globe] Using ${useRealData ? 'real' : 'mock'} data: ${nodesGeoJSON.features.length} nodes, ${arcsGeoJSON.features.length} arcs`);

                map.addSource("nodes", { type: "geojson", data: nodesGeoJSON as any });
                map.addSource("arcs", { type: "geojson", data: arcsGeoJSON as any });

                // Arcs - Purple
                map.addLayer({
                    id: "arc-base",
                    type: "line",
                    source: "arcs",
                    paint: {
                        "line-color": "#A855F7",
                        "line-opacity": 0.5,
                        "line-width": 1,
                    },
                });

                map.addLayer({
                    id: "arc-stream",
                    type: "line",
                    source: "arcs",
                    paint: {
                        "line-color": "#E879F9",
                        "line-width": 2.5,
                        "line-opacity": 0.9,
                        "line-dasharray": [1, 4],
                    },
                });

                // Node glow
                map.addLayer({
                    id: "node-glow",
                    type: "circle",
                    source: "nodes",
                    paint: {
                        "circle-radius": 16,
                        "circle-color": "#00E0FF",
                        "circle-opacity": 0.35,
                        "circle-blur": 1,
                    },
                });

                // Node core
                map.addLayer({
                    id: "node-core",
                    type: "circle",
                    source: "nodes",
                    paint: {
                        "circle-radius": 6,
                        "circle-color": "#00E0FF",
                        "circle-opacity": 1,
                        "circle-stroke-width": 3,
                        "circle-stroke-color": "#A855F7",
                    },
                });

                // Animation with momentum
                let lastTime = 0;

                const animate = (time: number) => {
                    if (!mapInstanceRef.current) return;

                    const delta = lastTime ? time - lastTime : 16;
                    lastTime = time;

                    // Only auto-rotate when not interacting and no momentum animation
                    if (!isUserInteracting && !momentumAnimating) {
                        currentLng += delta * 0.002;
                        map.setCenter([currentLng, map.getCenter().lat]);
                    }

                    // Node glow pulse
                    const pulse = Math.sin(time * 0.003);
                    map.setPaintProperty("node-glow", "circle-radius", 16 + pulse * 6);
                    map.setPaintProperty("node-glow", "circle-opacity", 0.35 + pulse * 0.15);

                    // Animate arc streaming effect
                    dashOffsetRef.current = (dashOffsetRef.current + delta * 0.01) % 5;
                    const dashPhase = dashOffsetRef.current;
                    map.setPaintProperty("arc-stream", "line-dasharray", [1, 4 - dashPhase * 0.5]);

                    animationRef.current = requestAnimationFrame(animate);
                };

                animationRef.current = requestAnimationFrame(animate);
            });
        });

        return () => {
            cancelAnimationFrame(animationRef.current);
            if (mapInstanceRef.current) {
                // Remove resize listener
                const handler = (mapInstanceRef.current as any)._resizeHandler;
                if (handler) {
                    window.removeEventListener("resize", handler);
                }
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            isInitializedRef.current = false;
        };
    }, []);

    // Update map data when realNodes changes
    useEffect(() => {
        if (!mapInstanceRef.current || !mapLoaded) return;
        if (realNodes.length === 0) return;

        const map = mapInstanceRef.current;

        // Build updated GeoJSON
        const nodesGeoJSON = {
            type: "FeatureCollection",
            features: realNodes.map((node) => ({
                type: "Feature",
                properties: { id: node.ip, city: node.city, country: node.country },
                geometry: { type: "Point", coordinates: [node.lng, node.lat] },
            })),
        };

        const arcsGeoJSON = {
            type: "FeatureCollection",
            features: [], // No arcs for real data - we don't have traffic info
        };

        // Update sources
        const nodesSource = map.getSource("nodes");
        const arcsSource = map.getSource("arcs");

        if (nodesSource) {
            nodesSource.setData(nodesGeoJSON);
            console.log(`[Globe] Updated to ${realNodes.length} real nodes`);
        }
        if (arcsSource) {
            arcsSource.setData(arcsGeoJSON);
        }
    }, [realNodes, mapLoaded]);

    return (
        <div className={cn(
            // Use relative positioning when contained, otherwise fixed full-screen
            contained ? "relative w-full h-full" : "fixed inset-0 z-10",
            className
        )}>
            <div
                ref={mapContainerRef}
                className="w-full h-full"
            />
            {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-brand-cyan font-mono animate-pulse text-xl">Loading Globe...</div>
                </div>
            )}
        </div>
    );
}
