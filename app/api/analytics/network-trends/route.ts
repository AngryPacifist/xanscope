import { NextResponse } from "next/server";
import { fetchPnodeHistory } from "@/lib/data-service";
import { mockPnodes } from "@/lib/mock-data";

export async function GET() {
  // Build a simple combined history using mock data.
  const history = await Promise.all(
    mockPnodes.map(async (node) => {
      const points = await fetchPnodeHistory(node.id);
      return {
        nodeId: node.id,
        label: node.label,
        points,
      };
    })
  );

  return NextResponse.json({ history });
}
