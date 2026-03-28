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

interface ProposalNarrativeGeneratorProps {
  applicationId: string;
}

export function ProposalNarrativeGenerator({ applicationId }: ProposalNarrativeGeneratorProps) {
  const application = useAuthedQuery(api.applications.getApplication, { id: applicationId as Id<"applications"> });
  const grant = useAuthedQuery(api.grants.getGrant, application?.grantId ? { id: application.grantId } : "skip");
  const funder = useAuthedQuery(api.funders.getFunder, grant?.funderId ? { id: grant.funderId } : "skip");
  const generateNarrative = useAction(api.ai.generateProposalNarrative);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    needStatement: string;
    projectDescription: string;
    goalsAndObjectives: string;
    evaluationPlan: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!application || !grant) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    try {
      const narrative = await generateNarrative({
        grantName: grant.name,
        funderName: funder?.name ?? "Unknown Funder",
        programDescription: grant.description ?? "No description provided",
        targetPopulation: "Target population as described in the grant application",
        goals: application.projectSummary ?? "Goals as outlined in the application",
        requestedAmount: application.requestedAmount,
        projectSummary: application.projectSummary,
      });
      setResult(narrative);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  const sections = result
    ? [
        { title: "Need Statement", content: result.needStatement },
        { title: "Project Description", content: result.projectDescription },
        { title: "Goals & Objectives", content: result.goalsAndObjectives },
        { title: "Evaluation Plan", content: result.evaluationPlan },
      ]
    : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5" />
          Proposal Narrative Generator
        </CardTitle>
        <Button
          onClick={handleGenerate}
          disabled={generating || !application || !grant}
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
        {generating && (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
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
            Click &quot;Generate Draft&quot; to create first-draft narrative sections from the application data.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
