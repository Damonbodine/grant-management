"use client";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Id } from "@convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/use-authed-query";
import { withPreservedDemoQuery } from "@/lib/demo";

const STATUS_COLORS: Record<string, string> = {
  Researching: "bg-slate-100 text-slate-700",
  Upcoming: "bg-blue-100 text-blue-700",
  Open: "bg-emerald-100 text-emerald-700",
  Closed: "bg-red-100 text-red-700",
  Archived: "bg-muted text-muted-foreground",
};

interface GrantListTableProps {
  statusFilter?: string;
  categoryFilter?: string;
  searchFilter?: string;
}

export function GrantListTable({ statusFilter, categoryFilter, searchFilter }: GrantListTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const grants = useAuthedQuery(api.grants.listGrants, {
    status: statusFilter && statusFilter !== "all" ? (statusFilter as "Researching" | "Upcoming" | "Open" | "Closed" | "Archived") : undefined,
    category: categoryFilter && categoryFilter !== "all" ? (categoryFilter as "General Operating" | "Program" | "Capital" | "Capacity Building" | "Research" | "Emergency" | "Other") : undefined,
  });
  const deleteGrant = useMutation(api.grants.deleteGrant);

  if (grants === undefined) {
    return <Skeleton className="h-48 w-full" />;
  }

  const filtered = grants.filter((g: typeof grants[number]) =>
    !searchFilter || g.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="rounded-md border border-border" data-demo="grants-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Grant Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount Range</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No grants found.</TableCell></TableRow>
          )}
          {filtered.map((grant: typeof filtered[number], index: number) => (
            <TableRow key={grant._id} className="hover:bg-muted/40">
              <TableCell className="font-medium">{grant.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{grant.category}</TableCell>
              <TableCell className="text-sm">
                {grant.amountMin != null || grant.amountMax != null
                  ? `$${(grant.amountMin ?? 0).toLocaleString()} – $${(grant.amountMax ?? 0).toLocaleString()}`
                  : "—"}
              </TableCell>
              <TableCell className="text-sm">{format(new Date(grant.deadline), "MMM d, yyyy")}</TableCell>
              <TableCell>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[grant.status]}`}>
                  {grant.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    data-demo={index === 0 ? "primary-grant-link" : undefined}
                    onClick={() =>
                      router.push(
                        withPreservedDemoQuery(`/grants/${grant._id}`, searchParams),
                      )
                    }
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => router.push(`/grants/${grant._id}/edit`)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteGrant({ id: grant._id as Id<"grants"> })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
