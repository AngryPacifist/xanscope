import { cn } from "@/lib/utils";

type StatusVariant = "online" | "offline" | "syncing" | "default";

const variantStyles: Record<StatusVariant, string> = {
  online: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30",
  offline: "bg-rose-500/10 text-rose-300 border border-rose-400/20",
  syncing: "bg-amber-500/10 text-amber-300 border border-amber-400/30",
  default: "bg-slate-700 text-slate-200 border border-white/10",
};

type StatusPillProps = {
  label: string;
  variant?: StatusVariant;
};

export function StatusPill({ label, variant = "default" }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        variantStyles[variant]
      )}
    >
      {label}
    </span>
  );
}
