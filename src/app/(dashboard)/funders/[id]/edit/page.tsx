export const dynamic = 'force-dynamic';
import { PageHeader } from "@/components/page-header";
import { FunderEditForm } from "@/components/forms/funder-edit-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditFunderPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit Funder" />
      <FunderEditForm id={id} />
    </div>
  );
}
