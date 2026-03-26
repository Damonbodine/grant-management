"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700",
  InReview: "bg-blue-100 text-blue-700",
  Submitted: "bg-indigo-100 text-indigo-700",
  Accepted: "bg-emerald-100 text-emerald-700",
};

export function ReportListTable({ awardId }: { awardId: string }) {
  const router = useRouter();
  const reports = useQuery(api.reports.getReportsByAward, { awardId: awardId as any });
  const deleteReport = useMutation(api.reports.deleteReport);

  if (reports === undefined) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No reports yet.</TableCell></TableRow>
          )}
          {reports.map((report: typeof reports[number]) => {
            const isOverdue = report.status !== "Submitted" && report.status !== "Accepted" && isPast(new Date(report.dueDate));
            return (
              <TableRow key={report._id} className={cn("hover:bg-muted/40", isOverdue && "bg-destructive/5")}>
                <TableCell className="font-medium">{report.title}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{report.type}</Badge></TableCell>
                <TableCell className={cn("text-sm", isOverdue && "text-destructive font-medium")}>
                  {format(new Date(report.dueDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[report.status]}`}>{report.status}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {report.submittedDate ? format(new Date(report.submittedDate), "MMM d, yyyy") : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => router.push(`/awards/${awardId}/reports/${report._id}`)}><Eye className="h-4 w-4" /></Button>
                    {report.status === "Draft" && (
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteReport({ id: report._id })}><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}