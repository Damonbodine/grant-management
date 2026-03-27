export const dynamic = 'force-dynamic';
import { PageHeader } from "@/components/page-header";
import { FunderCreateForm } from "@/components/forms/funder-create-form";

export default function NewFunderPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add Funder"
        description="Create a new funder record"
      />
      <FunderCreateForm />
    </div>
  );
}
