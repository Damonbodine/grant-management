export const dynamic = 'force-dynamic';
import { PageHeader } from "@/components/page-header";
import { ApplicationCreateForm } from "@/components/forms/application-create-form";

export default function NewApplicationPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="New Application" description="Create a new grant application" />
      <ApplicationCreateForm />
    </div>
  );
}
