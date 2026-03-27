export const dynamic = 'force-dynamic';
import { PageHeader } from "@/components/page-header";
import { ReportCreateForm } from "@/components/forms/report-create-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewReportPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create Report"
        description="Write a new grant report"
      />
      <ReportCreateForm awardId={id} />
    </div>
  );
}
