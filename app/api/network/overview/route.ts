import { NextResponse } from "next/server";
import { fetchNetworkOverview } from "@/lib/data-service";

export async function GET() {
  const overview = await fetchNetworkOverview();
  return NextResponse.json({ overview });
}
