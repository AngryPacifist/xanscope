import { NextResponse } from "next/server";
import { fetchPnodes } from "@/lib/data-service";

export async function GET() {
  const nodes = await fetchPnodes();
  return NextResponse.json({ nodes });
}
