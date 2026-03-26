"use client";

import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AwardBudgetCards } from "@/components/awards/award-budget-cards";
import { format } from "date-fns";
import { Id } from "@convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/use-authed-query";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  OnTrack: "bg-blue-100 text-blue-700",
  AtRisk: "bg-secondary/20 text-amber-700",
  Completed: "bg-muted text-muted-foreground",
  Closed: "bg-muted text-muted-foreground",
};

export function AwardDetailView({ awardId }: { awardId: string }) {
  const award = useAuthedQuery(api.awards.getAward, { id: awardId as Id<"awards"> });
  const grant = useAuthedQuery(api.grants.getGrant, award?.grantId ? { id: award.grantId } : "skip");

  if (award === undefined) return <Skeleton className="h-64 w-full" />;
  if (award === null) return <p className="text-muted-foreground">Award not found.</p>;

  return (
    <div className="space-y-6">
      <AwardBudgetCards awardId={awardId} />
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{grant?.name ?? "Award Details"}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{award.reportingFrequency} reporting</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[award.status]}`}>{award.status}</span>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Start Date</span><p className="font-medium mt-0.5">{format(new Date(award.startDate), "MMM d, yyyy")}</p></div>
          <div><span className="text-muted-foreground">End Date</span><p className="font-medium mt-0.5">{format(new Date(award.endDate), "MMM d, yyyy")}</p></div>
          <div><span className="text-muted-foreground">Restriction</span><p className="font-medium mt-0.5">{award.restrictionType}</p></div>
          {award.nextReportDueDate && <div><span className="text-muted-foreground">Next Report Due</span><p className="font-medium mt-0.5">{format(new Date(award.nextReportDueDate), "MMM d, yyyy")}</p></div>}
          {award.contactAtFunder && <div><span className="text-muted-foreground">Funder Contact</span><p className="font-medium mt-0.5">{award.contactAtFunder}</p></div>}
          {award.deliverables && <div className="col-span-2"><span className="text-muted-foreground">Deliverables</span><p className="mt-0.5">{award.deliverables}</p></div>}
          {award.complianceNotes && <div className="col-span-2"><span className="text-muted-foreground">Compliance Notes</span><p className="mt-0.5">{award.complianceNotes}</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}