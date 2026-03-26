"use client";

import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthedQuery } from "@/hooks/use-authed-query";

const STAGES = ["Draft", "InReview", "Submitted", "UnderFunderReview", "Awarded", "Declined"] as const;

const STAGE_COLORS: Record<string, string> = {
  Draft: "bg-slate-200 text-slate-700",
  InReview: "bg-blue-100 text-blue-700",
  Submitted: "bg-indigo-100 text-indigo-700",
  UnderFunderReview: "bg-violet-100 text-violet-700",
  Awarded: "bg-emerald-100 text-emerald-700",
  Declined: "bg-red-100 text-red-700",
};

export function PipelineBreakdown() {
  const applications = useAuthedQuery(api.applications.listApplications, {});

  if (applications === undefined) {
    return <Card><CardContent className="pt-6"><Skeleton className="h-40 w-full" /></CardContent></Card>;
  }

  const stageCounts = STAGES.map((stage) => ({
    stage,
    count: applications.filter((a) => a.stage === stage).length,
    total: applications.reduce((sum, a) => sum + (a.stage === stage ? a.requestedAmount : 0), 0),
  }));

  const max = Math.max(...stageCounts.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Pipeline Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stageCounts.map(({ stage, count, total }) => (
          <div key={stage} className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-36 text-center ${STAGE_COLORS[stage]}`}>
              {stage}
            </span>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium w-6 text-right">{count}</span>
            <span className="text-xs text-muted-foreground w-20 text-right">
              ${(total / 1000).toFixed(0)}K
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}