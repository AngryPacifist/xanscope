import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FolderOpen,
  FileText,
  HardDrive,
  Clock,
  Server,
  ArrowLeft,
  Activity,
  Database,
  User
} from "lucide-react";
import {
  fetchFsOperations,
  fetchFsSummaries,
  fetchFsTree,
} from "@/lib/data-service";
import { FileSystemEntry } from "@/lib/types";
import { HolographicCard } from "@/components/ui/holographic-card";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

type FsDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// Directory tree entry component
function TreeEntry({ entry, depth = 0 }: { entry: FileSystemEntry; depth?: number }) {
  const isDir = entry.type === "directory";
  const Icon = isDir ? FolderOpen : FileText;

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-white/5 transition-colors"
        style={{ marginLeft: depth * 16 }}
      >
        <Icon size={14} className={isDir ? "text-amber-400" : "text-brand-cyan"} />
        <span className="font-mono text-sm text-white">{entry.name}</span>
        <span className="font-mono text-[10px] text-white/30 ml-auto">{entry.type}</span>
      </div>
      {entry.children?.map((child) => (
        <TreeEntry key={child.path} entry={child} depth={depth + 1} />
      ))}
    </div>
  );
}

// Storage bar component
function StorageBar({ used, limit }: { used: number; limit: number }) {
  const percent = (used / limit) * 100;
  const getColor = () => {
    if (percent > 90) return '#EF4444';
    if (percent > 75) return '#F59E0B';
    return '#22C55E';
  };

  return (
    <div className="w-full">
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percent}%`, backgroundColor: getColor() }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="font-mono text-xs text-white/50">
          {(used / 1024).toFixed(2)} TB used
        </span>
        <span className="font-mono text-xs text-white/50">
          {(limit / 1024).toFixed(1)} TB limit
        </span>
      </div>
    </div>
  );
}

export default async function FsDetailPage({ params }: FsDetailPageProps) {
  const { id } = await params;

  const [fileSystems, tree, operations] = await Promise.all([
    fetchFsSummaries(),
    fetchFsTree(id),
    fetchFsOperations(id),
  ]);

  const fs = fileSystems.find((item) => item.fsid === id);
  if (!fs) {
    notFound();
  }

  const statusVariant = fs.status === "active" ? "online" : fs.status === "idle" ? "syncing" : "offline";

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12">
      {/* Back link */}
      <Link
        href="/fs"
        className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-brand-cyan transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Filesystems
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/20">
            <FolderOpen size={24} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{fs.label}</h1>
              <StatusPill label={fs.status} variant={statusVariant} />
            </div>
            <p className="font-mono text-xs text-white/40 mt-1">{fs.fsid}</p>
          </div>
        </div>
        <Link
          href={`/nodes/${fs.pinnedNodeId}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 font-mono text-xs text-brand-cyan hover:bg-brand-cyan/20 transition-colors"
        >
          <Server size={14} />
          View Pinned Node
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <HolographicCard className="backdrop-blur-xl bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-success/20">
              <HardDrive size={16} className="text-brand-success" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-white/50 uppercase">Storage Used</div>
              <div className="font-mono text-xl font-bold text-white">
                {(fs.storageUsedGb / 1024).toFixed(2)} TB
              </div>
            </div>
          </div>
        </HolographicCard>

        <HolographicCard className="backdrop-blur-xl bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-cyan/20">
              <FileText size={16} className="text-brand-cyan" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-white/50 uppercase">Files</div>
              <div className="font-mono text-xl font-bold text-white">
                {fs.totalFiles.toLocaleString()}
              </div>
            </div>
          </div>
        </HolographicCard>

        <HolographicCard className="backdrop-blur-xl bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-purple/20">
              <FolderOpen size={16} className="text-brand-purple" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-white/50 uppercase">Directories</div>
              <div className="font-mono text-xl font-bold text-white">
                {fs.totalDirectories.toLocaleString()}
              </div>
            </div>
          </div>
        </HolographicCard>

        <HolographicCard className="backdrop-blur-xl bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock size={16} className="text-amber-400" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-white/50 uppercase">Last Activity</div>
              <div className="font-mono text-lg font-bold text-white">
                {new Date(fs.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </HolographicCard>
      </div>

      {/* Storage Usage */}
      <HolographicCard className="backdrop-blur-xl bg-black/40 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Database size={14} className="text-brand-cyan" />
          <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Storage Capacity</span>
        </div>
        <StorageBar used={fs.storageUsedGb} limit={fs.storageLimitGb} />
        <div className="mt-4 flex items-center gap-4 font-mono text-xs text-white/40">
          <div className="flex items-center gap-2">
            <User size={12} />
            <span>Owner: {fs.owner}</span>
          </div>
          <div className="flex items-center gap-2">
            <Server size={12} />
            <span>Node: {fs.pinnedNodeId}</span>
          </div>
        </div>
      </HolographicCard>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Directory Tree */}
        <HolographicCard className="backdrop-blur-xl bg-black/40">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={14} className="text-amber-400" />
            <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Directory Tree</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {tree.length > 0 ? (
              tree.map((entry) => <TreeEntry key={entry.path} entry={entry} />)
            ) : (
              <p className="font-mono text-sm text-white/30 text-center py-8">No entries recorded</p>
            )}
          </div>
        </HolographicCard>

        {/* Operations */}
        <HolographicCard className="backdrop-blur-xl bg-black/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-brand-success" />
              <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Recent Operations</span>
            </div>
            <span className="font-mono text-[10px] text-white/30">{operations.length} ops</span>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {operations.length > 0 ? (
              operations.slice(0, 15).map((op) => (
                <div
                  key={op.id}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "font-mono text-xs px-2 py-0.5 rounded",
                      op.opType === "peek" ? "bg-brand-cyan/20 text-brand-cyan" :
                        op.opType === "poke" ? "bg-amber-500/20 text-amber-400" :
                          "bg-brand-purple/20 text-brand-purple"
                    )}>
                      {op.opType}
                    </span>
                    <span className={cn(
                      "font-mono text-[10px] px-2 py-0.5 rounded",
                      op.status === "success" ? "bg-brand-success/20 text-brand-success" : "bg-red-500/20 text-red-400"
                    )}>
                      {op.status}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-white/70 truncate">{op.path}</p>
                  <div className="flex items-center justify-between mt-1 font-mono text-[10px] text-white/30">
                    <span>{new Date(op.timestamp).toLocaleTimeString()}</span>
                    <span>{op.bytes} bytes</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-mono text-sm text-white/30 text-center py-8">No operations recorded</p>
            )}
          </div>
        </HolographicCard>
      </div>
    </div>
  );
}
