"use client";

import { api } from "@convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuthedQuery } from "@/hooks/use-authed-query";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  OnTrack: "bg-blue-100 text-blue-700",
  AtRisk: "bg-secondary/20 text-amber-700",
  Completed: "bg-muted text-muted-foreground",
  Closed: "bg-muted text-muted-foreground",
};

export function AwardListTable({ statusFilter }: { statusFilter?: string }) {
  const router = useRouter();
  const awards = useAuthedQuery(api.awards.listAwards, {
    status: statusFilter && statusFilter !== "all" ? (statusFilter as "Active" | "OnTrack" | "AtRisk" | "Completed" | "Closed") : undefined,
  });

  if (awards === undefined) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Award</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Awarded</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Next Report</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {awards.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No awards found.</TableCell></TableRow>
          )}
          {awards.map((award: typeof awards[number]) => {
            const daysUntilReport = award.nextReportDueDate
              ? differenceInDays(new Date(award.nextReportDueDate), new Date())
              : null;
            return (
              <TableRow key={award._id} className="hover:bg-muted/40">
                <TableCell className="font-medium">{(award as any).grantName ?? `Award #${award._id.slice(-6)}`}</TableCell>
                <TableCell><span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[award.status]}`}>{award.status}</span></TableCell>
                <TableCell className="text-sm">${award.awardedAmount.toLocaleString()}</TableCell>
                <TableCell className="text-sm">${award.remainingBalance.toLocaleString()}</TableCell>
                <TableCell className="text-sm">
                  {award.nextReportDueDate ? (
                    <span className={cn(daysUntilReport != null && daysUntilReport <= 7 ? "text-secondary font-medium" : "")}>
                      {format(new Date(award.nextReportDueDate), "MMM d, yyyy")}
                    </span>
                  ) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => router.push(`/awards/${award._id}`)}><Eye className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}