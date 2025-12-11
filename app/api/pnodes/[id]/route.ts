import { NextResponse } from "next/server";
import { fetchPnodeById, fetchPeerPods } from "@/lib/data-service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const node = await fetchPnodeById(id);

  if (!node) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  const peers = await fetchPeerPods(node.id);
  return NextResponse.json({ node, peers });
}
