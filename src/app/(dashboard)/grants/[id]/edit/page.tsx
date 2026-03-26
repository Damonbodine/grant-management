import { PageHeader } from "@/components/page-header";
import { GrantEditForm } from "@/components/forms/grant-edit-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditGrantPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit Grant" />
      <GrantEditForm id={id} />
    </div>
  );
}
