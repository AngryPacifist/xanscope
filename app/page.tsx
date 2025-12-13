import { fetchNetworkOverview, fetchActivityFeed } from "@/lib/data-service";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const [overview, activity] = await Promise.all([
    fetchNetworkOverview(),
    fetchActivityFeed()
  ]);

  return <DashboardClient initialOverview={overview} initialActivity={activity} />;
}
