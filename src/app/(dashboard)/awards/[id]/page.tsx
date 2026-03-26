import { PageHeader } from "@/components/page-header";
import { AwardDetailView } from "@/components/awards/award-detail-view";
import { AwardBudgetCards } from "@/components/awards/award-budget-cards";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AwardDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Award Details" />
      <AwardBudgetCards awardId={id} />
      <AwardDetailView awardId={id} />
    </div>
  );
}
