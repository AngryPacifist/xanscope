"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PNode } from "@/lib/types";
import { HolographicCard } from "@/components/ui/holographic-card";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Search,
  Server,
  HardDrive,
  Clock,
  Wifi,
  LayoutGrid,
  List,
  ChevronRight,
  Zap,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  nodes: PNode[];
};

const STATUS_FILTERS: Array<{ label: string; value: "all" | PNode["status"] }> = [
  { label: "All", value: "all" },
  { label: "Online", value: "online" },
  { label: "Syncing", value: "syncing" },
  { label: "Offline", value: "offline" },
];

// Stability bars based on uptime days
function StabilityBars({ uptimeDays }: { uptimeDays: number }) {
  // Calculate how many bars to fill (8 total)
  // 30+ days = 8 bars (full), 0 days = 1 bar (minimum)
  const filledBars = Math.min(8, Math.max(1, Math.ceil(uptimeDays / 4)));

  return (
    <div className="flex items-end gap-0.5 h-5">
      {Array.from({ length: 8 }).map((_, i) => {
        const isFilled = i < filledBars;
        // Bars grow slightly in height to create visual hierarchy
        const height = 40 + (i * 8);
        return (
          <div
            key={i}
            className="w-1.5 rounded-sm transition-colors"
            style={{
              height: `${height}%`,
              backgroundColor: isFilled ? '#22C55E' : 'rgba(255,255,255,0.1)'
            }}
          />
        );
      })}
    </div>
  );
}

