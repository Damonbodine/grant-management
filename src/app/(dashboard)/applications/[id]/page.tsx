import { PageHeader } from "@/components/page-header";
import { ApplicationDetailView } from "@/components/applications/application-detail-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Application Details" />
      <ApplicationDetailView applicationId={id} />
    </div>
  );
}
