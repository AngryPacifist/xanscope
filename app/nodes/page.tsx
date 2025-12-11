import { PageHeading } from "@/components/layout/page-heading";
import { fetchPnodes } from "@/lib/data-service";
import { NodesClient } from "@/components/nodes/nodes-client";

export default async function NodesPage() {
  const nodes = await fetchPnodes();

  return (
    <div className="space-y-10">
      <PageHeading
        title="pNode explorer"
        description="Search, sort, and deep-dive into every pNode currently broadcasting through gossip. Click a node to open its timeline and filesystems."
      />
      <NodesClient nodes={nodes} />
    </div>
  );
}
