import Link from "next/link";
import { MainNav } from "./main-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030a2a]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-semibold tracking-tight text-white"
        >
          Xandeum
        </Link>
        <MainNav />
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-semibold uppercase tracking-wide text-cyan-200 md:inline">
            Live telemetry
          </span>
          <Link
            href="https://xandeum.network"
            target="_blank"
            className="rounded-full border border-white/20 px-4 py-1 text-sm font-medium text-white transition hover:border-white/60"
          >
            Network
          </Link>
        </div>
      </div>
    </header>
  );
}
