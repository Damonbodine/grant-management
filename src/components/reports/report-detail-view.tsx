"use client";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Id } from "@convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/use-authed-query";

const NEXT_STATUS: Record<string, string> = {
  Draft: "InReview",
  InReview: "Submitted",
  Submitted: "Accepted",
};

const STATUS_LABELS: Record<string, string> = {
  InReview: "Submit for Review",
  Submitted: "Mark Submitted",
  Accepted: "Mark Accepted",
};

export function ReportDetailView({ reportId, awardId }: { reportId: string; awardId?: string }) {
  const report = useAuthedQuery(api.reports.getReport, { id: reportId as Id<"reports"> });
  const advanceStage = useMutation(api.reports.advanceReportStage);

  if (report === undefined) return <Skeleton className="h-64 w-full" />;
  if (report === null) return <p className="text-muted-foreground">Report not found.</p>;

  const nextStatus = NEXT_STATUS[report.status];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl">{report.title}</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{report.type}</Badge>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">{report.status}</span>
          </div>
        </div>
        {nextStatus && (
          <Button size="sm" onClick={() => advanceStage({ id: reportId as Id<"reports">, targetStatus: nextStatus as "Draft" | "InReview" | "Submitted" | "Accepted" })}>
            {STATUS_LABELS[nextStatus]}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Due Date</span><p className="font-medium mt-0.5">{format(new Date(report.dueDate), "MMM d, yyyy")}</p></div>
          <div><span className="text-muted-foreground">Period</span><p className="font-medium mt-0.5">{format(new Date(report.periodStart), "MMM d")} – {format(new Date(report.periodEnd), "MMM d, yyyy")}</p></div>
          {report.submittedDate && <div><span className="text-muted-foreground">Submitted</span><p className="font-medium mt-0.5">{format(new Date(report.submittedDate), "MMM d, yyyy")}</p></div>}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Narrative</h4>
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{report.content}</div>
        </div>
      </CardContent>
    </Card>
  );
}