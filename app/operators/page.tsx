import { fetchPnodes, fetchNetworkOverview } from "@/lib/data-service";
import { OperatorsClient } from "@/components/operators/operators-client";

export default async function OperatorsPage() {
  const [nodes, overview] = await Promise.all([
    fetchPnodes(),
    fetchNetworkOverview(),
  ]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Operator Cockpit
        </h1>
        <p className="mt-2 text-sm text-white/50 max-w-2xl font-mono">
          Track your pNodes in a personal dashboard. Add nodes by ID to monitor
          performance, storage, and uptime. All data stored locally — no wallet required.
        </p>
      </div>

      <OperatorsClient nodes={nodes} overview={overview} />
    </div>
  );
}
