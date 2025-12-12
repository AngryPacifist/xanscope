"use client";

import { useEffect, useState } from "react";
import { Activity, HardDrive, Network, Zap, Database, Cpu, BarChart3, ChevronDown } from "lucide-react";
import { HolographicCard, MetricValue } from "@/components/ui/holographic-card";
import { MapboxGlobe } from "@/components/visuals/mapbox-globe";
import { Starfield } from "@/components/visuals/starfield";
import { HudOverlay } from "@/components/visuals/hud-overlay";
import { fetchNetworkOverview, fetchActivityFeed } from "@/lib/data-service";
import type { NetworkOverview, ActivityFeedItem } from "@/lib/types";

const generateFeedItem = (): ActivityFeedItem => {
  const titles = [
    "Tokyo Hub synced", "NYC Gateway heartbeat", "London Node verified",
    "Storage allocation", "Peer discovery", "Block propagated",
    "Shard replicated", "Validator online", "Consensus reached",
  ];
  const descriptions = [
    "Performance score: 0.98", "Latency: 12ms avg", "Storage: 2.4TB allocated",
    "Replication factor: 3x", "Gossip round complete", "Block height: 1,247,891",
  ];

  return {
    id: `feed-${Date.now()}-${Math.random()}`,
    type: "node",
    title: titles[Math.floor(Math.random() * titles.length)],
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    timestamp: new Date().toISOString(),
    severity: "info",
  };
};

