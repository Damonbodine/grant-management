export const dynamic = 'force-dynamic';
import { PageHeader } from "@/components/page-header";
import { ReportDetailView } from "@/components/reports/report-detail-view";
import { GrantReportDraft } from "@/components/reports/grant-report-draft";

interface Props {
  params: Promise<{ id: string; reportId: string }>;
}

export default async function ReportDetailPage({ params }: Props) {
  const { reportId } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Report Details" />
      <ReportDetailView reportId={reportId} />
      <GrantReportDraft reportId={reportId} />
    </div>
  );
}
