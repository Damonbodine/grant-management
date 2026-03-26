"use client";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Id } from "@convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/use-authed-query";

export function ExpenditureListTable({ awardId, categoryFilter }: { awardId: string; categoryFilter?: string }) {
  const expenditures = useAuthedQuery(api.expenditures.listExpenditures, {
    awardId: awardId as Id<"awards">,
    category: categoryFilter && categoryFilter !== "all" ? (categoryFilter as "Personnel" | "Supplies" | "Travel" | "Equipment" | "Contractual" | "Indirect" | "Other") : undefined,
  });
  const deleteExpenditure = useMutation(api.expenditures.deleteExpenditure);

  if (expenditures === undefined) return <Skeleton className="h-48 w-full" />;

  const total = expenditures.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Approved</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenditures.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No expenditures recorded.</TableCell></TableRow>
          )}
          {expenditures.map((exp) => (
            <TableRow key={exp._id} className="hover:bg-muted/40">
              <TableCell className="font-medium">{exp.description}</TableCell>
              <TableCell><Badge variant="outline" className="text-xs">{exp.category}</Badge></TableCell>
              <TableCell className="text-sm">{format(new Date(exp.date), "MMM d, yyyy")}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{exp.vendor ?? "—"}</TableCell>
              <TableCell>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${exp.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-secondary/20 text-amber-700"}`}>
                  {exp.isApproved ? "Approved" : "Pending"}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">${exp.amount.toLocaleString()}</TableCell>
              <TableCell>
                {!exp.isApproved && (
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteExpenditure({ id: exp._id })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5} className="font-semibold">Total</TableCell>
            <TableCell className="text-right font-bold">${total.toLocaleString()}</TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}