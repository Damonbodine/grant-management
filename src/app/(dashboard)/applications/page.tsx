export const dynamic = 'force-dynamic';
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ApplicationFilterBar } from "@/components/applications/application-filter-bar";
import { ApplicationListTable } from "@/components/applications/application-list-table";
import { buttonVariants } from "@/components/ui/button-variants";

export default function ApplicationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Applications"
        description="Track your grant application pipeline"
        action={
          <Link href="/applications/new" className={buttonVariants({ variant: "default" })}>Create Application</Link>
        }
      />
      <ApplicationFilterBar />
      <ApplicationListTable />
    </div>
  );
}
