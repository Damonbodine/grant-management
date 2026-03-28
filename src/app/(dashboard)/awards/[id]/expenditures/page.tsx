export const dynamic = 'force-dynamic';
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ExpenditureListTable } from "@/components/expenditures/expenditure-list-table";
import { BudgetJustificationWriter } from "@/components/expenditures/budget-justification-writer";
import { buttonVariants } from "@/components/ui/button-variants";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExpendituresPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Expenditures"
        description="Track spending for this award"
        action={
          <Link href={`/awards/${id}/expenditures/new`} className={buttonVariants({ variant: "default" })}>Add Expenditure</Link>
        }
      />
      <ExpenditureListTable awardId={id} />
      <BudgetJustificationWriter awardId={id} />
    </div>
  );
}
