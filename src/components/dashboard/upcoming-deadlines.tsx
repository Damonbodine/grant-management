"use client";

import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";
import { useAuthedQuery } from "@/hooks/use-authed-query";

export function UpcomingDeadlines() {
  const deadlines = useAuthedQuery(api.dashboard.getUpcomingDeadlines, { daysAhead: 30 });

  if (deadlines === undefined) {
    return <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Days Left</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deadlines.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No upcoming deadlines.</TableCell></TableRow>
            )}
            {deadlines.slice(0, 10).map((d: typeof deadlines[number]) => {
              const days = differenceInDays(new Date(d.deadline), new Date());
              const urgency = days <= 3 ? "destructive" : days <= 7 ? "secondary" : "outline";
              return (
                <TableRow key={d.id} className={days < 0 ? "bg-destructive/5" : ""}>
                  <TableCell className="font-medium text-sm">{d.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{d.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{format(new Date(d.deadline), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={urgency} className="text-xs">
                      {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}