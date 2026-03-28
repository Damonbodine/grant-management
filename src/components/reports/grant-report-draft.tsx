"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuthedQuery } from "@/hooks/use-authed-query";
import { format } from "date-fns";

interface GrantReportDraftProps {
  reportId: string;
}

export function GrantReportDraft({ reportId }: GrantReportDraftProps) {
  const report = useAuthedQuery(api.reports.getReport, { id: reportId as Id<"reports"> });
  const award = useAuthedQuery(api.awards.getAward, report?.awardId ? { id: report.awardId } : "skip");
  const grant = useAuthedQuery(api.grants.getGrant, award?.grantId ? { id: award.grantId } : "skip");
  const expenditures = useAuthedQuery(api.expenditures.getExpenditureSummaryByCategory, report?.awardId ? { awardId: report.awardId } : "skip");
  const generateDraft = useAction(api.ai.generateReportDraft);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    executiveSummary: string;
    activities: string;
    outcomes: string;
    budgetSummary: string;
    challenges: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!report || !award || !grant) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    try {
      const expenditureSummaryText = expenditures
        ? Object.entries(expenditures)
            .filter(([_, data]) => data.count > 0)
            .map(([cat, data]) => `${cat}: $${data.total.toLocaleString()} (${data.count} items, $${data.approved.toLocaleString()} approved)`)
            .join("\n")
        : "No expenditure data available.";

      const draft = await generateDraft({
        awardInfo: `Grant: ${grant.name}. Awarded: $${award.awardedAmount.toLocaleString()}. Status: ${award.status}. Total Spent: $${award.totalSpent.toLocaleString()}. Remaining: $${award.remainingBalance.toLocaleString()}. Deliverables: ${award.deliverables ?? "N/A"}`,
        expenditureSummary: expenditureSummaryText,
        reportType: report.type,
        periodStart: report.periodStart,
        periodEnd: report.periodEnd,
      });
      setResult(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  const sections = result
    ? [
        { title: "Executive Summary", content: result.executiveSummary },
        { title: "Activities", content: result.activities },
        { title: "Outcomes", content: result.outcomes },
        { title: "Budget Summary", content: result.budgetSummary },
        { title: "Challenges", content: result.challenges },
      ]
    : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5" />
          Grant Report Draft Generator
        </CardTitle>
        <Button
          onClick={handleGenerate}
          disabled={generating || !report || !award}
          size="sm"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Draft
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {report && (
          <p className="text-xs text-muted-foreground">
            {report.type} report for {format(new Date(report.periodStart), "MMM d, yyyy")} – {format(new Date(report.periodEnd), "MMM d, yyyy")}
          </p>
        )}

        {generating && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <h4 className="text-sm font-semibold">{section.title}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{section.content}</p>
          </div>
        ))}

        {!result && !generating && !error && (
          <p className="text-sm text-muted-foreground">
            Click &quot;Generate Draft&quot; to create a full report draft from award and expenditure data.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
