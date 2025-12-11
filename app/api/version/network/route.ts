import { NextResponse } from "next/server";
import { fetchPnodes } from "@/lib/data-service";

export async function GET() {
  const nodes = await fetchPnodes();
  const distribution = nodes.reduce<Record<string, number>>((acc, node) => {
    acc[node.version] = (acc[node.version] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({ distribution });
}
