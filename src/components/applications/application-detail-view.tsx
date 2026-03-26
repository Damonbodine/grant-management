"use client";

import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/use-authed-query";

const STAGE_COLORS: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700",
  InReview: "bg-blue-100 text-blue-700",
  Submitted: "bg-indigo-100 text-indigo-700",
  UnderFunderReview: "bg-violet-100 text-violet-700",
  Awarded: "bg-emerald-100 text-emerald-700",
  Declined: "bg-red-100 text-red-700",
  Withdrawn: "bg-muted text-muted-foreground",
};

export function ApplicationDetailView({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const application = useAuthedQuery(api.applications.getApplication, { id: applicationId as Id<"applications"> });
  const grant = useAuthedQuery(api.grants.getGrant, application?.grantId ? { id: application.grantId } : "skip");

  if (application === undefined) return <Skeleton className="h-64 w-full" />;
  if (application === null) return <p className="text-muted-foreground">Application not found.</p>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl">{application.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{grant?.name ?? "Loading grant..."}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STAGE_COLORS[application.stage]}`}>{application.stage}</span>
          <Button size="sm" variant="outline" onClick={() => router.push(`/applications/${applicationId}/workspace`)}>
            Open Workspace
          </Button>
          {application.stage === "InReview" && (
            <Button size="sm" onClick={() => router.push(`/applications/${applicationId}/review`)}>
              Review
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-muted-foreground">Requested Amount</span><p className="font-medium mt-0.5">${application.requestedAmount.toLocaleString()}</p></div>
        <div><span className="text-muted-foreground">Priority</span><p className="font-medium mt-0.5">{application.priority}</p></div>
        {application.submittedDate && <div><span className="text-muted-foreground">Submitted</span><p className="font-medium mt-0.5">{new Date(application.submittedDate).toLocaleDateString()}</p></div>}
        {application.internalScore != null && <div><span className="text-muted-foreground">Internal Score</span><p className="font-medium mt-0.5">{application.internalScore}/10</p></div>}
        {application.projectSummary && <div className="col-span-2"><span className="text-muted-foreground">Project Summary</span><p className="mt-0.5">{application.projectSummary}</p></div>}
        {application.decisionNotes && <div className="col-span-2"><span className="text-muted-foreground">Decision Notes</span><p className="mt-0.5">{application.decisionNotes}</p></div>}
      </CardContent>
    </Card>
  );
}