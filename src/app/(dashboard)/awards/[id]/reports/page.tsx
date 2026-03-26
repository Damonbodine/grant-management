import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ReportListTable } from "@/components/reports/report-list-table";
import { buttonVariants } from "@/components/ui/button-variants";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportsPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Grant reports for this award"
        action={
          <Link href={`/awards/${id}/reports/new`} className={buttonVariants({ variant: "default" })}>Create Report</Link>
        }
      />
      <ReportListTable awardId={id} />
    </div>
  );
}
