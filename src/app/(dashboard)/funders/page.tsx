export const dynamic = 'force-dynamic';
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { FunderFilterBar } from "@/components/funders/funder-filter-bar";
import { FunderListTable } from "@/components/funders/funder-list-table";
import { buttonVariants } from "@/components/ui/button-variants";

export default function FundersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Funders"
        description="Manage your funder relationships"
        action={
          <Link href="/funders/new" className={buttonVariants({ variant: "default" })}>Add Funder</Link>
        }
      />
      <FunderFilterBar />
      <FunderListTable />
    </div>
  );
}
