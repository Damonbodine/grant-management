"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Trophy, TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStatCards() {
  const stats = useQuery(api.dashboard.getDashboardStats);

  if (stats === undefined) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Active Pipeline",
      value: stats.activeApplications,
      icon: FileText,
      accent: "stat-card-primary",
      sub: `${stats.applicationsByStage?.InReview ?? 0} in review`,
    },
    {
      title: "Active Awards",
      value: stats.totalAwards,
      icon: Trophy,
      accent: "stat-card-accent",
      sub: `${stats.activeAwardsByStatus?.AtRisk ?? 0} at risk`,
    },
    {
      title: "Total Awarded",
      value: `$${(stats.totalAwardedAmount / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      accent: "stat-card-secondary",
      sub: `${stats.totalGrants} grants tracked`,
    },
    {
      title: "Open Grants",
      value: stats.openGrants,
      icon: AlertTriangle,
      accent: "stat-card-primary",
      sub: `${stats.totalFunders} funders`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className={cn("bg-card", card.accent)}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { cn } from "@/lib/utils";