import { NextResponse } from "next/server";
import { fetchFsSummaries } from "@/lib/data-service";

export async function GET() {
  const fileSystems = await fetchFsSummaries();
  return NextResponse.json({ fileSystems });
}
