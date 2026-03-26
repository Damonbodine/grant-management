import { PageHeader } from "@/components/page-header";
import { ApplicationWorkspace } from "@/components/applications/application-workspace";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicationWorkspacePage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Application Workspace"
        description="Collaborate on your application"
      />
      <ApplicationWorkspace applicationId={id} />
    </div>
  );
}
