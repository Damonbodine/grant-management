export const dynamic = 'force-dynamic';
import { PageHeader } from "@/components/page-header";
import { GrantDetailView } from "@/components/grants/grant-detail-view";
import { GrantFitAnalyzer } from "@/components/grants/grant-fit-analyzer";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GrantDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Grant Details" />
      <GrantDetailView grantId={id} />
      <GrantFitAnalyzer grantId={id} />
    </div>
  );
}
