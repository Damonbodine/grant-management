import { PageHeader } from "@/components/page-header";
import { ApplicationFilterBar } from "@/components/applications/application-filter-bar";
import { ApplicationListTable } from "@/components/applications/application-list-table";

export default function ApplicationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Applications"
        description="Track your grant application pipeline"
      />
      <ApplicationFilterBar />
      <ApplicationListTable />
    </div>
  );
}
