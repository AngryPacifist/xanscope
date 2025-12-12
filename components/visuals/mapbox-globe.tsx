"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { GLOBE_NODES, GLOBE_ARCS, mockPnodes } from "@/lib/mock-data";

import "mapbox-gl/dist/mapbox-gl.css";

interface MapboxGlobeProps {
    className?: string;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW5ncnlwYWNpZmlzdCIsImEiOiJjbWoyNXlmZDAwams5M2dzYm5mcmUyNHAzIn0.FWl2l-P9o1badVVrzmqg4g";

// Use data from mock-data.ts
const NODES = GLOBE_NODES;

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


export function MapboxGlobe({ className }: MapboxGlobeProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const isInitializedRef = useRef(false);
    const animationRef = useRef<number>(0);
    const [mapLoaded, setMapLoaded] = useState(false);

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
                zoom: 2.1,
                minZoom: 1.5,
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

            // Resize handler
            const handleResize = () => map?.resize();
            window.addEventListener("resize", handleResize);

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

                // Data sources
                const nodesGeoJSON = {
                    type: "FeatureCollection",
                    features: NODES.map(node => ({
                        type: "Feature",
                        properties: { id: node.id, status: node.status },
                        geometry: { type: "Point", coordinates: [node.lng, node.lat] },
                    })),
                };

                const arcsGeoJSON = {
                    type: "FeatureCollection",
                    features: GLOBE_ARCS.map(([startId, endId]: [string, string]) => {
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

                    const pulse = Math.sin(time * 0.003);
                    map.setPaintProperty("node-glow", "circle-radius", 16 + pulse * 6);
                    map.setPaintProperty("node-glow", "circle-opacity", 0.35 + pulse * 0.15);

                    animationRef.current = requestAnimationFrame(animate);
                };

                animationRef.current = requestAnimationFrame(animate);
            });
        });

        return () => {
            cancelAnimationFrame(animationRef.current);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            isInitializedRef.current = false;
        };
    }, []);

    return (
        <div className={cn("fixed inset-0 z-10", className)}>
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
