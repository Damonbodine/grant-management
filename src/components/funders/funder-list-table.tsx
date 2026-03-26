"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";

const TYPE_COLORS: Record<string, string> = {
  Foundation: "bg-indigo-100 text-indigo-700",
  Government: "bg-blue-100 text-blue-700",
  Corporate: "bg-emerald-100 text-emerald-700",
  Individual: "bg-orange-100 text-orange-700",
  Other: "bg-muted text-muted-foreground",
};

interface FunderListTableProps {
  typeFilter?: string;
  searchFilter?: string;
}

export function FunderListTable({ typeFilter, searchFilter }: FunderListTableProps) {
  const router = useRouter();
  const funders = useQuery(api.funders.listFunders, {
    type: typeFilter && typeFilter !== "all" ? (typeFilter as any) : undefined,
  });
  const deleteFunder = useMutation(api.funders.deleteFunder);

  if (funders === undefined) return <Skeleton className="h-48 w-full" />;

  const filtered = funders.filter((f: typeof funders[number]) =>
    !searchFilter || f.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Relationship</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No funders found.</TableCell></TableRow>
          )}
          {filtered.map((funder: typeof filtered[number]) => (
            <TableRow key={funder._id} className="hover:bg-muted/40">
              <TableCell className="font-medium">{funder.name}</TableCell>
              <TableCell>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${TYPE_COLORS[funder.type] ?? ""}`}>{funder.type}</span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{funder.contactName ?? "—"}</TableCell>
              <TableCell className="text-sm">
                {funder.website ? <a href={funder.website} target="_blank" rel="noreferrer" className="text-primary underline">Website</a> : "—"}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">{funder.relationshipStatus}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button size="icon" variant="ghost" onClick={() => router.push(`/funders/${funder._id}`)}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => router.push(`/funders/${funder._id}/edit`)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteFunder({ id: funder._id as Id<"funders"> })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}