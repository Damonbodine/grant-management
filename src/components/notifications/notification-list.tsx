"use client";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck } from "lucide-react";
import { Id } from "@convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/use-authed-query";

const TYPE_ICONS: Record<string, string> = {
  DeadlineApproaching: "⏰",
  StageChanged: "🔄",
  TaskAssigned: "✅",
  ReportDue: "📋",
  AwardUpdated: "🏆",
  SystemAlert: "⚠️",
};

export function NotificationList() {
  const [statusFilter, setStatusFilter] = useState("all");
  const currentUser = useAuthedQuery(api.users.getCurrentUser);

  const notifications = useAuthedQuery(
    api.notifications.listNotifications,
    currentUser ? { userId: currentUser._id, isRead: statusFilter === "unread" ? false : statusFilter === "read" ? true : undefined } : "skip"
  );
  const markRead = useMutation(api.notifications.markNotificationRead);
  const markAllRead = useMutation(api.notifications.markAllNotificationsRead);

  if (notifications === undefined) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
        {currentUser && (
          <Button size="sm" variant="outline" onClick={() => markAllRead({ userId: currentUser._id })}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark All Read
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {notifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No notifications.</p>}
        {notifications.map((notif: typeof notifications[number]) => (
          <Card key={notif._id} className={`${!notif.isRead ? "border-primary/30 bg-primary/5" : ""}`}>
            <CardContent className="flex items-start gap-3 py-3">
              <span className="text-lg flex-shrink-0">{TYPE_ICONS[notif.type] ?? "🔔"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{notif.title}</p>
                  {!notif.isRead && <Badge className="h-4 text-xs bg-primary text-primary-foreground">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
              </div>
              {!notif.isRead && (
                <Button size="sm" variant="ghost" className="flex-shrink-0" onClick={() => markRead({ id: notif._id })}>
                  Mark read
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}