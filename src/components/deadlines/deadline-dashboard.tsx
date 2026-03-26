"use client";

import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuthedQuery } from "@/hooks/use-authed-query";

export function DeadlineDashboard() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [timeframeFilter, setTimeframeFilter] = useState("Next30Days");

  const daysMap: Record<string, number> = {
    Next7Days: 7,
    Next30Days: 30,
    Overdue: 0,
    All: 365,
  };

  const deadlines = useAuthedQuery(api.dashboard.getUpcomingDeadlines, { daysAhead: daysMap[timeframeFilter] ?? 30 });

  if (deadlines === undefined) return <Skeleton className="h-64 w-full" />;

  type Deadline = typeof deadlines[number];
  const filtered = deadlines.filter((d: Deadline) => typeFilter === "all" || d.type === typeFilter);

  const overdue = filtered.filter((d: Deadline) => differenceInDays(new Date(d.deadline), new Date()) < 0).length;
  const thisWeek = filtered.filter((d: Deadline) => { const days = differenceInDays(new Date(d.deadline), new Date()); return days >= 0 && days <= 7; }).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Overdue", value: overdue, color: "text-destructive" },
          { label: "Due This Week", value: thisWeek, color: "text-secondary" },
          { label: "Total Shown", value: filtered.length, color: "text-foreground" },
          { label: "On Track", value: filtered.length - overdue, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">All Deadlines</CardTitle>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Grant">Grant</SelectItem>
                <SelectItem value="Application">Application</SelectItem>
                <SelectItem value="Report">Report</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframeFilter} onValueChange={(v) => setTimeframeFilter(v ?? "Next30Days")}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Next7Days">Next 7 Days</SelectItem>
                <SelectItem value="Next30Days">Next 30 Days</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="All">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No deadlines found.</TableCell></TableRow>}
              {filtered.map((d: Deadline) => {
                const days = differenceInDays(new Date(d.deadline), new Date());
                const isOverdue = days < 0;
                return (
                  <TableRow key={d.id} className={cn(isOverdue && "bg-destructive/5")}>
                    <TableCell className="font-medium text-sm">{d.title}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{d.type}</Badge></TableCell>
                    <TableCell className="text-sm">{format(new Date(d.deadline), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={isOverdue ? "destructive" : days <= 7 ? "secondary" : "outline"} className="text-xs">
                        {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d`}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}