"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface StarfieldProps {
    className?: string;
    starCount?: number;
}

interface Star {
    x: number;
    y: number;
    z: number;
    size: number;
    opacity: number;
}

export function Starfield({ className, starCount = 400 }: StarfieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Initialize stars
        const stars: Star[] = [];
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width - width / 2,
                y: Math.random() * height - height / 2,
                z: Math.random() * 1000,
                size: Math.random() * 2,
                opacity: Math.random(),
            });
        }

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const animate = () => {
            ctx.fillStyle = "rgba(5, 10, 16, 0.2)"; // Subtle trail effect
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;

            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];

                // Move star towards viewer
                star.z -= 0.5;

                // Reset star if too close
                if (star.z <= 0) {
                    star.x = Math.random() * width - width / 2;
                    star.y = Math.random() * height - height / 2;
                    star.z = 1000;
                }

                // Project to 2D
                const scale = 500 / star.z;
                const x2d = star.x * scale + centerX;
                const y2d = star.y * scale + centerY;
                const size = star.size * scale;

                // Only draw if on screen
                if (x2d >= 0 && x2d <= width && y2d >= 0 && y2d <= height) {
                    const opacity = Math.min(1, (1000 - star.z) / 500);

                    // Cyan/white gradient based on depth
                    const colorValue = Math.floor(200 + (55 * (1 - star.z / 1000)));
                    ctx.fillStyle = star.z < 300
                        ? `rgba(0, ${colorValue}, 255, ${opacity})`
                        : `rgba(${colorValue}, ${colorValue}, ${colorValue}, ${opacity * 0.7})`;

                    ctx.beginPath();
                    ctx.arc(x2d, y2d, Math.max(0.5, size), 0, Math.PI * 2);
                    ctx.fill();

                    // Add glow for close stars
                    if (star.z < 200) {
                        ctx.beginPath();
                        ctx.arc(x2d, y2d, size * 3, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(0, 224, 255, ${opacity * 0.1})`;
                        ctx.fill();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener("resize", resize);
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [starCount]);

    return (
        <canvas
            ref={canvasRef}
            className={cn("fixed inset-0 pointer-events-none z-0", className)}
        />
    );
}
