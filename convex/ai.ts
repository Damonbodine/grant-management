import { action } from "./_generated/server";
import { v } from "convex/values";

const PROMPTS: Record<string, string> = {
  projectSummary:
    "You are a nonprofit grant writer. Write a compelling project summary for a grant application. Highlight the organization's mission alignment with the funder's priorities. Be specific about objectives, target population, and expected outcomes. Keep it under 300 words. Output only the summary text.",
  applicationNotes:
    "You are a grant manager tracking application progress. Write a brief internal note documenting the current status and next steps. Be concise and actionable. Output only the note text.",
  reportContent:
    "You are writing a grant progress report for a funder. Summarize activities completed, expenditures against budget, outcomes achieved, and any challenges. Use professional, funder-facing language. Output only the report text.",
  funderNotes:
    "You are a grants manager documenting funder research. Summarize the funder's priorities, typical grant sizes, and any relationship history. Note alignment with your organization's programs. Output only the notes text.",
};

export const generate = action({
  args: {
    fieldName: v.string(),
    context: v.any(),
  },
  handler: async (ctx, args) => {
    const systemPrompt = PROMPTS[args.fieldName];
    if (!systemPrompt) {
      throw new Error(`Unknown field name: ${args.fieldName}`);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is not set");
    }

    const userMessage =
      typeof args.context === "string"
        ? args.context
        : JSON.stringify(args.context, null, 2);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-super-120b-a12b:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("No content returned from OpenRouter API");
    }

    return text as string;
  },
});
