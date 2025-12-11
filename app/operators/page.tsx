import { PageHeading } from "@/components/layout/page-heading";
import { fetchPnodes } from "@/lib/data-service";
import { OperatorsClient } from "@/components/operators/operators-client";

export default async function OperatorsPage() {
  const nodes = await fetchPnodes();

  return (
    <div className="space-y-10">
      <PageHeading
        title="Operator cockpit"
        description="Build a personal health view by tracking the IDs of the pNodes you manage. No authentication — everything runs locally."
      />
      <OperatorsClient nodes={nodes} />
    </div>
  );
}
