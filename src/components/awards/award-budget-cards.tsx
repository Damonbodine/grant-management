"use client";

import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingDown, Wallet, BarChart2 } from "lucide-react";
import { Id } from "@convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/use-authed-query";

export function AwardBudgetCards({ awardId }: { awardId: string }) {
  const award = useAuthedQuery(api.awards.getAward, { id: awardId as Id<"awards"> });

  if (award === undefined) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (award === null) return null;

  const pctUsed = award.awardedAmount > 0 ? Math.round((award.totalSpent / award.awardedAmount) * 100) : 0;

  const cards = [
    { title: "Awarded", value: `$${award.awardedAmount.toLocaleString()}`, icon: DollarSign, accent: "stat-card-primary" },
    { title: "Spent", value: `$${award.totalSpent.toLocaleString()}`, icon: TrendingDown, accent: "stat-card-secondary" },
    { title: "Remaining", value: `$${award.remainingBalance.toLocaleString()}`, icon: Wallet, accent: "stat-card-accent" },
    { title: "Utilization", value: `${pctUsed}%`, icon: BarChart2, accent: "stat-card-primary", extra: <Progress value={pctUsed} className="h-1.5 mt-2" /> },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className={card.accent}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.extra}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}