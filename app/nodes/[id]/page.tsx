import { notFound } from "next/navigation";
import {
  fetchFsOperations,
  fetchFsSummaries,
  fetchPnodeById,
  fetchPnodeHistory,
  fetchPnodeStats,
  fetchPeerPods,
} from "@/lib/data-service";
import { NodeDetailClient } from "@/components/nodes/node-detail-client";

type NodeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NodeDetailPage({ params }: NodeDetailPageProps) {
  const { id } = await params;
  const node = await fetchPnodeById(id);

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

  return (
    <NodeDetailClient
      node={node}
      stats={stats}
      peers={peers}
      filesystems={filesystems}
      operations={operations}
      history={history}
    />
  );
}
