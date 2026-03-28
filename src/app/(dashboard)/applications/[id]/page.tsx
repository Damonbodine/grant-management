export const dynamic = 'force-dynamic';
import { PageHeader } from "@/components/page-header";
import { ApplicationDetailView } from "@/components/applications/application-detail-view";
import { ProposalNarrativeGenerator } from "@/components/applications/proposal-narrative-generator";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Application Details" />
      <ApplicationDetailView applicationId={id} />
      <ProposalNarrativeGenerator applicationId={id} />
    </div>
  );
}
