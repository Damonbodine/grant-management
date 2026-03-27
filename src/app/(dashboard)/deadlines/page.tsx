export const dynamic = 'force-dynamic';
import { PageHeader } from "@/components/page-header";
import { DeadlineDashboard } from "@/components/deadlines/deadline-dashboard";

export default function DeadlinesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Deadlines"
        description="Track upcoming grant deadlines and report due dates"
      />
      <DeadlineDashboard />
    </div>
  );
}
