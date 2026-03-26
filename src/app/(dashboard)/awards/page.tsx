import { PageHeader } from "@/components/page-header";
import { AwardListTable } from "@/components/awards/award-list-table";

export default function AwardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Awards"
        description="Manage your active and completed grant awards"
      />
      <AwardListTable />
    </div>
  );
}
