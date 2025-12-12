
"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

interface InteractiveGlobeProps {
    className?: string;
}

export function InteractiveGlobe({ className }: InteractiveGlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;
        let width = 0;
        let pointerInteracting = 0;
        let pointerInteractionMovement = 0;
        let pointerX = 0;

        if (!canvasRef.current) return;

        const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
        window.addEventListener('resize', onResize);
        onResize();

        // Particle System for "Data Packets"
        const packetCount = 12; // More packets
        const packets = Array.from({ length: packetCount }, () => ({
            lat: (Math.random() - 0.5) * 160,
            lng: (Math.random() - 0.5) * 360,
            targetLat: (Math.random() - 0.5) * 160,
            targetLng: (Math.random() - 0.5) * 360,
            progress: Math.random(),
            speed: 0.005 + Math.random() * 0.01,
        }));

        const globeMarkers: { location: [number, number]; size: number }[] = [
            { location: [35.6762, 139.6503], size: 0.08 }, // Tokyo
            { location: [40.7128, -74.0060], size: 0.08 }, // NYC
            { location: [51.5074, -0.1278], size: 0.08 }, // London
            { location: [1.3521, 103.8198], size: 0.08 }, // Singapore
            { location: [-33.8688, 151.2093], size: 0.08 }, // Sydney
            { location: [52.5200, 13.4050], size: 0.08 }, // Berlin
            // Packets
            ...packets.map(() => ({ location: [0, 0] as [number, number], size: 0 }))
        ];

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 20000,
            mapBrightness: 8,
            baseColor: [0.1, 0.1, 0.15],
            markerColor: [0, 1, 1.2],
            glowColor: [0.15, 0.15, 0.25],
            opacity: 0.85,
            markers: globeMarkers,
            onRender: (state) => {
                if (!pointerInteracting) {
                    phi += 0.003;
                }
                state.phi = phi + pointerInteractionMovement;
                state.width = width * 2;
                state.height = width * 2;

                // Animate Packets using local variable `globeMarkers`
                const packetMarkers = globeMarkers.slice(globeMarkers.length - packetCount);
                packetMarkers.forEach((m, i) => {
                    const p = packets[i];
                    if (!p) return;

                    p.progress += p.speed;
                    if (p.progress > 1) {
                        p.progress = 0;
                        p.lat = p.targetLat;
                        p.lng = p.targetLng;
                        p.targetLat = (Math.random() - 0.5) * 160;
                        p.targetLng = (Math.random() - 0.5) * 360;
                    }

                    // Lerp
                    const lat = p.lat + (p.targetLat - p.lat) * p.progress;
                    const lng = p.lng + (p.targetLng - p.lng) * p.progress;

                    m.location = [lat, lng];
                    m.size = (Math.sin(p.progress * Math.PI) * 0.06) + 0.02;
                });
            },
        });

        const canvas = canvasRef.current;
        if (!canvas) return; // Safety check

        const onPointerDown = (e: PointerEvent) => {
            pointerInteracting = 1;
            pointerX = e.clientX;
            canvas.style.cursor = 'grabbing';
        };

        const onPointerUp = () => {
            pointerInteracting = 0;
            phi += pointerInteractionMovement;
            pointerInteractionMovement = 0;
            canvas.style.cursor = 'grab';
        };

        const onPointerMove = (e: PointerEvent) => {
            if (pointerInteracting) {
                pointerInteractionMovement = (e.clientX - pointerX) / 200;
            }
        };

        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointerout', onPointerUp); // Treat pointer leaving as up
        canvas.addEventListener('pointermove', onPointerMove);

        setTimeout(() => canvasRef.current?.style.setProperty('opacity', '1'));

        return () => {
            globe.destroy();
            window.removeEventListener('resize', onResize);
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointerup', onPointerUp);
            canvas.removeEventListener('pointerout', onPointerUp);
            canvas.removeEventListener('pointermove', onPointerMove);
        };
    }, []);

    return (
        <div className={cn("relative w-full aspect-square max-w-[600px] mx-auto opacity-0 transition-opacity duration-1000", className)}>
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
            />
        </div>
    );
}
