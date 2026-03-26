import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireRole, writeAuditLog } from "./helpers";

const STAGE_ORDER = ["Draft", "InReview", "Submitted", "UnderFunderReview", "Awarded", "Declined", "Withdrawn"] as const;
type Stage = typeof STAGE_ORDER[number];

const ALLOWED_TRANSITIONS: Record<Stage, Stage[]> = {
  Draft: ["InReview", "Withdrawn"],
  InReview: ["Submitted", "Draft", "Withdrawn"],
  Submitted: ["UnderFunderReview", "Withdrawn"],
  UnderFunderReview: ["Awarded", "Declined", "Withdrawn"],
  Awarded: ["Closed" as any],
  Declined: [],
  Withdrawn: [],
};

export const listApplications = query({
  args: {
    stage: v.optional(v.union(v.literal("Draft"), v.literal("InReview"), v.literal("Submitted"), v.literal("UnderFunderReview"), v.literal("Awarded"), v.literal("Declined"), v.literal("Withdrawn"))),
    priority: v.optional(v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"), v.literal("Critical"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    if (args.stage !== undefined) {
      const byStage = await ctx.db
        .query("applications")
        .withIndex("by_stage", (q) => q.eq("stage", args.stage!))
        .collect();
      if (args.priority !== undefined) {
        return byStage.filter((a) => a.priority === args.priority);
      }
      return byStage;
    }
    if (args.priority !== undefined) {
      return await ctx.db
        .query("applications")
        .withIndex("by_priority", (q) => q.eq("priority", args.priority!))
        .collect();
    }
    return await ctx.db.query("applications").order("desc").collect();
  },
});

export const getApplication = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db.get(args.id);
  },
});

export const createApplication = mutation({
  args: {
    grantId: v.id("grants"),
    leadWriterId: v.id("users"),
    title: v.string(),
    requestedAmount: v.float64(),
    priority: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"), v.literal("Critical")),
    projectSummary: v.optional(v.string()),
    tags: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager", "GrantWriter"]);
    // Business rule: no duplicate active application for same grant
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_grantId", (q) => q.eq("grantId", args.grantId))
      .collect();
    const active = existing.filter((a) => a.stage !== "Declined" && a.stage !== "Withdrawn");
    if (active.length > 0) throw new Error("DUPLICATE_APPLICATION");
    const now = Date.now();
    const id = await ctx.db.insert("applications", {
      ...args,
      stage: "Draft",
      createdAt: now,
      updatedAt: now,
    });
    await writeAuditLog(ctx, caller._id, "Create", "applications", id, `Created application: ${args.title}`);
    return id;
  },
});

export const updateApplication = mutation({
  args: {
    id: v.id("applications"),
    title: v.optional(v.string()),
    leadWriterId: v.optional(v.id("users")),
    requestedAmount: v.optional(v.float64()),
    projectSummary: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"), v.literal("Critical"))),
    decisionNotes: v.optional(v.string()),
    internalScore: v.optional(v.float64()),
    tags: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await getCurrentUser(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    // GrantWriters can only edit their own applications
    if (caller.role === "GrantWriter" && existing.leadWriterId !== caller._id) {
      throw new Error("FORBIDDEN");
    }
    if (caller.role === "FinanceUser") throw new Error("FORBIDDEN");
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
    await writeAuditLog(ctx, caller._id, "Update", "applications", id, `Updated application`);
  },
});

export const deleteApplication = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    if (existing.stage !== "Draft") throw new Error("FORBIDDEN: Can only delete Draft applications");
    await ctx.db.delete(args.id);
    await writeAuditLog(ctx, caller._id, "Delete", "applications", args.id, `Deleted application: ${existing.title}`);
  },
});

export const getApplicationsByStage = query({
  args: {
    stage: v.union(v.literal("Draft"), v.literal("InReview"), v.literal("Submitted"), v.literal("UnderFunderReview"), v.literal("Awarded"), v.literal("Declined"), v.literal("Withdrawn")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db
      .query("applications")
      .withIndex("by_stage", (q) => q.eq("stage", args.stage))
      .collect();
  },
});

export const getApplicationsByWriter = query({
  args: {
    leadWriterId: v.id("users"),
    stage: v.optional(v.union(v.literal("Draft"), v.literal("InReview"), v.literal("Submitted"), v.literal("UnderFunderReview"), v.literal("Awarded"), v.literal("Declined"), v.literal("Withdrawn"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    if (args.stage !== undefined) {
      return await ctx.db
        .query("applications")
        .withIndex("by_stage_leadWriterId", (q) =>
          q.eq("stage", args.stage!).eq("leadWriterId", args.leadWriterId)
        )
        .collect();
    }
    return await ctx.db
      .query("applications")
      .withIndex("by_leadWriterId", (q) => q.eq("leadWriterId", args.leadWriterId))
      .collect();
  },
});

export const advanceApplicationStage = mutation({
  args: {
    id: v.id("applications"),
    targetStage: v.union(v.literal("Draft"), v.literal("InReview"), v.literal("Submitted"), v.literal("UnderFunderReview"), v.literal("Awarded"), v.literal("Declined"), v.literal("Withdrawn")),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    const allowed = ALLOWED_TRANSITIONS[existing.stage as Stage] || [];
    if (!allowed.includes(args.targetStage as Stage)) {
      throw new Error("INVALID_STAGE_TRANSITION");
    }
    const updates: Record<string, any> = {
      stage: args.targetStage,
      updatedAt: Date.now(),
    };
    if (args.targetStage === "Submitted") {
      updates.submittedDate = Date.now();
    }
    await ctx.db.patch(args.id, updates);
    await writeAuditLog(
      ctx, caller._id, "StageChange", "applications", args.id,
      `Stage: ${existing.stage} -> ${args.targetStage}`
    );
    // Create notification for assigned writer
    const writer = await ctx.db.get(existing.leadWriterId);
    if (writer) {
      await ctx.db.insert("notifications", {
        userId: writer._id,
        type: "StageChanged",
        title: "Application Stage Updated",
        message: `Application "${existing.title}" moved to ${args.targetStage}`,
        isRead: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const returnApplicationToDraft = mutation({
  args: {
    id: v.id("applications"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    if (existing.stage !== "InReview") throw new Error("INVALID_STAGE_TRANSITION");
    await ctx.db.patch(args.id, {
      stage: "Draft",
      decisionNotes: args.reason,
      updatedAt: Date.now(),
    });
    await writeAuditLog(
      ctx, caller._id, "StageChange", "applications", args.id,
      `Returned to Draft: ${args.reason ?? "No reason provided"}`
    );
  },
});

export const approveApplication = mutation({
  args: {
    id: v.id("applications"),
    reviewedById: v.id("users"),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    const now = Date.now();
    await ctx.db.patch(args.id, {
      reviewedById: args.reviewedById,
      reviewedAt: now,
      updatedAt: now,
    });
    await writeAuditLog(
      ctx, caller._id, "Approval", "applications", args.id,
      `Application approved by ${caller.name}`
    );
  },
});