// Corner accent component for the mobile globe container
function CornerAccents() {
  return (
    <>
      {/* Top Left */}
      <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-brand-cyan/60" />
      {/* Top Right */}
      <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-brand-cyan/60" />
      {/* Bottom Left */}
      <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-brand-cyan/60" />
      {/* Bottom Right */}
      <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-brand-cyan/60" />
    </>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<NetworkOverview | null>(null);
  const [activity, setActivity] = useState<ActivityFeedItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    Promise.all([fetchNetworkOverview(), fetchActivityFeed()]).then(
      ([overviewData, activityData]) => {
        setOverview(overviewData);
        setActivity(activityData);
      }
    );
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const feedInterval = setInterval(() => {
      setActivity(prev => [generateFeedItem(), ...prev.slice(0, 9)]);
    }, 4000);
    return () => clearInterval(feedInterval);
  }, []);

  if (!overview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-brand-cyan font-mono animate-pulse text-2xl tracking-widest">
          INITIALIZING...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ===== MOBILE LAYOUT (< lg) ===== */}
      <div className="lg:hidden min-h-screen bg-brand-black">
        {/* Contained Globe Section */}
        <div className="px-4 pt-20 pb-4">
          <div className="relative aspect-square max-h-[50vh] w-full rounded-lg overflow-hidden border border-white/10 bg-black/40">
            <CornerAccents />
            <MapboxGlobe contained />
          </div>
        </div>

        {/* Scrollable Stats Section */}
        <div className="px-4 pb-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-sm text-white/80 tracking-widest uppercase">Network Overview</h2>
            <div className="font-mono text-lg text-white tabular-nums">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="space-y-3">
            {/* Active Nodes - Large display */}
            <div className="p-4 rounded-lg bg-black/60 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Network size={16} className="text-brand-cyan" />
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Active Nodes</span>
              </div>
              <div className="font-mono text-4xl font-bold text-white">{overview.onlineNodes}</div>
              <div className="font-mono text-xs text-white/40 mt-1">of {overview.totalNodes} total nodes</div>
            </div>

            {/* Storage - Large display */}
            <div className="p-4 rounded-lg bg-black/60 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive size={16} className="text-brand-purple" />
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Total Storage</span>
              </div>
              <div className="font-mono text-4xl font-bold text-white">{overview.capacityTb} <span className="text-lg text-white/60">TB</span></div>
              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-[#00E0FF] via-[#7C3AED] to-[#A855F7] rounded-full" />
              </div>
            </div>

            {/* Two-column stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-black/60 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-brand-success" />
                  <span className="font-mono text-[9px] text-white/50 uppercase tracking-widest">Uptime</span>
                </div>
                <div className="font-mono text-2xl font-bold text-white">{overview.uptimePercent}%</div>
              </div>

              <div className="p-4 rounded-lg bg-black/60 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Database size={14} className="text-amber-400" />
                  <span className="font-mono text-[9px] text-white/50 uppercase tracking-widest">Filesystems</span>
                </div>
                <div className="font-mono text-2xl font-bold text-white">{overview.totalFilesystems}</div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Activity, value: "8ms", label: "Latency" },
                { icon: BarChart3, value: "2.4 GB/s", label: "Throughput" },
                { icon: Network, value: "3x", label: "Replication" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
                  <Icon size={14} className="text-brand-cyan/70 mx-auto mb-1" />
                  <div className="font-mono text-sm font-bold text-white">{value}</div>
                  <div className="font-mono text-[7px] text-white/40 uppercase">{label}</div>
                </div>
              ))}
            </div>

            {/* Activity Feed */}
            <div className="p-4 rounded-lg bg-black/60 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-brand-purple" />
                  <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Live Feed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                  <span className="font-mono text-[8px] text-brand-success">LIVE</span>
                </div>
              </div>
              <div className="space-y-2">
                {activity.slice(0, 4).map((item, index) => (
                  <div
                    key={item.id}
                    className="p-2 rounded bg-white/5 border border-white/5"
                    style={{ opacity: 1 - (index * 0.2) }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[10px] text-white font-medium truncate">{item.title}</div>
                        <div className="font-mono text-[8px] text-white/60 truncate">{item.description}</div>
                      </div>
                      <div className="font-mono text-[8px] text-white/40 shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour12: false })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= lg) ===== */}
      <div className="hidden lg:block relative min-h-screen overflow-hidden">
        {/* Background layers */}
        <Starfield starCount={150} />
        <HudOverlay />
        <MapboxGlobe />

        {/* Content overlay */}
        <div className="relative z-20 min-h-screen pointer-events-none">

          {/* Top section - Clock */}
          <div className="flex justify-end px-8 pt-20 pointer-events-auto">
            <div className="text-right">
              <div className="font-mono text-4xl text-white tracking-wider tabular-nums">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
              <div className="font-mono text-xs text-white/40 tracking-widest mt-1">
                UTC{currentTime.getTimezoneOffset() <= 0 ? '+' : ''}{-currentTime.getTimezoneOffset() / 60}
              </div>
            </div>
          </div>

          {/* Main content - Cards float on sides */}
          <div className="flex justify-between items-start px-8 mt-6">

            {/* Left Column - Stats */}
            <div className="w-64 xl:w-72 space-y-3 pointer-events-auto max-h-[calc(100vh-260px)] overflow-y-auto scrollbar-hide">
              <HolographicCard active className="backdrop-blur-xl bg-black/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded bg-brand-cyan/20">
                    <Network size={16} className="text-brand-cyan" />
                  </div>
                  <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Active Nodes</span>
                </div>
                <MetricValue value={overview.onlineNodes.toString()} label="" />
                <div className="mt-2 text-[10px] font-mono text-white/50">of {overview.totalNodes} total nodes</div>
              </HolographicCard>

              <HolographicCard className="backdrop-blur-xl bg-black/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded bg-brand-purple/20">
                    <HardDrive size={16} className="text-brand-purple" />
                  </div>
                  <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Storage</span>
                </div>
                <MetricValue value={`${overview.capacityTb} TB`} label="" />
                <div className="mt-3 h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-[#00E0FF] via-[#7C3AED] to-[#A855F7] rounded-full shadow-[0_0_10px_rgba(0,224,255,0.5)]" />
                </div>
              </HolographicCard>

              <HolographicCard className="backdrop-blur-xl bg-black/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded bg-brand-success/20">
                    <Zap size={16} className="text-brand-success" />
                  </div>
                  <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Uptime</span>
                </div>
                <MetricValue value={`${overview.uptimePercent}%`} label="" />
              </HolographicCard>

              <HolographicCard className="backdrop-blur-xl bg-black/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded bg-amber-500/20">
                    <Database size={16} className="text-amber-400" />
                  </div>
                  <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Filesystems</span>
                </div>
                <MetricValue value={overview.totalFilesystems.toString()} label="" />
              </HolographicCard>
            </div>

            {/* Right Column - Activity Feed */}
            <div className="w-72 xl:w-80 pointer-events-auto">
              <HolographicCard className="backdrop-blur-xl bg-black/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-brand-purple" />
                    <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Live Feed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                    <span className="font-mono text-[9px] text-brand-success">LIVE</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-hidden relative">
                  {activity.slice(0, 7).map((item, index) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded bg-white/5 border border-white/5 hover:border-brand-cyan/30 transition-all"
                      style={{ opacity: 1 - (index * 0.1) }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[11px] text-white font-medium truncate">
                            {item.title}
                          </div>
                          <div className="font-mono text-[9px] text-white/80 mt-0.5">
                            {item.description}
                          </div>
                        </div>
                        <div className="font-mono text-[9px] text-white/50 shrink-0 tabular-nums">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour12: false })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
              </HolographicCard>
            </div>
          </div>

          {/* Bottom Stats Row - Fixed but with proper margin/positioning */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <div className="flex gap-3">
              {[
                { icon: Activity, value: "8ms", label: "Read Latency" },
                { icon: BarChart3, value: "2.4 GB/s", label: "Throughput" },
                { icon: Network, value: "3x", label: "Replication" },
                { icon: HardDrive, value: `${(overview.capacityTb / 1000).toFixed(1)} PB`, label: "Total Data" },
                { icon: Cpu, value: `${(overview.averagePerformance * 100).toFixed(0)}%`, label: "Network Health" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="px-4 py-3 bg-black/60 backdrop-blur-xl rounded-lg border border-white/10 flex items-center gap-3">
                  <Icon size={18} className="text-brand-cyan/70" />
                  <div>
                    <div className="font-mono text-lg font-bold text-white tabular-nums">{value}</div>
                    <div className="font-mono text-[8px] text-white/40 uppercase tracking-widest">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
