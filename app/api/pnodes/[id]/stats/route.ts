import { NextResponse } from "next/server";
import { fetchPnodeStats } from "@/lib/data-service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const stats = await fetchPnodeStats(id);
  return NextResponse.json({ stats });
}
