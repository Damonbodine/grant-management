import { PageHeader } from "@/components/page-header";
import { ExpenditureCreateForm } from "@/components/forms/expenditure-create-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewExpenditurePage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add Expenditure"
        description="Record a new expenditure for this award"
      />
      <ExpenditureCreateForm awardId={id} />
    </div>
  );
}
