import { action } from "./_generated/server";
import { v } from "convex/values";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

const PROMPTS: Record<string, string> = {
  projectSummary:
    "You are a nonprofit grant writer. Write a compelling project summary for a grant application. Highlight the organization's mission alignment with the funder's priorities. Be specific about objectives, target population, and expected outcomes. Keep it under 300 words. Output only the summary text.",
  applicationNotes:
    "You are a grant manager tracking application progress. Write a brief internal note documenting the current status and next steps. Be concise and actionable. Output only the note text.",
  reportContent:
    "You are writing a grant progress report for a funder. Summarize activities completed, expenditures against budget, outcomes achieved, and any challenges. Use professional, funder-facing language. Output only the report text.",
  funderNotes:
    "You are a grants manager documenting funder research. Summarize the funder's priorities, typical grant sizes, and any relationship history. Note alignment with your organization's programs. Output only the notes text.",
  grantFitAnalysis:
    "You are an expert grant consultant. Analyze the fit between a funder's RFP and a nonprofit organization's profile. Return a JSON object with: \"score\" (integer 1-10), \"alignmentPoints\" (array of strings describing areas of strong alignment), and \"gaps\" (array of strings describing areas of misalignment or weakness). Be specific and actionable. Output ONLY valid JSON, no markdown or extra text.",
  proposalNarrative:
    "You are an expert nonprofit grant writer. Given the grant application context, generate professional first-draft narrative sections. Return a JSON object with these keys: \"needStatement\", \"projectDescription\", \"goalsAndObjectives\", \"evaluationPlan\". Each value should be 2-4 paragraphs of polished, funder-ready prose. Output ONLY valid JSON, no markdown or extra text.",
  budgetJustification:
    "You are a nonprofit finance specialist writing budget justifications for grant proposals. For each budget category provided, write a clear prose justification explaining why each cost is necessary, reasonable, and aligned with the project goals. Return a JSON object where each key is the budget category name and each value is a 2-3 sentence justification paragraph. Output ONLY valid JSON, no markdown or extra text.",
  grantReportDraft:
    "You are a nonprofit grant report writer. Given the award data, expenditures, and program context, generate a comprehensive grant report. Return a JSON object with these keys: \"executiveSummary\", \"activities\", \"outcomes\", \"budgetSummary\", \"challenges\". Each value should be 1-3 paragraphs of professional, funder-facing prose. Output ONLY valid JSON, no markdown or extra text.",
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

async function callOpenRouter(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

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
}

export const analyzeGrantFit = action({
  args: {
    rfpText: v.string(),
    organizationProfile: v.string(),
    currentPrograms: v.string(),
  },
  handler: async (_ctx, args) => {
    const userMessage = JSON.stringify({
      rfpText: args.rfpText,
      organizationProfile: args.organizationProfile,
      currentPrograms: args.currentPrograms,
    }, null, 2);

    const result = await callOpenRouter(PROMPTS.grantFitAnalysis, userMessage);

    try {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as {
        score: number;
        alignmentPoints: string[];
        gaps: string[];
      };
    } catch {
      return { score: 0, alignmentPoints: [], gaps: ["Failed to parse AI response. Raw response: " + result] };
    }
  },
});

export const generateProposalNarrative = action({
  args: {
    grantName: v.string(),
    funderName: v.string(),
    programDescription: v.string(),
    targetPopulation: v.string(),
    goals: v.string(),
    requestedAmount: v.float64(),
    projectSummary: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const userMessage = JSON.stringify(args, null, 2);
    const result = await callOpenRouter(PROMPTS.proposalNarrative, userMessage);

    try {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as {
        needStatement: string;
        projectDescription: string;
        goalsAndObjectives: string;
        evaluationPlan: string;
      };
    } catch {
      return {
        needStatement: "Failed to parse AI response.",
        projectDescription: result,
        goalsAndObjectives: "",
        evaluationPlan: "",
      };
    }
  },
});

export const generateBudgetJustification = action({
  args: {
    budgetCategories: v.array(
      v.object({
        category: v.string(),
        total: v.float64(),
        count: v.float64(),
      })
    ),
    grantName: v.string(),
    awardedAmount: v.float64(),
  },
  handler: async (_ctx, args) => {
    const userMessage = JSON.stringify(args, null, 2);
    const result = await callOpenRouter(PROMPTS.budgetJustification, userMessage);

    try {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as Record<string, string>;
    } catch {
      return { error: "Failed to parse AI response. Raw: " + result } as Record<string, string>;
    }
  },
});

export const generateReportDraft = action({
  args: {
    awardInfo: v.string(),
    expenditureSummary: v.string(),
    reportType: v.string(),
    periodStart: v.float64(),
    periodEnd: v.float64(),
  },
  handler: async (_ctx, args) => {
    const userMessage = JSON.stringify(args, null, 2);
    const result = await callOpenRouter(PROMPTS.grantReportDraft, userMessage);

    try {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as {
        executiveSummary: string;
        activities: string;
        outcomes: string;
        budgetSummary: string;
        challenges: string;
      };
    } catch {
      return {
        executiveSummary: "Failed to parse AI response.",
        activities: result,
        outcomes: "",
        budgetSummary: "",
        challenges: "",
      };
    }
  },
});
