"use client";

import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useAuthedQuery } from "@/hooks/use-authed-query";

const ACTION_COLORS: Record<string, string> = {
  Create: "bg-emerald-500",
  Update: "bg-primary",
  Delete: "bg-destructive",
  StageChange: "bg-accent",
  Approval: "bg-emerald-500",
  Submission: "bg-secondary",
};

function formatDetails(details: string | undefined): string | null {
  if (!details) return null;
  // Try to parse as JSON and format human-readably
  try {
    const parsed = JSON.parse(details);
    if (typeof parsed === "object" && parsed !== null) {
      const parts: string[] = [];
      if (parsed.fromStage && parsed.toStage) {
        parts.push(`${parsed.fromStage} → ${parsed.toStage}`);
      }
      if (parsed.note) parts.push(parsed.note);
      if (parsed.expenditureDescription) parts.push(parsed.expenditureDescription);
      if (parsed.amount) parts.push(`$${Number(parsed.amount).toLocaleString()}`);
      if (parsed.approvedBy) parts.push(`Approved by ${parsed.approvedBy}`);
      if (parts.length > 0) return parts.join(" · ");
      // Fallback: show key-value pairs
      return Object.entries(parsed)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    }
  } catch {
    // Not JSON, return as-is
  }
  return details;
}

export function RecentActivityFeed() {
  const logs = useAuthedQuery(api.auditLogs.getRecentActivity, { limit: 20 });

  if (logs === undefined) {
    return <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {logs.length === 0 && (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
            {logs.map((log: typeof logs[number]) => {
              const formattedDetails = formatDetails(log.details);
              return (
                <div key={log._id} className="flex items-start gap-3">
                  <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${ACTION_COLORS[log.action] ?? "bg-muted"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{(log as any).actorName ?? "System"}</span>{" "}
                      <span className="text-muted-foreground lowercase">{log.action === "StageChange" ? "changed stage on" : log.action === "Approval" ? "approved" : `${log.action.toLowerCase()}d`}</span>{" "}
                      <span className="text-foreground">{log.entityType}</span>
                    </p>
                    {formattedDetails && (
                      <p className="text-xs text-muted-foreground truncate">{formattedDetails}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}