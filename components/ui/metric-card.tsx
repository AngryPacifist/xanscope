import { ReactNode } from "react";
import { Card } from "./card";

type MetricCardProps = {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  accent?: "emerald" | "cyan" | "violet" | "orange";
};

const accentMap: Record<
  NonNullable<MetricCardProps["accent"]>,
  string
> = {
  emerald: "text-emerald-300",
  cyan: "text-cyan-300",
  violet: "text-violet-300",
  orange: "text-orange-300",
};

export function MetricCard({
  label,
  value,
  delta,
  icon,
  accent = "emerald",
}: MetricCardProps) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-widest text-slate-400">
          {label}
        </p>
        {icon}
      </div>
      <div className="text-3xl font-semibold">{value}</div>
      {delta && (
        <p className={`text-sm font-medium ${accentMap[accent]}`}>{delta}</p>
      )}
    </Card>
  );
}
