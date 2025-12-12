"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import * as THREE from "three";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface NetworkGlobe3DProps {
    className?: string;
}

// Node locations
const NODES = [
    { id: "tokyo", lat: 35.6762, lng: 139.6503, size: 0.8 },
    { id: "nyc", lat: 40.7128, lng: -74.006, size: 1.0 },
    { id: "london", lat: 51.5074, lng: -0.1278, size: 0.9 },
    { id: "singapore", lat: 1.3521, lng: 103.8198, size: 0.7 },
    { id: "sydney", lat: -33.8688, lng: 151.2093, size: 0.6 },
    { id: "berlin", lat: 52.52, lng: 13.405, size: 0.75 },
    { id: "dubai", lat: 25.2048, lng: 55.2708, size: 0.65 },
    { id: "saopaulo", lat: -23.5505, lng: -46.6333, size: 0.7 },
    { id: "mumbai", lat: 19.076, lng: 72.8777, size: 0.8 },
    { id: "la", lat: 34.0522, lng: -118.2437, size: 0.85 },
    { id: "paris", lat: 48.8566, lng: 2.3522, size: 0.7 },
    { id: "seoul", lat: 37.5665, lng: 126.978, size: 0.75 },
];

// Arcs
const ARCS = [
    { start: "nyc", end: "london" },
    { start: "london", end: "berlin" },
    { start: "tokyo", end: "singapore" },
    { start: "singapore", end: "sydney" },
    { start: "nyc", end: "la" },
    { start: "la", end: "tokyo" },
    { start: "london", end: "dubai" },
    { start: "dubai", end: "mumbai" },
    { start: "mumbai", end: "singapore" },
    { start: "saopaulo", end: "nyc" },
    { start: "berlin", end: "tokyo" },
    { start: "paris", end: "nyc" },
    { start: "seoul", end: "tokyo" },
].map(({ start, end }) => {
    const startNode = NODES.find(n => n.id === start)!;
    const endNode = NODES.find(n => n.id === end)!;
    return {
        startLat: startNode.lat,
        startLng: startNode.lng,
        endLat: endNode.lat,
        endLng: endNode.lng,
        color: ["rgba(0, 224, 255, 0.6)", "rgba(168, 85, 247, 0.3)"],
    };
});

// Create FULLY OPAQUE dark blue material for ocean
const globeMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color(0x0a1628), // Dark navy blue
    transparent: false, // FULLY OPAQUE
    opacity: 1.0,
});

export function NetworkGlobe3D({ className }: NetworkGlobe3DProps) {
    const globeRef = useRef<any>(null);
    const [globeReady, setGlobeReady] = useState(false);
    const [countries, setCountries] = useState<any>({ features: [] });
    const [dimensions, setDimensions] = useState({ width: 700, height: 700 });

    // Load country polygons
    useEffect(() => {
        fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
            .then(res => res.json())
            .then(data => {
                import("topojson-client").then(topojson => {
                    const geoData = topojson.feature(data, data.objects.countries);
                    setCountries(geoData);
                });
            })
            .catch(err => console.error("Failed to load countries:", err));
    }, []);

    // Responsive sizing
    useEffect(() => {
        const updateDimensions = () => {
            const size = Math.min(window.innerWidth, window.innerHeight) * 0.85;
            setDimensions({ width: size, height: size });
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Configure controls - ZOOM ENABLED
    useEffect(() => {
        if (!globeRef.current || !globeReady) return;

        const controls = globeRef.current.controls();
        if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.4;
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enableZoom = true; // ZOOM ENABLED!
            controls.minDistance = 150;
            controls.maxDistance = 500;
            controls.enablePan = false;
        }

        globeRef.current.pointOfView({ lat: 25, lng: 0, altitude: 2.0 }, 1000);
    }, [globeReady]);

    const pointsData = useMemo(() => NODES.map(node => ({
        lat: node.lat,
        lng: node.lng,
        size: node.size,
        id: node.id,
    })), []);

    return (
        <div className={cn("relative cursor-grab active:cursor-grabbing", className)}>
            <Globe
                ref={globeRef}
                onGlobeReady={() => setGlobeReady(true)}

                // Solid dark blue ocean - NO texture
                globeImageUrl=""
                globeMaterial={globeMaterial}
                showGlobe={true}

                // Blue atmosphere
                showAtmosphere={true}
                atmosphereColor="#3B82F6"
                atmosphereAltitude={0.15}

                backgroundColor="rgba(0,0,0,0)"

                // Country polygons - slightly lighter for contrast
                polygonsData={countries.features}
                polygonCapColor={() => "rgba(18, 30, 48, 1)"} // Fully opaque land
                polygonSideColor={() => "rgba(25, 40, 60, 1)"}
                polygonStrokeColor={() => "rgba(70, 100, 150, 0.6)"}
                polygonAltitude={0.005}

                // NO LABELS - testing if this fixes lag
                labelsData={[]}

                // Node points
                pointsData={pointsData}
                pointLat="lat"
                pointLng="lng"
                pointColor={() => "#00E0FF"}
                pointAltitude={0.02}
                pointRadius={0.6}

                // Arcs
                arcsData={ARCS}
                arcStartLat="startLat"
                arcStartLng="startLng"
                arcEndLat="endLat"
                arcEndLng="endLng"
                arcColor="color"
                arcDashLength={0.5}
                arcDashGap={0.25}
                arcDashAnimateTime={2500}
                arcStroke={0.4}
                arcAltitudeAutoScale={0.35}

                width={dimensions.width}
                height={dimensions.height}
            />
        </div>
    );
}
