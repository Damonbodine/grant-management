export const dynamic = 'force-dynamic';
import { PageHeader } from "@/components/page-header";
import { DashboardStatCards } from "@/components/dashboard/dashboard-stat-cards";
import { PipelineBreakdown } from "@/components/dashboard/pipeline-breakdown";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your grant management pipeline"
      />
      <DashboardStatCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <PipelineBreakdown />
        <UpcomingDeadlines />
      </div>
      <RecentActivityFeed />
    </div>
  );
}
