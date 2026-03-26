"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Id } from "@convex/_generated/dataModel";

export function FunderDetailView({ funderId }: { funderId: string }) {
  const router = useRouter();
  const funder = useQuery(api.funders.getFunder, { id: funderId as any });
  const grants = useQuery(api.grants.getGrantsByFunder, { funderId: funderId as any });

  if (funder === undefined) return <Skeleton className="h-64 w-full" />;
  if (funder === null) return <p className="text-muted-foreground">Funder not found.</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{funder.name}</CardTitle>
            <Badge variant="outline" className="mt-2">{funder.type}</Badge>
          </div>
          <Button size="sm" variant="outline" onClick={() => router.push(`/funders/${funderId}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          {funder.contactName && <div><span className="text-muted-foreground">Contact</span><p className="font-medium mt-0.5">{funder.contactName}</p></div>}
          {funder.contactEmail && <div><span className="text-muted-foreground">Email</span><p className="font-medium mt-0.5">{funder.contactEmail}</p></div>}
          {funder.contactPhone && <div><span className="text-muted-foreground">Phone</span><p className="font-medium mt-0.5">{funder.contactPhone}</p></div>}
          {funder.website && <div><span className="text-muted-foreground">Website</span><a href={funder.website} target="_blank" rel="noreferrer" className="font-medium mt-0.5 text-primary underline block">{funder.website}</a></div>}
          <div><span className="text-muted-foreground">Relationship</span><p className="font-medium mt-0.5">{funder.relationshipStatus}</p></div>
          {funder.averageAwardSize && <div><span className="text-muted-foreground">Avg Award</span><p className="font-medium mt-0.5">${funder.averageAwardSize.toLocaleString()}</p></div>}
          {funder.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes</span><p className="mt-0.5">{funder.notes}</p></div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Associated Grants</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Grant</TableHead><TableHead>Status</TableHead><TableHead>Deadline</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              {grants?.map((g: typeof grants[number]) => (
                <TableRow key={g._id} className="cursor-pointer hover:bg-muted/40" onClick={() => router.push(`/grants/${g._id}`)}>          
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell><Badge variant="outline">{g.status}</Badge></TableCell>
                  <TableCell>{format(new Date(g.deadline), "MMM d, yyyy")}</TableCell>
                  <TableCell>{g.amountMax ? `$${g.amountMax.toLocaleString()}` : "—"}</TableCell>
                </TableRow>
              ))}
              {grants?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No grants linked.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}