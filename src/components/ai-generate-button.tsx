"use client";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface AiGenerateButtonProps {
  fieldName: string;
  context: Record<string, unknown>;
  onGenerated: (text: string) => void;
  disabled?: boolean;
}

export function AiGenerateButton({
  fieldName,
  context,
  onGenerated,
  disabled,
}: AiGenerateButtonProps) {
  const generate = useAction(api.ai.generate);
  const [generating, setGenerating] = useState(false);

  async function handleClick() {
    setGenerating(true);
    try {
      const result = await generate({ fieldName, context });
      onGenerated(result);
    } catch (err) {
      console.error("AI generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || generating}
      onClick={handleClick}
    >
      {generating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate with AI
        </>
      )}
    </Button>
  );
}
