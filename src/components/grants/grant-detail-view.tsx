"use client";

import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Id } from "@convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/use-authed-query";
import { withPreservedDemoQuery } from "@/lib/demo";

const STATUS_COLORS: Record<string, string> = {
  Researching: "bg-slate-100 text-slate-700",
  Upcoming: "bg-blue-100 text-blue-700",
  Open: "bg-emerald-100 text-emerald-700",
  Closed: "bg-red-100 text-red-700",
  Archived: "bg-muted text-muted-foreground",
};

export function GrantDetailView({ grantId }: { grantId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const grant = useAuthedQuery(api.grants.getGrant, { id: grantId as Id<"grants"> });
  const funder = useAuthedQuery(api.funders.getFunder, grant?.funderId ? { id: grant.funderId } : "skip");

  if (grant === undefined) return <Skeleton className="h-64 w-full" />;
  if (grant === null) return <p className="text-muted-foreground">Grant not found.</p>;

  return (
    <Card data-demo="grant-detail-view">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl">{grant.name}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{funder?.name ?? "Loading funder..."}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[grant.status]}`}>
            {grant.status}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              router.push(withPreservedDemoQuery(`/grants/${grantId}/edit`, searchParams))
            }
          >
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-muted-foreground">Category</span><p className="font-medium mt-0.5">{grant.category}</p></div>
        <div><span className="text-muted-foreground">Deadline</span><p className="font-medium mt-0.5">{format(new Date(grant.deadline), "MMM d, yyyy")}</p></div>
        <div><span className="text-muted-foreground">Amount Range</span><p className="font-medium mt-0.5">
          {grant.amountMin != null ? `$${grant.amountMin.toLocaleString()}` : "—"} – {grant.amountMax != null ? `$${grant.amountMax.toLocaleString()}` : "—"}
        </p></div>
        <div><span className="text-muted-foreground">Recurring</span><p className="font-medium mt-0.5">{grant.isRecurring ? "Yes" : "No"}</p></div>
        {grant.eligibilityRequirements && (
          <div className="col-span-2"><span className="text-muted-foreground">Eligibility</span><p className="mt-0.5">{grant.eligibilityRequirements}</p></div>
        )}
        {grant.description && (
          <div className="col-span-2"><span className="text-muted-foreground">Description</span><p className="mt-0.5">{grant.description}</p></div>
        )}
      </CardContent>
    </Card>
  );
}
