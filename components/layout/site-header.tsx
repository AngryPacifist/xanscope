"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Server, HardDrive, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/nodes", label: "Nodes", icon: Server },
  { href: "/fs", label: "Filesystems", icon: HardDrive },
  { href: "/operators", label: "Operators", icon: Users },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Mobile: Centered nav */}
      <div className="lg:hidden pointer-events-auto px-4 py-3 flex justify-center">
        <nav className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10">
          {NAV_ITEMS.map(({ href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-full transition-all",
                  isActive
                    ? "bg-brand-cyan/20 text-brand-cyan"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop: Full layout with brand and nav */}
      <div className="hidden lg:flex pointer-events-auto px-6 py-4 items-center justify-between">
        {/* XANDEUM Logo + Text - Left side, hidden on homepage */}
        {!isHome ? (
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/favicon.png" alt="Xandeum" className="w-5 h-5" />
            <span className="font-mono text-[10px] text-brand-cyan uppercase tracking-[0.3em]">
              XANDEUM
            </span>
          </Link>
        ) : (
          <div className="w-24" /> /* Spacer for balance */
        )}

        {/* Centered nav */}
        <nav className="flex items-center gap-1 p-1 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-xs tracking-wider transition-all",
                  isActive
                    ? "bg-brand-cyan/20 text-brand-cyan"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={14} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Empty right side for balance */}
        <div className="w-20" />
      </div>
    </header>
  );
}
