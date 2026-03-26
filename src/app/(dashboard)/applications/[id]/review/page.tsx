import { PageHeader } from "@/components/page-header";
import { ApplicationReview } from "@/components/applications/application-review";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicationReviewPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Application Review"
        description="Review and approve this application"
      />
      <ApplicationReview applicationId={id} />
    </div>
  );
}
