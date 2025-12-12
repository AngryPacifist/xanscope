"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  X,
  Server,
  Search,
  Shield,
  Zap,
  HardDrive,
  Clock,
  TrendingUp,
  Activity,
  Users
} from "lucide-react";
import { PNode, NetworkOverview } from "@/lib/types";
import { HolographicCard } from "@/components/ui/holographic-card";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import { getTrackedNodes, saveTrackedNodes } from "./tracker-storage";

interface OperatorsClientProps {
  nodes: PNode[];
  overview: NetworkOverview;
}

// Stats card
function StatsCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <HolographicCard className="backdrop-blur-xl bg-black/40">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon size={16} className="text-white" />
        </div>
        <div>
          <div className="font-mono text-[10px] text-white/50 uppercase tracking-wider">{label}</div>
          <div className="font-mono text-xl font-bold text-white">{value}</div>
        </div>
      </div>
    </HolographicCard>
  );
}

// Node selection dropdown
function NodeSelector({
  nodes,
  trackedIds,
  onAdd
}: {
  nodes: PNode[];
  trackedIds: string[];
  onAdd: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const availableNodes = useMemo(() =>
    nodes.filter(n =>
      !trackedIds.includes(n.id) &&
      (n.label.toLowerCase().includes(search.toLowerCase()) ||
        n.id.toLowerCase().includes(search.toLowerCase()))
    ).slice(0, 10),
    [nodes, trackedIds, search]
  );

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search and add nodes to track..."
            className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-cyan/50"
          />
        </div>
      </div>

      {isOpen && availableNodes.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 border border-white/10 rounded-lg z-[9999] backdrop-blur-xl max-h-80 overflow-y-auto shadow-2xl">
          {availableNodes.map(node => (
            <button
              key={node.id}
              onClick={() => { onAdd(node.id); setSearch(""); setIsOpen(false); }}
              className="w-full p-3 flex items-center justify-between hover:bg-white/10 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Server size={14} className="text-brand-cyan" />
                <div>
                  <div className="font-mono text-sm text-white">{node.label}</div>
                  <div className="font-mono text-[10px] text-white/40">{node.id}</div>
                </div>
              </div>
              <StatusPill label={node.status} variant={node.status} />
            </button>
          ))}
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}

// Tracked node card
function TrackedNodeCard({ node, onRemove }: { node: PNode; onRemove: () => void }) {
  return (
    <HolographicCard className="backdrop-blur-xl bg-black/40 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Link href={`/nodes/${node.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className={cn(
            "p-2 rounded-lg",
            node.status === "online" ? "bg-brand-success/20" :
              node.status === "syncing" ? "bg-amber-500/20" : "bg-red-500/20"
          )}>
            <Server size={18} className={
              node.status === "online" ? "text-brand-success" :
                node.status === "syncing" ? "text-amber-400" : "text-red-400"
            } />
          </div>
          <div>
            <div className="font-mono text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors">
              {node.label}
            </div>
            <div className="font-mono text-[10px] text-white/40">{node.id}</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <StatusPill label={node.status} variant={node.status} />
          <button
            onClick={onRemove}
            className="p-1 rounded hover:bg-red-500/20 transition-colors"
          >
            <X size={14} className="text-white/30 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-brand-cyan" />
            <span className="font-mono text-[9px] text-white/50 uppercase">Performance</span>
          </div>
          <div className="font-mono text-lg font-bold text-white">
            {(node.performanceScore * 100).toFixed(0)}%
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <HardDrive size={12} className="text-brand-purple" />
            <span className="font-mono text-[9px] text-white/50 uppercase">Storage</span>
          </div>
          <div className="font-mono text-lg font-bold text-white">
            {node.storageTb} TB
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={12} className="text-brand-success" />
            <span className="font-mono text-[9px] text-white/50 uppercase">Uptime</span>
          </div>
          <div className="font-mono text-lg font-bold text-white">
            {node.uptimePercentage.toFixed(1)}%
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity size={12} className="text-amber-400" />
            <span className="font-mono text-[9px] text-white/50 uppercase">Region</span>
          </div>
          <div className="font-mono text-sm font-bold text-white">
            {node.country}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="font-mono text-[10px] text-white/40">
          {node.provider} · {node.release} v{node.version}
        </div>
        <Link
          href={`/nodes/${node.id}`}
          className="font-mono text-[10px] text-brand-cyan hover:underline"
        >
          View Details →
        </Link>
      </div>
    </HolographicCard>
  );
}

export function OperatorsClient({ nodes, overview }: OperatorsClientProps) {
  const [trackedIds, setTrackedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load tracked IDs from storage on mount
  useEffect(() => {
    setTrackedIds(getTrackedNodes());
    setIsLoaded(true);
  }, []);

  // Save to storage when tracked IDs change
  useEffect(() => {
    if (isLoaded) {
      saveTrackedNodes(trackedIds);
    }
  }, [trackedIds, isLoaded]);

  const trackedNodes = useMemo(() =>
    nodes.filter(n => trackedIds.includes(n.id)),
    [nodes, trackedIds]
  );

  const addNode = (id: string) => {
    if (!trackedIds.includes(id)) {
      setTrackedIds([...trackedIds, id]);
    }
  };

  const removeNode = (id: string) => {
    setTrackedIds(trackedIds.filter(tid => tid !== id));
  };

  // Calculate stats for tracked nodes
  const trackedStats = useMemo(() => {
    const online = trackedNodes.filter(n => n.status === "online").length;
    const avgPerf = trackedNodes.length > 0
      ? trackedNodes.reduce((acc, n) => acc + n.performanceScore, 0) / trackedNodes.length
      : 0;
    const totalStorage = trackedNodes.reduce((acc, n) => acc + n.storageTb, 0);
    return { online, avgPerf, totalStorage, total: trackedNodes.length };
  }, [trackedNodes]);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard icon={Users} label="Tracked Nodes" value={trackedStats.total.toString()} color="bg-brand-cyan/20" />
        <StatsCard icon={Shield} label="Online" value={trackedStats.online.toString()} color="bg-brand-success/20" />
        <StatsCard icon={TrendingUp} label="Avg Performance" value={`${(trackedStats.avgPerf * 100).toFixed(0)}%`} color="bg-brand-purple/20" />
        <StatsCard icon={HardDrive} label="Total Storage" value={`${trackedStats.totalStorage} TB`} color="bg-amber-500/20" />
      </div>

      {/* Add Nodes Section - z-index elevated to stack above content below */}
      <div className="relative z-50">
        <HolographicCard className="backdrop-blur-xl bg-black/40 overflow-visible">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={14} className="text-brand-cyan" />
            <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Add Nodes to Track</span>
          </div>
          <NodeSelector nodes={nodes} trackedIds={trackedIds} onAdd={addNode} />
          <p className="mt-3 font-mono text-[10px] text-white/30">
            Node IDs are stored locally in your browser. No wallet or account required.
          </p>
        </HolographicCard>
      </div>

      {/* Tracked Nodes Grid */}
      {trackedNodes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trackedNodes.map(node => (
            <TrackedNodeCard
              key={node.id}
              node={node}
              onRemove={() => removeNode(node.id)}
            />
          ))}
        </div>
      ) : (
        <HolographicCard className="backdrop-blur-xl bg-black/40 text-center py-12">
          <Server size={48} className="mx-auto text-white/10 mb-4" />
          <p className="font-mono text-sm text-white/40 mb-2">No nodes tracked yet</p>
          <p className="font-mono text-[10px] text-white/30">
            Search and add nodes above to build your personal monitoring dashboard
          </p>
        </HolographicCard>
      )}
    </div>
  );
}
