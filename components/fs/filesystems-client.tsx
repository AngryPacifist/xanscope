"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Search,
    FolderOpen,
    HardDrive,
    FileText,
    Clock,
    Server,
    Grid3X3,
    List,
    Database,
    Activity
} from "lucide-react";
import { HolographicCard } from "@/components/ui/holographic-card";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import type { FileSystemSummary, FileSystemOperation } from "@/lib/types";

interface FilesystemsClientProps {
    filesystems: FileSystemSummary[];
    operations: FileSystemOperation[];
}

// Stats card component
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

// Storage bar component
function StorageBar({ used, limit }: { used: number; limit: number }) {
    const percent = (used / limit) * 100;
    const getColor = () => {
        if (percent > 90) return '#EF4444'; // Red
        if (percent > 75) return '#F59E0B'; // Amber
        return '#22C55E'; // Green
    };

    return (
        <div className="w-full">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all"
                    style={{
                        width: `${percent}%`,
                        backgroundColor: getColor()
                    }}
                />
            </div>
            <div className="flex justify-between mt-1">
                <span className="font-mono text-[10px] text-white/40">{(used / 1024).toFixed(1)} TB</span>
                <span className="font-mono text-[10px] text-white/40">{(limit / 1024).toFixed(1)} TB</span>
            </div>
        </div>
    );
}

