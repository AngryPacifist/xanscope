import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeading } from "@/components/layout/page-heading";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/sparkline";
import {
  fetchFsOperations,
  fetchFsSummaries,
  fetchPnodeById,
  fetchPnodeHistory,
  fetchPnodeStats,
  fetchPeerPods,
} from "@/lib/data-service";
import { StatusPill } from "@/components/ui/status-pill";

type NodeDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function NodeDetailPage({ params }: NodeDetailPageProps) {
  const node = await fetchPnodeById(params.id);
  if (!node) {
    notFound();
  }

  const [history, stats, peers, filesystems, operations] = await Promise.all([
    fetchPnodeHistory(node.id),
    fetchPnodeStats(node.id),
    fetchPeerPods(node.id),
    fetchFsSummaries(),
    fetchFsOperations(),
  ]);

  const latestStats = stats.at(-1);
  const performanceSpark = history.map((point) => point.performanceScore * 100);
  const attachedFs = filesystems.filter((fs) => fs.pinnedNodeId === node.id);
  const nodeOperations = operations
    .filter((op) => op.nodeId === node.id)
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <PageHeading
        title={node.label}
        description={`Region ${node.region.toUpperCase()} · ${node.provider} · ${node.address}`}
        actions={
          <StatusPill label={node.status} variant={node.status} />
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Performance timeline
              </p>
              <p className="text-sm text-slate-300">
                Based on pnRPC stats snapshots
              </p>
            </div>
            <p className="text-2xl font-semibold">
              {(node.performanceScore * 100).toFixed(1)}%
            </p>
          </div>
          <Sparkline values={performanceSpark} />
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Uptime (7d)
              </p>
              <p className="text-2xl font-semibold">
                {node.uptimePercentage.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Storage
              </p>
              <p className="text-2xl font-semibold">{node.storageTb} TB</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Last heartbeat
              </p>
              <p className="text-2xl font-semibold">
                {new Date(node.lastHeartbeat).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Configuration
          </p>
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-sm text-slate-400">Release</p>
            <p className="text-lg font-semibold">{node.release}</p>
            <p className="text-xs text-slate-400">{node.version}</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-sm text-slate-400">Provider</p>
            <p className="text-lg font-semibold">{node.provider}</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-sm text-slate-400">Region</p>
            <p className="text-lg font-semibold">
              {node.region.toUpperCase()}
            </p>
            <p className="text-xs text-slate-400">{node.country}</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Anchored file systems
              </p>
              <p className="text-sm text-slate-300">
                Workloads routed through this node
              </p>
            </div>
            <Link
              href="/fs"
              className="text-sm font-semibold text-cyan-300 underline-offset-4 hover:underline"
            >
              Explore FS
            </Link>
          </div>
          <div className="space-y-3">
            {attachedFs.length ? (
              attachedFs.map((fs) => (
                <Link
                  key={fs.fsid}
                  href={`/fs/${fs.fsid}`}
                  className="block rounded-2xl border border-white/10 px-4 py-3 transition hover:border-cyan-300/40"
                >
                  <p className="text-sm font-semibold">{fs.label}</p>
                  <p className="text-xs text-slate-400">{fs.fsid}</p>
                  <p className="text-xs text-slate-400">
                    {(fs.storageUsedGb / 1024).toFixed(2)} /{" "}
                    {(fs.storageLimitGb / 1024).toFixed(1)} TB used ·{" "}
                    {fs.totalFiles} files
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No file systems pinned to this node yet.
              </p>
            )}
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Recent filesystem activity
              </p>
              <p className="text-sm text-slate-300">
                Derived from peek/poke/create events
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {nodeOperations.length ? (
              nodeOperations.map((op) => (
                <div
                  key={op.id}
                  className="rounded-2xl border border-white/10 px-4 py-3"
                >
                  <p className="text-sm font-semibold">
                    {op.opType} · {op.path}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(op.timestamp).toLocaleTimeString()} · {op.bytes} B
                  </p>
                  <p className="text-xs text-slate-500">FS {op.fsid}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No filesystem operations recorded for this node.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Runtime stats
              </p>
              <p className="text-sm text-slate-300">From get-stats</p>
            </div>
          </div>
          {latestStats ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  CPU
                </p>
                <p className="text-2xl font-semibold">
                  {latestStats.cpuPercent.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Memory
                </p>
                <p className="text-2xl font-semibold">
                  {latestStats.ramUsedGb.toFixed(2)} /{" "}
                  {latestStats.ramTotalGb.toFixed(0)} GB
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Streams
                </p>
                <p className="text-2xl font-semibold">
                  {latestStats.activeStreams}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Packets
                </p>
                <p className="text-2xl font-semibold">
                  {latestStats.packetsSent}/{latestStats.packetsReceived}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No runtime stats recorded yet.
            </p>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Peer pods
              </p>
              <p className="text-sm text-slate-300">From get-pods</p>
            </div>
            <Link
              href="/network"
              className="text-sm font-medium text-cyan-300 underline-offset-4 hover:underline"
            >
              View network
            </Link>
          </div>
          <div className="space-y-3">
            {peers.length ? (
              peers.map((peer) => (
                <div
                  key={peer.id}
                  className="rounded-2xl border border-white/10 px-4 py-3"
                >
                  <p className="text-sm font-semibold">{peer.id}</p>
                  <p className="text-xs text-slate-400">{peer.address}</p>
                  <p className="text-xs text-slate-500">
                    v{peer.version} · Last seen{" "}
                    {new Date(peer.lastSeen).toLocaleTimeString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No peers reported.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
