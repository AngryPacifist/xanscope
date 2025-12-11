import { NextResponse } from "next/server";
import { fetchActivityFeed } from "@/lib/data-service";

export async function GET() {
  const activity = await fetchActivityFeed();
  return NextResponse.json({ activity });
}
