"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const ACTION_COLORS: Record<string, string> = {
  Create: "bg-emerald-500",
  Update: "bg-primary",
  Delete: "bg-destructive",
  StageChange: "bg-accent",
  Approval: "bg-emerald-500",
  Submission: "bg-secondary",
};

export function RecentActivityFeed() {
  const logs = useQuery(api.auditLogs.getRecentActivity, { limit: 20 });

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
            {logs.map((log: typeof logs[number]) => (
              <div key={log._id} className="flex items-start gap-3">
                <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${ACTION_COLORS[log.action] ?? "bg-muted"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{log.action}</span>{" "}
                    <span className="text-muted-foreground">{log.entityType}</span>
                  </p>
                  {log.details && (
                    <p className="text-xs text-muted-foreground truncate">{log.details}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}