// Filesystem card component
function FilesystemCard({ fs }: { fs: FileSystemSummary }) {
    const statusVariant = fs.status === "active" ? "online" : fs.status === "idle" ? "syncing" : "offline";
    const usagePercent = (fs.storageUsedGb / fs.storageLimitGb) * 100;

    return (
        <Link href={`/fs/${fs.fsid}`}>
            <HolographicCard className="backdrop-blur-xl bg-black/40 hover:bg-black/50 transition-all group cursor-pointer h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                            <FolderOpen size={16} className="text-amber-400" />
                        </div>
                        <div>
                            <div className="font-mono text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors">
                                {fs.label}
                            </div>
                            <div className="font-mono text-[10px] text-white/40">{fs.fsid}</div>
                        </div>
                    </div>
                    <StatusPill label={fs.status} variant={statusVariant} />
                </div>

                {/* Storage Bar */}
                <div className="mb-4">
                    <StorageBar used={fs.storageUsedGb} limit={fs.storageLimitGb} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-white/5">
                        <div className="flex items-center gap-1.5">
                            <FileText size={10} className="text-brand-cyan" />
                            <span className="font-mono text-[9px] text-white/50 uppercase">Files</span>
                        </div>
                        <div className="font-mono text-sm font-bold text-white">
                            {fs.totalFiles.toLocaleString()}
                        </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                        <div className="flex items-center gap-1.5">
                            <FolderOpen size={10} className="text-brand-purple" />
                            <span className="font-mono text-[9px] text-white/50 uppercase">Dirs</span>
                        </div>
                        <div className="font-mono text-sm font-bold text-white">
                            {fs.totalDirectories.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 font-mono text-[10px] text-white/40">
                            <Server size={10} />
                            <span>{fs.pinnedNodeId}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[10px] text-white/40">
                            <Clock size={10} />
                            <span>{formatTimeAgo(fs.lastActivity)}</span>
                        </div>
                    </div>
                </div>
            </HolographicCard>
        </Link>
    );
}

// Time ago formatter
function formatTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export function FilesystemsClient({ filesystems, operations }: FilesystemsClientProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Calculate stats
    const stats = useMemo(() => ({
        total: filesystems.length,
        active: filesystems.filter(f => f.status === "active").length,
        totalStorage: filesystems.reduce((acc, f) => acc + f.storageLimitGb, 0) / 1024,
        usedStorage: filesystems.reduce((acc, f) => acc + f.storageUsedGb, 0) / 1024,
        totalFiles: filesystems.reduce((acc, f) => acc + f.totalFiles, 0),
    }), [filesystems]);

    // Filter filesystems
    const filteredFs = useMemo(() => {
        return filesystems.filter(fs => {
            const matchesSearch = search === "" ||
                fs.label.toLowerCase().includes(search.toLowerCase()) ||
                fs.fsid.toLowerCase().includes(search.toLowerCase()) ||
                fs.owner.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || fs.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [filesystems, search, statusFilter]);

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatsCard icon={Database} label="Total Filesystems" value={stats.total.toString()} color="bg-brand-cyan/20" />
                <StatsCard icon={Activity} label="Active" value={stats.active.toString()} color="bg-brand-success/20" />
                <StatsCard icon={HardDrive} label="Total Storage" value={`${stats.totalStorage.toFixed(1)} TB`} color="bg-brand-purple/20" />
                <StatsCard icon={FileText} label="Total Files" value={stats.totalFiles.toLocaleString()} color="bg-amber-500/20" />
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search filesystems by name, ID, or owner..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg font-mono text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-cyan/50"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {["all", "active", "idle", "archived"].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all",
                                statusFilter === status
                                    ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30"
                                    : "bg-white/5 text-white/50 border border-white/10 hover:text-white"
                            )}
                        >
                            {status}
                        </button>
                    ))}

                    <div className="w-px h-6 bg-white/10 mx-2" />

                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn("p-2 rounded-lg", viewMode === "grid" ? "bg-white/10" : "hover:bg-white/5")}
                    >
                        <Grid3X3 size={14} className={viewMode === "grid" ? "text-brand-cyan" : "text-white/50"} />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn("p-2 rounded-lg", viewMode === "list" ? "bg-white/10" : "hover:bg-white/5")}
                    >
                        <List size={14} className={viewMode === "list" ? "text-brand-cyan" : "text-white/50"} />
                    </button>
                </div>
            </div>

            {/* Results Count */}
            <div className="font-mono text-[10px] text-white/40">
                Showing <span className="text-brand-cyan">{filteredFs.length}</span> of {filesystems.length} filesystems
            </div>

            {/* Filesystem Grid/List */}
            {filteredFs.length > 0 ? (
                <div className={cn(
                    viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        : "space-y-3"
                )}>
                    {filteredFs.map(fs => (
                        <FilesystemCard key={fs.fsid} fs={fs} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <FolderOpen size={48} className="mx-auto text-white/10 mb-4" />
                    <p className="font-mono text-sm text-white/40">No filesystems match your search</p>
                </div>
            )}

            {/* Recent Operations */}
            {operations.length > 0 && (
                <HolographicCard className="backdrop-blur-xl bg-black/40 mt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={14} className="text-brand-success" />
                        <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Live Operations</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left font-mono text-[10px] text-white/40 uppercase py-2">Time</th>
                                    <th className="text-left font-mono text-[10px] text-white/40 uppercase py-2">FS</th>
                                    <th className="text-left font-mono text-[10px] text-white/40 uppercase py-2">Operation</th>
                                    <th className="text-left font-mono text-[10px] text-white/40 uppercase py-2">Path</th>
                                    <th className="text-left font-mono text-[10px] text-white/40 uppercase py-2">Size</th>
                                    <th className="text-left font-mono text-[10px] text-white/40 uppercase py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {operations.slice(0, 10).map(op => (
                                    <tr key={op.id} className="hover:bg-white/5">
                                        <td className="py-3 font-mono text-xs text-white/50">
                                            {new Date(op.timestamp).toLocaleTimeString([], { hour12: false })}
                                        </td>
                                        <td className="py-3">
                                            <Link href={`/fs/${op.fsid}`} className="font-mono text-xs text-brand-cyan hover:underline">
                                                {op.fsid}
                                            </Link>
                                        </td>
                                        <td className="py-3 font-mono text-xs text-amber-400">{op.opType}</td>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </HolographicCard>
            )}
        </div>
    );
}
