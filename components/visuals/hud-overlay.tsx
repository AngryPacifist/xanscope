"use client";

import { cn } from "@/lib/utils";

interface HudOverlayProps {
    className?: string;
}

export function HudOverlay({ className }: HudOverlayProps) {
    return (
        <div className={cn("fixed inset-0 pointer-events-none z-40 overflow-hidden", className)}>
            {/* Subtle scanlines */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 224, 255, 0.05) 2px,
            rgba(0, 224, 255, 0.05) 4px
          )`,
                }}
            />

            {/* Vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.4) 100%)`,
                }}
            />

            {/* Corner brackets with text INSIDE */}

            {/* Top Left - XANDEUM */}
            <div className="absolute top-4 left-4">
                <div className="w-20 h-16 border-l-2 border-t-2 border-brand-cyan/30 relative">
                    <div className="absolute top-2 left-2 font-mono text-[9px] text-brand-cyan/70 tracking-widest font-semibold">
                        XANDEUM
                    </div>
                </div>
            </div>

            {/* Top Right - MAINNET with status */}
            <div className="absolute top-4 right-4">
                <div className="w-20 h-16 border-r-2 border-t-2 border-brand-cyan/30 relative">
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                        <span className="font-mono text-[9px] text-brand-success/90 tracking-widest">MAINNET</span>
                    </div>
                </div>
            </div>

            {/* Bottom Left - XANSCOPE */}
            <div className="absolute bottom-4 left-4">
                <div className="w-20 h-16 border-l-2 border-b-2 border-brand-cyan/30 relative">
                    <div className="absolute bottom-2 left-2 font-mono text-[9px] text-white/40 tracking-widest">
                        XANSCOPE
                    </div>
                </div>
            </div>

            {/* Bottom Right - VERSION */}
            <div className="absolute bottom-4 right-4">
                <div className="w-16 h-16 border-r-2 border-b-2 border-brand-cyan/30 relative">
                    <div className="absolute bottom-2 right-2 font-mono text-[9px] text-white/40 tracking-widest">
                        v2.0.4
                    </div>
                </div>
            </div>

            {/* Horizontal scan line */}
            <div
                className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent animate-scan"
            />
        </div>
    );
}
