import { NextResponse } from "next/server";
import { fetchPnodeHistory } from "@/lib/data-service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const history = await fetchPnodeHistory(id);
  return NextResponse.json({ history });
}
