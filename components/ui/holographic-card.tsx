
"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface HolographicCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    active?: boolean;
}

export function HolographicCard({
    children,
    className,
    active = false,
    ...props
}: HolographicCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "relative rounded-xl border border-white/10 bg-[#080c14]/80 p-6 backdrop-blur-md",
                "shadow-[0_4px_20px_rgba(0,0,0,0.5)]",
                "overflow-hidden transition-all duration-300 group",
                "hover:border-brand-cyan/50 hover:shadow-[0_0_15px_rgba(0,224,255,0.1)]",
                active && "border-brand-cyan shadow-[0_0_20px_rgba(0,224,255,0.2)]",
                className
            )}
            {...props}
        >
            {/* Scanline Effect on Hover */}
            <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 hover:opacity-10 bg-[linear-gradient(transparent_0%,_var(--color-brand-cyan)_50%,_transparent_100%)] bg-[length:100%_200%] animate-scanline" />

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}

export function MetricValue({
    value,
    label,
    trend,
}: {
    value: string;
    label: string;
    trend?: "up" | "down" | "neutral";
}) {
    return (
        <div>
            <div className="text-sm text-text-muted uppercase tracking-wider font-semibold mb-1">
                {label}
            </div>
            <div className="text-4xl font-bold tracking-tight font-mono text-white text-glow">
                {value}
            </div>
            {trend && (
                <div
                    className={cn(
                        "text-xs mt-1",
                        trend === "up" ? "text-brand-success" : "text-brand-error"
                    )}
                >
                    {trend === "up" ? "↑" : "↓"} Trending
                </div>
            )}
        </div>
    );
}
