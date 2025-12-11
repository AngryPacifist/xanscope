import { NextResponse } from "next/server";
import { fetchPnodes } from "@/lib/data-service";

export async function GET() {
  const nodes = await fetchPnodes();
  const regions = nodes.reduce<Record<string, { total: number; online: number }>>(
    (acc, node) => {
      const bucket = acc[node.region] ?? { total: 0, online: 0 };
      bucket.total += 1;
      if (node.status === "online") {
        bucket.online += 1;
      }
      acc[node.region] = bucket;
      return acc;
    },
    {}
  );

  return NextResponse.json({ regions });
}
