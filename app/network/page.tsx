import Link from "next/link";
import { PageHeading } from "@/components/layout/page-heading";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusPill } from "@/components/ui/status-pill";
import { fetchNetworkOverview, fetchPnodes } from "@/lib/data-service";

export default async function NetworkPage() {
  const [overview, nodes] = await Promise.all([
    fetchNetworkOverview(),
    fetchPnodes(),
  ]);

  const findNodesForRegion = (regionName: string) => {
    const key = regionName.toLowerCase();
    if (key.includes("eu")) {
      return nodes.filter((node) => node.region.startsWith("eu"));
    }
    if (key.includes("us")) {
      return nodes.filter((node) => node.region.startsWith("us"));
    }
    if (key.includes("ap")) {
      return nodes.filter((node) => node.region.startsWith("ap"));
    }
    if (key.includes("sa")) {
      return nodes.filter((node) => node.region.startsWith("sa"));
    }
    return nodes;
  };

  const health =
    overview.onlineNodes / overview.totalNodes > 0.85
      ? "Healthy"
      : "Degraded";

  return (
    <div className="space-y-10">
      <PageHeading
        title="Global network overview"
        description="Geo-distributed view of the Xandeum storage tier. Track active regions, release adoption, and heartbeat latency in one place."
        actions={
          <Link
            href="/nodes"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:border-white/60"
          >
            Explore nodes
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Online nodes"
          value={`${overview.onlineNodes}/${overview.totalNodes}`}
          delta={`${health} network`}
        />
        <MetricCard
          label="Syncing"
          value={overview.syncingNodes.toString()}
          delta="catching up to gossip"
          accent="violet"
        />
        <MetricCard
          label="Offline"
          value={overview.offlineNodes.toString()}
          delta="requires action"
          accent="orange"
        />
      </div>

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.15),_rgba(15,23,42,0.95))]" />
        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Atlas activity
              </p>
              <h2 className="text-2xl font-semibold">Live region heatmap</h2>
            </div>
            <span className="text-sm text-slate-300">
              Last updated {new Date(overview.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Region utilization
              </p>
              <div className="mt-4 space-y-4">
                {overview.regions.map((region) => {
                  const utilization = (region.online / region.nodes) * 100;
                  return (
                    <div key={region.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span>{region.name}</span>
                        <span className="text-slate-400">
                          {region.online}/{region.nodes} nodes
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Release adoption
              </p>
              <div className="mt-4 space-y-3">
                {Object.entries(overview.releases).map(([release, count]) => (
                  <div
                    key={release}
                    className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{release}</p>
                      <p className="text-xs text-slate-400">
                        {count} nodes upgraded
                      </p>
                    </div>
                    <StatusPill
                      label={
                        release === "Herrenberg" ? "Latest" : "Upgrade pending"
                      }
                      variant={release === "Herrenberg" ? "online" : "syncing"}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              Regional roster
            </p>
            <h2 className="text-xl font-semibold">Nodes by geography</h2>
          </div>
          <p className="text-sm text-slate-300">
            Click a node to open its detailed profile
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {overview.regions.map((region) => (
            <div
              key={region.name}
              className="rounded-3xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {region.name}
                  </p>
                  <p className="text-lg font-semibold">
                    {region.online} / {region.nodes} nodes online
                  </p>
                </div>
                <p className="text-sm text-slate-400">
                  {region.capacityTb} TB capacity
                </p>
              </div>
              <div className="space-y-3">
                {findNodesForRegion(region.name)
                  .slice(0, 3)
                  .map((node) => (
                    <Link
                      key={node.id}
                      href={`/nodes/${node.id}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 transition hover:border-cyan-300/40"
                    >
                      <div>
                        <p className="text-sm font-semibold">{node.label}</p>
                        <p className="text-xs text-slate-400">{node.provider}</p>
                      </div>
                      <StatusPill label={node.status} variant={node.status} />
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
