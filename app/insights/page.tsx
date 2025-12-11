import { PageHeading } from "@/components/layout/page-heading";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/sparkline";
import {
  fetchFsOperations,
  fetchFsSummaries,
  fetchLeaderboards,
  fetchPnodes,
} from "@/lib/data-service";

export default async function InsightsPage() {
  const [leaderboard, nodes, fileSystems, operations] = await Promise.all([
    fetchLeaderboards(),
    fetchPnodes(),
    fetchFsSummaries(),
    fetchFsOperations(),
  ]);

  const storageSpark = fileSystems.map((fs) => fs.storageUsedGb / 1024);

  return (
    <div className="space-y-10">
      <PageHeading
        title="Network insights"
        description="Advanced analytics derived from pnRPC and filesystem telemetry. Spot leaders, anomalies, and hot paths instantly."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Storage growth
          </p>
          <Sparkline values={storageSpark} />
          <p className="text-sm text-slate-300">
            Derived from aggregated filesystem usage
          </p>
        </Card>
        <Card className="lg:col-span-2">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Leaderboard
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-white/10 p-4"
              >
                <p className="text-sm font-semibold">{entry.label}</p>
                <p className="text-3xl font-semibold">
                  {(entry.score * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">
                  {entry.metric} · Δ {entry.delta.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Top storage workloads
          </p>
          <div className="mt-4 space-y-4">
            {fileSystems.map((fs) => (
              <div key={fs.fsid} className="rounded-2xl border border-white/10 p-4">
                <p className="text-sm font-semibold">{fs.label}</p>
                <p className="text-xs text-slate-400">{fs.fsid}</p>
                <p className="text-sm text-slate-300">
                  {(fs.storageUsedGb / 1024).toFixed(2)} TB used
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Hot operations
          </p>
          <div className="mt-4 space-y-3">
            {operations.slice(0, 6).map((op) => (
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
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
          Stability outlook
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {nodes.slice(0, 4).map((node) => (
            <div
              key={node.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-sm font-semibold">{node.label}</p>
              <p className="text-3xl font-semibold">
                {node.uptimePercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-400">{node.release}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
