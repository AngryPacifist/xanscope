"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
  href: string;
  label: string;
};

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Overview" },
  { href: "/network", label: "Network" },
  { href: "/nodes", label: "Nodes" },
  { href: "/fs", label: "File Systems" },
  { href: "/insights", label: "Insights" },
  { href: "/operators", label: "Operators" },
  { href: "/releases", label: "Releases" },
  { href: "/docs", label: "Docs" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
      {NAV_LINKS.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === link.href
            : pathname?.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3 py-1 transition ${
              isActive
                ? "bg-white/10 text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
