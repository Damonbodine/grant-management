import { PageHeader } from "@/components/page-header";
import { GrantCreateForm } from "@/components/forms/grant-create-form";

export default function NewGrantPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create Grant"
        description="Add a new grant opportunity"
      />
      <GrantCreateForm />
    </div>
  );
}
