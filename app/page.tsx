import { fetchNetworkOverview, fetchActivityFeed, fetchLeaderboards } from "@/lib/data-service";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const [overview, activity, leaderboard] = await Promise.all([
    fetchNetworkOverview(),
    fetchActivityFeed(),
    fetchLeaderboards()
  ]);

  return <DashboardClient initialOverview={overview} initialActivity={activity} initialLeaderboard={leaderboard} />;
}
