import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { GrantFilterBar } from "@/components/grants/grant-filter-bar";
import { GrantListTable } from "@/components/grants/grant-list-table";
import { buttonVariants } from "@/components/ui/button-variants";

export default function GrantsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Grants"
        description="Browse and manage grant opportunities"
        action={
          <Link href="/grants/new" className={buttonVariants({ variant: "default" })}>Create Grant</Link>
        }
      />
      <GrantFilterBar />
      <GrantListTable />
    </div>
  );
}
