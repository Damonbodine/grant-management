"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

const STAGE_COLORS: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700",
  InReview: "bg-blue-100 text-blue-700",
  Submitted: "bg-indigo-100 text-indigo-700",
  UnderFunderReview: "bg-violet-100 text-violet-700",
  Awarded: "bg-emerald-100 text-emerald-700",
  Declined: "bg-red-100 text-red-700",
  Withdrawn: "bg-muted text-muted-foreground",
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-secondary/20 text-amber-700",
  Critical: "bg-destructive/10 text-destructive",
};

export function ApplicationListTable({ stageFilter, priorityFilter, searchFilter }: { stageFilter?: string; priorityFilter?: string; searchFilter?: string }) {
  const router = useRouter();
  const applications = useQuery(api.applications.listApplications, {
    stage: stageFilter && stageFilter !== "all" ? (stageFilter as any) : undefined,
    priority: priorityFilter && priorityFilter !== "all" ? (priorityFilter as any) : undefined,
  });

  if (applications === undefined) return <Skeleton className="h-48 w-full" />;

  const filtered = applications.filter((a) =>
    !searchFilter || a.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No applications found.</TableCell></TableRow>
          )}
          {filtered.map((app) => (
            <TableRow key={app._id} className="hover:bg-muted/40">
              <TableCell className="font-medium">{app.title}</TableCell>
              <TableCell><span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STAGE_COLORS[app.stage]}`}>{app.stage}</span></TableCell>
              <TableCell><span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${PRIORITY_COLORS[app.priority]}`}>{app.priority}</span></TableCell>
              <TableCell className="text-sm">${app.requestedAmount.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" onClick={() => router.push(`/applications/${app._id}`)}><Eye className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}