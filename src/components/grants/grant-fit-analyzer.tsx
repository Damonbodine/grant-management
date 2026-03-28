"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuthedQuery } from "@/hooks/use-authed-query";

interface GrantFitAnalyzerProps {
  grantId: string;
}

export function GrantFitAnalyzer({ grantId }: GrantFitAnalyzerProps) {
  const organizations = useAuthedQuery(api.organizations.listOrganizations);
  const analyzeGrantFit = useAction(api.ai.analyzeGrantFit);
  const [rfpText, setRfpText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    alignmentPoints: string[];
    gaps: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const org = organizations?.[0];

  async function handleAnalyze() {
    if (!rfpText.trim()) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const analysis = await analyzeGrantFit({
        rfpText,
        organizationProfile: org
          ? `${org.name} — Mission: ${org.mission ?? "N/A"}. Annual Budget: $${org.annualBudget?.toLocaleString() ?? "N/A"}. Location: ${org.city}, ${org.state}.`
          : "Organization profile not available.",
        currentPrograms: "Programs as described in organization profile and active grants.",
      });
      setResult(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5" />
          Grant Fit Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Textarea
          placeholder="Paste the funder's RFP text here to analyze fit with your organization..."
          value={rfpText}
          onChange={(e) => setRfpText(e.target.value)}
          rows={6}
        />
        <Button
          onClick={handleAnalyze}
          disabled={analyzing || !rfpText.trim()}
          className="w-fit"
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Fit
            </>
          )}
        </Button>

        {analyzing && <Skeleton className="h-32 w-full" />}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {result && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">{result.score}</span>
              <span className="text-muted-foreground text-sm">/10 Fit Score</span>
            </div>

            {result.alignmentPoints.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Alignment Points
                </h4>
                <ul className="space-y-1">
                  {result.alignmentPoints.map((point, i) => (
                    <li key={i} className="text-sm text-muted-foreground pl-5">• {point}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.gaps.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Gaps
                </h4>
                <ul className="space-y-1">
                  {result.gaps.map((gap, i) => (
                    <li key={i} className="text-sm text-muted-foreground pl-5">• {gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
