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

interface BudgetJustificationWriterProps {
  awardId: string;
}

export function BudgetJustificationWriter({ awardId }: BudgetJustificationWriterProps) {
  const award = useAuthedQuery(api.awards.getAward, { id: awardId as Id<"awards"> });
  const summary = useAuthedQuery(api.expenditures.getExpenditureSummaryByCategory, { awardId: awardId as Id<"awards"> });
  const grant = useAuthedQuery(api.grants.getGrant, award?.grantId ? { id: award.grantId } : "skip");
  const generateJustification = useAction(api.ai.generateBudgetJustification);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!summary || !award || !grant) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    try {
      const categories = Object.entries(summary)
        .filter(([_, data]) => data.count > 0)
        .map(([category, data]) => ({
          category,
          total: data.total,
          count: data.count,
        }));

      if (categories.length === 0) {
        setError("No expenditures recorded yet. Add expenditures first.");
        setGenerating(false);
        return;
      }

      const justification = await generateJustification({
        budgetCategories: categories,
        grantName: grant.name,
        awardedAmount: award.awardedAmount,
      });
      setResult(justification);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5" />
          Budget Justification Writer
        </CardTitle>
        <Button
          onClick={handleGenerate}
          disabled={generating || !summary || !award}
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
              Generate Justifications
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {generating && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {result && !result.error && (
          <div className="space-y-4">
            {Object.entries(result).map(([category, justification]) => (
              <div key={category} className="flex flex-col gap-1">
                <h4 className="text-sm font-semibold">{category}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{justification}</p>
              </div>
            ))}
          </div>
        )}

        {result?.error && (
          <p className="text-sm text-red-600">{result.error}</p>
        )}

        {!result && !generating && !error && (
          <p className="text-sm text-muted-foreground">
            Click &quot;Generate Justifications&quot; to create prose justifications for each budget category.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
