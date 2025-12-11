import Link from "next/link";
import { PageHeading } from "@/components/layout/page-heading";
import { MetricCard } from "@/components/ui/metric-card";
import { Card } from "@/components/ui/card";
import { SimpleTable } from "@/components/ui/simple-table";
import { StatusPill } from "@/components/ui/status-pill";
import { NetworkMap } from "@/components/network/network-map";
import {
  fetchActivityFeed,
  fetchFsSummaries,
  fetchLeaderboards,
  fetchNetworkOverview,
  fetchPnodes,
} from "@/lib/data-service";
import { TrackerInput } from "@/components/operators/tracker-input";

export default async function Home() {
  const [overview, nodes, fileSystems, leaderboard, activity] =
    await Promise.all([
      fetchNetworkOverview(),
      fetchPnodes(),
      fetchFsSummaries(),
      fetchLeaderboards(),
      fetchActivityFeed(),
    ]);

  const uptimeLeaders = nodes
    .slice()
    .sort((a, b) => b.uptimePercentage - a.uptimePercentage)
    .slice(0, 3);

  return (
    <div className="space-y-10">
      <PageHeading
        title="Xandeum pNode Intelligence"
        description="Live network snapshot, filesystem activity, and operator insights — all streaming from pnRPC and filesystem telemetry in one glass dashboard."
        actions={
          <Link
            href="/docs"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:border-white/60"
          >
            View Docs
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#051236] via-[#08143e] to-[#120a2a] p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.4em] text-cyan-200">
            Redefining passive income
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            The scaling solution for Solana storage
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Unlock revolutionary insights across pnRPC, filesystem workloads and
            operator telemetry — XanScope makes Xandeum network intelligence
            tangible.
          </p>
          <Link
            href="/network"
            className="mt-6 inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            Discover STOINC
          </Link>
        </div>
        <TrackerInput />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total pNodes"
          value={overview.totalNodes.toString()}
          delta={`${overview.onlineNodes} online`}
        />
        <MetricCard
          label="Network Capacity"
          value={`${overview.capacityTb} TB`}
          delta="+12 TB last 24h"
          accent="cyan"
        />
        <MetricCard
          label="Average Performance"
          value={(overview.averagePerformance * 100).toFixed(1) + "%"}
          delta="Top quartile healthy"
          accent="violet"
        />
        <MetricCard
          label="Active File Systems"
          value={fileSystems.length.toString()}
          delta="3 highlighted workloads"
          accent="orange"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Gossip Snapshot
              </p>
              <h2 className="text-xl font-semibold">Network timeline</h2>
              <p className="text-sm text-slate-300">
                Last updated {new Date(overview.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
            <Link
              href="/network"
              className="text-sm font-medium text-cyan-300 underline-offset-4 hover:underline"
            >
              Open network map
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {overview.regions.map((region) => (
              <Card key={region.name} className="bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  {region.name}
                </p>
                <p className="mt-2 text-2xl font-semibold">{region.nodes} nodes</p>
                <p className="text-sm text-emerald-300">
                  {region.online} online · {region.capacityTb} TB
                </p>
              </Card>
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Activity
          </p>
          <h2 className="mt-2 text-xl font-semibold">Live intelligence</h2>
          <div className="mt-4 space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em]">
                  <span className="text-slate-400">{item.type}</span>
                  <span className="text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <NetworkMap nodes={nodes} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Node explorer
              </p>
              <h2 className="text-xl font-semibold">Top performance nodes</h2>
            </div>
            <Link
              href="/nodes"
              className="text-sm font-medium text-cyan-300 underline-offset-4 hover:underline"
            >
              View table
            </Link>
          </div>
          <SimpleTable
            data={leaderboard}
            keyExtractor={(item) => item.id}
            columns={[
              {
                header: "Node",
                accessor: "label",
                render: (value, row) => (
                  <div>
                    <p className="font-semibold">{value as string}</p>
                    <p className="text-xs text-slate-400">{row.metric}</p>
                  </div>
                ),
              },
              {
                header: "Score",
                accessor: "score",
                render: (value) => (
                  <p className="font-mono">{(value as number).toFixed(2)}</p>
                ),
              },
              {
                header: "Delta",
                accessor: "delta",
                render: (value) => (
                  <p
                    className={`text-sm ${
                      (value as number) >= 0
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {(value as number) >= 0 ? "+" : ""}
                    {(value as number).toFixed(2)}
                  </p>
                ),
              },
            ]}
          />
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                File systems
              </p>
              <h2 className="text-xl font-semibold">Highlighted workloads</h2>
            </div>
            <Link
              href="/fs"
              className="text-sm font-medium text-cyan-300 underline-offset-4 hover:underline"
            >
              Explore FS
            </Link>
          </div>
          <div className="space-y-4">
            {fileSystems.map((fs) => (
              <Link
                key={fs.fsid}
                href={`/fs/${fs.fsid}`}
                className="block rounded-2xl border border-white/10 p-4 transition hover:border-cyan-300/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                      {fs.fsid}
                    </p>
                    <p className="text-lg font-semibold">{fs.label}</p>
                  </div>
                  <StatusPill
                    label={fs.status}
                    variant={
                      fs.status === "active"
                        ? "online"
                        : fs.status === "idle"
                        ? "syncing"
                        : "offline"
                    }
                  />
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  {fs.totalFiles} files · {(fs.storageUsedGb / 1024).toFixed(1)} TB{" "}
                  used
                </p>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              Availability
            </p>
            <h2 className="text-xl font-semibold">Uptime leaderboard</h2>
          </div>
          <Link
            href="/operators"
            className="text-sm font-medium text-cyan-300 underline-offset-4 hover:underline"
          >
            Open cockpit
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {uptimeLeaders.map((node) => (
            <div
              key={node.id}
              className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
            >
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                {node.label}
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {node.uptimePercentage.toFixed(2)}%
              </p>
              <p className="text-sm text-slate-400">
                Last heartbeat {new Date(node.lastHeartbeat).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
