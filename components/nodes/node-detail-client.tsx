"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Server,
    HardDrive,
    Clock,
    Zap,
    Globe,
    Cpu,
    MemoryStick,
    Radio,
    ArrowUpDown,
    FolderOpen,
    FileCode,
    Users
} from "lucide-react";
import { HolographicCard } from "@/components/ui/holographic-card";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import type { PNode, PNodeStatSnapshot, PeerNode, FileSystemSummary, FileSystemOperation, PNodeHistoryPoint } from "@/lib/types";

interface NodeDetailClientProps {
    node: PNode;
    stats: PNodeStatSnapshot[];
    peers: PeerNode[];
    filesystems: FileSystemSummary[];
    operations: FileSystemOperation[];
    history: PNodeHistoryPoint[];
}

// Storage Usage Bar - Real data visualization
function StorageUsageBar({ usedTb, committedTb, usagePercent }: { usedTb: number; committedTb: number; usagePercent: number }) {
    // Color based on usage: green (<50%), yellow (50-80%), red (>80%)
    const getBarColor = () => {
        if (usagePercent < 50) return 'from-brand-cyan to-brand-purple';
        if (usagePercent < 80) return 'from-amber-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-white/50">Used</span>
                <span className="font-mono font-bold text-white">{usedTb} TB / {committedTb} TB</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${getBarColor()} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, usagePercent)}%` }}
                />
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-white/40">0%</span>
                <span className="font-mono text-brand-cyan font-bold">{usagePercent.toFixed(1)}% Used</span>
                <span className="font-mono text-white/40">100%</span>
            </div>
        </div>
    );
}

// Stability bars based on uptime days (same as node cards)
function StabilityBars({ uptimeDays }: { uptimeDays: number }) {
    // Calculate how many bars to fill (8 total)
    // 30+ days = 8 bars (full), 0 days = 1 bar (minimum)
    const filledBars = Math.min(8, Math.max(1, Math.ceil(uptimeDays / 4)));

    return (
        <div className="flex items-end gap-1 h-8">
            {Array.from({ length: 8 }).map((_, i) => {
                const isFilled = i < filledBars;
                const height = 40 + (i * 8);
                return (
                    <div
                        key={i}
                        className="w-3 rounded-sm transition-colors"
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

// Stat Card Component
function StatCard({
    icon: Icon,
    label,
    value,
    subValue,
    color = "text-brand-cyan"
}: {
    icon: any;
    label: string;
    value: string;
    subValue?: string;
    color?: string;
}) {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={color} />
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">{label}</span>
            </div>
            <div className="font-mono text-2xl font-bold text-white">{value}</div>
            {subValue && <div className="font-mono text-[10px] text-white/40 mt-1">{subValue}</div>}
        </div>
    );
}

export function NodeDetailClient({
    node,
    stats,
    peers,
    filesystems,
    operations,
    history
}: NodeDetailClientProps) {
    const latestStats = stats.at(-1);
    const attachedFs = filesystems.filter(fs => fs.pinnedNodeId === node.id);
    const nodeOperations = operations.filter(op => op.nodeId === node.id).slice(0, 5);

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
        <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12">
            {/* Back link and header */}
            <div className="mb-8">
                <Link
                    href="/nodes"
                    className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-brand-cyan transition-colors mb-4"
                >
                    <ArrowLeft size={14} />
                    Back to Nodes
                </Link>

                <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", statusBg[node.status])}>
                        <Server size={24} className={statusColors[node.status]} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{node.label}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="font-mono text-sm text-white/50">{node.address}</span>
                            <StatusPill label={node.status} variant={node.status} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
                <StatCard icon={Zap} label="Performance" value={`${(node.performanceScore * 100).toFixed(0)}%`} color="text-brand-cyan" />
                <StatCard icon={Clock} label="Uptime" value={`${node.uptimePercentage.toFixed(1)}%`} color="text-brand-success" />
                <StatCard icon={HardDrive} label="Storage" value={`${node.storageTb} TB`} color="text-brand-purple" />
                <StatCard icon={Globe} label="Region" value={node.country} subValue={node.region} color="text-amber-400" />
                <StatCard icon={Radio} label="Release" value={node.release} subValue={`v${node.version}`} color="text-pink-400" />
                <StatCard icon={Server} label="Provider" value={node.provider} color="text-blue-400" />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3 mb-8">
                {/* Storage & Stability */}
                <HolographicCard className="lg:col-span-2 backdrop-blur-xl bg-black/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <HardDrive size={14} className="text-brand-cyan" />
                                <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Storage & Stability</span>
                            </div>
                            <p className="font-mono text-[10px] text-white/30">Real-time data from pRPC</p>
                        </div>
                        <div className="text-right">
                            <div className="font-mono text-3xl font-bold text-white">{node.storageUsagePercent.toFixed(1)}%</div>
                            <div className="font-mono text-[10px] text-brand-cyan">Storage Usage</div>
                        </div>
                    </div>

                    <StorageUsageBar
                        usedTb={node.storageUsedTb}
                        committedTb={node.storageTb}
                        usagePercent={node.storageUsagePercent}
                    />

                    <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
                        <div>
                            <div className="font-mono text-[10px] text-white/40 uppercase">Uptime</div>
                            <div className="font-mono text-xl font-bold text-white">{Math.floor(node.uptimeDays)}d {Math.floor((node.uptimeDays % 1) * 24)}h</div>
                        </div>
                        <div>
                            <div className="font-mono text-[10px] text-white/40 uppercase mb-2">Stability</div>
                            <StabilityBars uptimeDays={node.uptimeDays} />
                        </div>
                        <div>
                            <div className="font-mono text-[10px] text-white/40 uppercase">Last Heartbeat</div>
                            <div className="font-mono text-xl font-bold text-white">
                                {new Date(node.lastHeartbeat).toLocaleTimeString([], { hour12: false })}
                            </div>
                        </div>
                    </div>
                </HolographicCard>

                {/* Runtime Stats */}
                <HolographicCard className="backdrop-blur-xl bg-black/40">
                    <div className="flex items-center gap-2 mb-4">
                        <Cpu size={14} className="text-brand-purple" />
                        <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Runtime Stats</span>
                    </div>

                    {latestStats ? (
                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-[10px] text-white/50">CPU Usage</span>
                                    <span className="font-mono text-sm font-bold text-white">{latestStats.cpuPercent.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full"
                                        style={{ width: `${latestStats.cpuPercent}%` }}
                                    />
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-[10px] text-white/50">Memory</span>
                                    <span className="font-mono text-sm font-bold text-white">
                                        {latestStats.ramUsedGb.toFixed(1)} / {latestStats.ramTotalGb} GB
                                    </span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-brand-purple to-pink-500 rounded-full"
                                        style={{ width: `${(latestStats.ramUsedGb / latestStats.ramTotalGb) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-white/5 text-center">
                                    <div className="font-mono text-[10px] text-white/50 mb-1">Streams</div>
                                    <div className="font-mono text-xl font-bold text-brand-cyan">{latestStats.activeStreams}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 text-center">
                                    <div className="font-mono text-[10px] text-white/50 mb-1">Packets</div>
                                    <div className="font-mono text-lg font-bold text-white">
                                        <span className="text-brand-success">↑{latestStats.packetsSent}</span>
                                        <span className="text-white/30 mx-1">/</span>
                                        <span className="text-brand-cyan">↓{latestStats.packetsReceived}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="font-mono text-sm text-white/40">No runtime stats available</p>
                    )}
                </HolographicCard>
            </div>

            {/* Bottom Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Attached Filesystems */}
                <HolographicCard className="backdrop-blur-xl bg-black/40">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FolderOpen size={14} className="text-amber-400" />
                            <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Anchored File Systems</span>
                        </div>
                        <Link href="/fs" className="font-mono text-[10px] text-brand-cyan hover:underline">
                            Explore All →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {attachedFs.length ? attachedFs.map(fs => (
                            <Link
                                key={fs.fsid}
                                href={`/fs/${fs.fsid}`}
                                className="block p-3 rounded-lg bg-white/5 border border-white/10 hover:border-brand-cyan/30 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-mono text-sm font-semibold text-white">{fs.label}</span>
                                    <StatusPill label={fs.status} variant={fs.status === "active" ? "online" : fs.status === "idle" ? "syncing" : "offline"} />
                                </div>
                                <div className="font-mono text-[10px] text-white/40">
                                    {fs.fsid} · {fs.totalFiles} files · {(fs.storageUsedGb / 1024).toFixed(2)} TB used
                                </div>
                            </Link>
                        )) : (
                            <p className="font-mono text-sm text-white/40">No file systems pinned to this node</p>
                        )}
                    </div>
                </HolographicCard>

                {/* Peer Pods */}
                <HolographicCard className="backdrop-blur-xl bg-black/40">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={14} className="text-pink-400" />
                        <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Peer Pods</span>
                        <span className="font-mono text-[10px] text-white/30 ml-auto">from get-pods</span>
                    </div>

                    <div className="space-y-3">
                        {peers.length ? peers.map(peer => (
                            <div key={peer.id} className="p-3 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-mono text-sm font-semibold text-white truncate min-w-0 flex-1">{peer.id}</span>
                                    <span className="font-mono text-[10px] text-brand-cyan shrink-0">v{peer.version}</span>
                                </div>
                                <div className="font-mono text-[10px] text-white/40 truncate">
                                    {peer.address} · Last seen {new Date(peer.lastSeen).toLocaleTimeString([], { hour12: false })}
                                </div>
                            </div>
                        )) : (
                            <p className="font-mono text-sm text-white/40">No peers reported</p>
                        )}
                    </div>
                </HolographicCard>
            </div>

            {/* Recent Operations */}
            {nodeOperations.length > 0 && (
                <div className="mt-8">
                    <HolographicCard className="backdrop-blur-xl bg-black/40">
                        <div className="flex items-center gap-2 mb-4">
                            <FileCode size={14} className="text-brand-success" />
                            <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Recent Filesystem Operations</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left font-mono text-[10px] text-white/40 uppercase py-2">Operation</th>
                                        <th className="text-left font-mono text-[10px] text-white/40 uppercase py-2">Path</th>
                                        <th className="text-left font-mono text-[10px] text-white/40 uppercase py-2">Size</th>
                                        <th className="text-left font-mono text-[10px] text-white/40 uppercase py-2">Status</th>
                                        <th className="text-left font-mono text-[10px] text-white/40 uppercase py-2">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {nodeOperations.map(op => (
                                        <tr key={op.id} className="hover:bg-white/5">
                                            <td className="py-3 font-mono text-xs text-brand-cyan">{op.opType}</td>
                                            <td className="py-3 font-mono text-xs text-white/70">{op.path}</td>
                                            <td className="py-3 font-mono text-xs text-white/50">{op.bytes} B</td>
                                            <td className="py-3">
                                                <span className={cn(
                                                    "font-mono text-[10px] px-2 py-0.5 rounded",
                                                    op.status === "success" ? "bg-brand-success/20 text-brand-success" : "bg-red-500/20 text-red-400"
                                                )}>
                                                    {op.status}
                                                </span>
                                            </td>
                                            <td className="py-3 font-mono text-xs text-white/40">
                                                {new Date(op.timestamp).toLocaleTimeString([], { hour12: false })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </HolographicCard>
                </div>
            )}
        </div>
    );
}
