import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireRole, writeAuditLog } from "./helpers";

type ReportStatus = "Draft" | "InReview" | "Submitted" | "Accepted";

const REPORT_STATUS_ORDER: ReportStatus[] = ["Draft", "InReview", "Submitted", "Accepted"];

function isValidReportTransition(current: ReportStatus, target: ReportStatus): boolean {
  const currentIdx = REPORT_STATUS_ORDER.indexOf(current);
  const targetIdx = REPORT_STATUS_ORDER.indexOf(target);
  return targetIdx === currentIdx + 1;
}

export const listReports = query({
  args: {
    awardId: v.id("awards"),
    status: v.optional(v.union(v.literal("Draft"), v.literal("InReview"), v.literal("Submitted"), v.literal("Accepted"))),
    type: v.optional(v.union(v.literal("Progress"), v.literal("Financial"), v.literal("Final"), v.literal("Interim"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    if (args.status !== undefined) {
      const byStatus = await ctx.db
        .query("reports")
        .withIndex("by_awardId_status", (q) =>
          q.eq("awardId", args.awardId).eq("status", args.status!)
        )
        .collect();
      if (args.type !== undefined) {
        return byStatus.filter((r) => r.type === args.type);
      }
      return byStatus;
    }
    const all = await ctx.db
      .query("reports")
      .withIndex("by_awardId", (q) => q.eq("awardId", args.awardId))
      .collect();
    if (args.type !== undefined) {
      return all.filter((r) => r.type === args.type);
    }
    return all;
  },
});

export const getReport = query({
  args: { id: v.id("reports") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db.get(args.id);
  },
});

export const createReport = mutation({
  args: {
    awardId: v.id("awards"),
    authorId: v.id("users"),
    title: v.string(),
    type: v.union(v.literal("Progress"), v.literal("Financial"), v.literal("Final"), v.literal("Interim")),
    periodStart: v.number(),
    periodEnd: v.number(),
    dueDate: v.number(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager", "GrantWriter"]);
    if (args.periodEnd <= args.periodStart) throw new Error("VALIDATION_ERROR: periodEnd must be after periodStart");
    const award = await ctx.db.get(args.awardId);
    if (!award) throw new Error("NOT_FOUND");
    const id = await ctx.db.insert("reports", {
      ...args,
      status: "Draft",
      createdAt: Date.now(),
    });
    await writeAuditLog(ctx, caller._id, "Create", "reports", id, `Created report: ${args.title}`);
    return id;
  },
});

export const updateReport = mutation({
  args: {
    id: v.id("reports"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    periodStart: v.optional(v.number()),
    periodEnd: v.optional(v.number()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const caller = await getCurrentUser(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    // Only author or Admin/GrantManager can edit
    if (caller.role !== "Admin" && caller.role !== "GrantManager" && existing.authorId !== caller._id) {
      throw new Error("FORBIDDEN");
    }
    // Only editable if in Draft or InReview
    if (existing.status !== "Draft" && existing.status !== "InReview") {
      throw new Error("FORBIDDEN: Report cannot be edited in current status");
    }
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
    await writeAuditLog(ctx, caller._id, "Update", "reports", id, `Updated report`);
  },
});

export const deleteReport = mutation({
  args: { id: v.id("reports") },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    if (existing.status !== "Draft") throw new Error("FORBIDDEN: Can only delete Draft reports");
    await ctx.db.delete(args.id);
    await writeAuditLog(ctx, caller._id, "Delete", "reports", args.id, `Deleted report: ${existing.title}`);
  },
});

export const getReportsByAward = query({
  args: { awardId: v.id("awards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db
      .query("reports")
      .withIndex("by_awardId", (q) => q.eq("awardId", args.awardId))
      .order("desc")
      .collect();
  },
});

export const advanceReportStage = mutation({
  args: {
    id: v.id("reports"),
    targetStatus: v.union(v.literal("Draft"), v.literal("InReview"), v.literal("Submitted"), v.literal("Accepted")),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    if (!isValidReportTransition(existing.status as ReportStatus, args.targetStatus as ReportStatus)) {
      throw new Error("INVALID_REPORT_TRANSITION");
    }
    const updates: Record<string, any> = {
      status: args.targetStatus,
    };
    if (args.targetStatus === "Submitted") {
      updates.submittedDate = Date.now();
    }
    await ctx.db.patch(args.id, updates);
    await writeAuditLog(
      ctx, caller._id, "StageChange", "reports", args.id,
      `Report status: ${existing.status} -> ${args.targetStatus}`
    );
    if (args.targetStatus === "Submitted") {
      await writeAuditLog(
        ctx, caller._id, "Submission", "reports", args.id,
        `Report submitted: ${existing.title}`
      );
    }
  },
});
