export const dynamic = 'force-dynamic';
import { PageHeader } from "@/components/page-header";
import { FunderDetailView } from "@/components/funders/funder-detail-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FunderDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Funder Details" />
      <FunderDetailView funderId={id} />
    </div>
  );
}
