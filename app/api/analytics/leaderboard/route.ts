import { NextResponse } from "next/server";
import { fetchLeaderboards } from "@/lib/data-service";

export async function GET() {
  const leaderboard = await fetchLeaderboards();
  return NextResponse.json({ leaderboard });
}
