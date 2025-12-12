import { fetchPnodes } from "@/lib/data-service";
import { NodesClient } from "@/components/nodes/nodes-client";

export default async function NodesPage() {
  const nodes = await fetchPnodes();

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          pNode Explorer
        </h1>
        <p className="mt-2 text-sm text-white/50 max-w-2xl font-mono">
          Search, filter, and explore every pNode broadcasting through gossip.
          Click any node to view detailed stats, timeline, and filesystem operations.
        </p>
      </div>

      {/* Nodes Grid/Table */}
      <NodesClient nodes={nodes} />
    </div>
  );
}