// Node Card Component
function NodeCard({ node, index }: { node: PNode; index: number }) {
  const statusColors = {
    online: "text-brand-success",
    syncing: "text-amber-400",
    offline: "text-red-400",
  };

  const statusBg = {
    online: "bg-brand-success/20",
    syncing: "bg-amber-500/20",
    offline: "bg-red-500/20",
  };

  return (
    <Link href={`/nodes/${node.id}`}>
      <HolographicCard
        className={cn(
          "backdrop-blur-xl bg-black/40 hover:bg-black/50 transition-all duration-300",
          "hover:border-brand-cyan/40 hover:shadow-[0_0_30px_rgba(0,224,255,0.1)]",
          "group cursor-pointer"
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-lg", statusBg[node.status])}>
              <Server size={18} className={statusColors[node.status]} />
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors">
                {node.label}
              </h3>
              <p className="font-mono text-[10px] text-white/40 mt-0.5">
                {node.address}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/30 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
        </div>

        {/* Status + Region */}
        <div className="flex items-center gap-2 mb-4">
          <StatusPill label={node.status} variant={node.status} />
          <span className="font-mono text-[10px] text-white/40 flex items-center gap-1">
            <Globe size={10} />
            {node.country}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <HardDrive size={10} className="text-brand-purple" />
              <span className="font-mono text-[9px] text-white/50 uppercase">Storage</span>
            </div>
            <div className="font-mono text-sm font-bold text-white">{node.storageTb} TB</div>
          </div>

          <div className="p-2 rounded-lg bg-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={10} className="text-brand-cyan" />
              <span className="font-mono text-[9px] text-white/50 uppercase">Score</span>
            </div>
            <div className="font-mono text-sm font-bold text-white">
              {(node.performanceScore * 100).toFixed(0)}%
            </div>
          </div>

          <div className="p-2 rounded-lg bg-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={10} className="text-brand-success" />
              <span className="font-mono text-[9px] text-white/50 uppercase">Uptime</span>
            </div>
            <div className="font-mono text-sm font-bold text-white">
              {node.uptimePercentage.toFixed(1)}%
            </div>
          </div>

          <div className="p-2 rounded-lg bg-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={10} className="text-amber-400" />
              <span className="font-mono text-[9px] text-white/50 uppercase">Stability</span>
            </div>
            <StabilityBars uptimeDays={node.uptimeDays} />
          </div>
        </div>

        {/* Footer - Version */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="font-mono text-[10px] text-white/40">{node.release}</span>
          <span className="font-mono text-[10px] text-brand-cyan">v{node.version}</span>
        </div>
      </HolographicCard>
    </Link>
  );
}

// Table Row Component for list view
function NodeTableRow({ node }: { node: PNode }) {
  return (
    <Link href={`/nodes/${node.id}`} className="contents">
      <tr className="hover:bg-white/5 cursor-pointer group transition-colors">
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <Server size={16} className="text-brand-cyan/60" />
            <div>
              <span className="font-mono text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors">
                {node.label}
              </span>
              <p className="font-mono text-[10px] text-white/40">{node.address}</p>
            </div>
          </div>
        </td>
        <td className="px-5 py-4">
          <span className="font-mono text-xs text-white/70">{node.country}</span>
          <p className="font-mono text-[10px] text-white/40">{node.region}</p>
        </td>
        <td className="px-5 py-4">
          <span className="font-mono text-xs font-semibold text-white">{node.release}</span>
          <p className="font-mono text-[10px] text-white/40">v{node.version}</p>
        </td>
        <td className="px-5 py-4 font-mono text-sm text-white">
          {node.storageTb} TB
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full"
                style={{ width: `${node.performanceScore * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-white/70">
              {(node.performanceScore * 100).toFixed(0)}%
            </span>
          </div>
        </td>
        <td className="px-5 py-4">
          <StatusPill label={node.status} variant={node.status} />
        </td>
      </tr>
    </Link>
  );
}

export function NodesClient({ nodes }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]["value"]>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    return nodes.filter((node) => {
      const matchesQuery =
        node.label.toLowerCase().includes(query.toLowerCase()) ||
        node.id.toLowerCase().includes(query.toLowerCase()) ||
        node.address.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || node.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [nodes, query, status]);

  // Stats summary
  const stats = useMemo(() => ({
    total: nodes.length,
    online: nodes.filter(n => n.status === "online").length,
    storage: nodes.reduce((acc, n) => acc + n.storageTb, 0),
    avgPerformance: nodes.reduce((acc, n) => acc + n.performanceScore, 0) / nodes.length,
  }), [nodes]);

  return (
    <div className="space-y-6">
      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Nodes", value: stats.total.toString(), icon: Server, color: "text-brand-cyan" },
          { label: "Online", value: stats.online.toString(), icon: Wifi, color: "text-brand-success" },
          { label: "Total Storage", value: `${stats.storage.toFixed(2)} TB`, icon: HardDrive, color: "text-brand-purple" },
          { label: "Avg Performance", value: `${(stats.avgPerformance * 100).toFixed(0)}%`, icon: Zap, color: "text-amber-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">{label}</span>
            </div>
            <div className="font-mono text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes by name, address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm font-mono text-white placeholder:text-white/30 outline-none focus:border-brand-cyan/50 transition-colors"
            />
          </div>

          {/* Filters + View Toggle */}
          <div className="flex items-center gap-4">
            {/* Status Filters */}
            <div className="flex gap-1">
              {STATUS_FILTERS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setStatus(item.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all",
                    status === item.value
                      ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30"
                      : "bg-white/5 text-white/50 border border-transparent hover:text-white hover:bg-white/10"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "grid" ? "bg-white/10 text-brand-cyan" : "text-white/40 hover:text-white"
                )}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "list" ? "bg-white/10 text-brand-cyan" : "text-white/40 hover:text-white"
                )}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-white/40">
          Showing <span className="text-white">{filtered.length}</span> of {nodes.length} nodes
        </p>
      </div>

      {/* Nodes Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((node, index) => (
            <NodeCard key={node.id} node={node} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-white/50">Node</th>
                  <th className="px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-white/50">Region</th>
                  <th className="px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-white/50">Release</th>
                  <th className="px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-white/50">Storage</th>
                  <th className="px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-white/50">Performance</th>
                  <th className="px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-white/50">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((node) => (
                  <NodeTableRow key={node.id} node={node} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Server size={48} className="mx-auto text-white/20 mb-4" />
          <p className="font-mono text-white/40">No nodes match your search</p>
        </div>
      )}
    </div>
  );
}
