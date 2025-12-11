import { PageHeading } from "@/components/layout/page-heading";
import { Card } from "@/components/ui/card";
import { fetchNetworkOverview, fetchPnodes } from "@/lib/data-service";

const releaseTimeline = [
  {
    name: "Herrenberg",
    date: "Jan 2025",
    highlights: ["Latest pRPC schema", "Filesystem telemetry hooks", "Faster gossip"],
  },
  {
    name: "Munich",
    date: "Nov 2024",
    highlights: ["Atlas streaming", "Improved storage credits"],
  },
  {
    name: "Lindau",
    date: "Aug 2024",
    highlights: ["First pnRPC beta", "Operator security tooling"],
  },
];

export default async function ReleasesPage() {
  const [overview, nodes] = await Promise.all([
    fetchNetworkOverview(),
    fetchPnodes(),
  ]);

  return (
    <div className="space-y-10">
      <PageHeading
        title="Release intelligence"
        description="Track how quickly operators adopt new builds, and understand what each release unlocks for the Xandeum storage layer."
      />

      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
          Version distribution
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {Object.entries(overview.releases).map(([release, count]) => (
            <div
              key={release}
              className="rounded-2xl border border-white/10 px-4 py-3"
            >
              <p className="text-sm font-semibold">{release}</p>
              <p className="text-3xl font-semibold">{count}</p>
              <p className="text-xs text-slate-400">nodes upgraded</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
          Timeline
        </p>
        <div className="mt-6 space-y-6">
          {releaseTimeline.map((release) => (
            <div key={release.name} className="relative pl-8">
              <div className="absolute left-1 top-2 h-4 w-4 -translate-x-1/2 rounded-full bg-cyan-400" />
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  {release.date}
                </p>
                <p className="text-2xl font-semibold">{release.name}</p>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">
                  {release.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
          Nodes requiring upgrades
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {nodes
            .filter((node) => node.release !== "Herrenberg")
            .map((node) => (
              <div
                key={node.id}
                className="rounded-2xl border border-white/10 px-4 py-3"
              >
                <p className="text-sm font-semibold">{node.label}</p>
                <p className="text-xs text-slate-400">
                  Running {node.release} · {node.version}
                </p>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
