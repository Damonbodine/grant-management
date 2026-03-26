import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, writeAuditLog } from "./helpers";

export const listAwards = query({
  args: {
    status: v.optional(v.union(v.literal("Active"), v.literal("OnTrack"), v.literal("AtRisk"), v.literal("Completed"), v.literal("Closed"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    let awards;
    if (args.status !== undefined) {
      awards = await ctx.db
        .query("awards")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      awards = await ctx.db.query("awards").order("desc").collect();
    }
    // Enrich with grant name and application title
    const enriched = await Promise.all(
      awards.map(async (award) => {
        const grant = await ctx.db.get(award.grantId);
        const application = await ctx.db.get(award.applicationId);
        return {
          ...award,
          grantName: grant?.name ?? "Unknown Grant",
          applicationTitle: application?.title ?? "Unknown Application",
        };
      })
    );
    return enriched;
  },
});

export const getAward = query({
  args: { id: v.id("awards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db.get(args.id);
  },
});

export const createAward = mutation({
  args: {
    applicationId: v.id("applications"),
    grantId: v.id("grants"),
    awardedAmount: v.float64(),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(v.literal("Active"), v.literal("OnTrack"), v.literal("AtRisk"), v.literal("Completed"), v.literal("Closed")),
    restrictionType: v.union(v.literal("Unrestricted"), v.literal("TemporarilyRestricted"), v.literal("PermanentlyRestricted")),
    reportingFrequency: v.union(v.literal("Monthly"), v.literal("Quarterly"), v.literal("SemiAnnual"), v.literal("Annual"), v.literal("Final")),
    deliverables: v.optional(v.string()),
    complianceNotes: v.optional(v.string()),
    nextReportDueDate: v.optional(v.number()),
    contactAtFunder: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager"]);
    // Business rule: application must be in Awarded stage
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("NOT_FOUND");
    if (application.stage !== "Awarded") throw new Error("AWARD_REQUIRES_AWARDED");
    // Validate dates
    if (args.endDate <= args.startDate) throw new Error("VALIDATION_ERROR: endDate must be after startDate");
    const id = await ctx.db.insert("awards", {
      ...args,
      totalSpent: 0,
      remainingBalance: args.awardedAmount,
      createdAt: Date.now(),
    });
    await writeAuditLog(ctx, caller._id, "Create", "awards", id, `Created award for application ${args.applicationId}`);
    // Notify about award
    if (application.leadWriterId) {
      await ctx.db.insert("notifications", {
        userId: application.leadWriterId,
        type: "AwardUpdated",
        title: "Award Created",
        message: `A new award of $${args.awardedAmount} has been created for your application.`,
        isRead: false,
        createdAt: Date.now(),
      });
    }
    return id;
  },
});

export const updateAward = mutation({
  args: {
    id: v.id("awards"),
    status: v.optional(v.union(v.literal("Active"), v.literal("OnTrack"), v.literal("AtRisk"), v.literal("Completed"), v.literal("Closed"))),
    deliverables: v.optional(v.string()),
    complianceNotes: v.optional(v.string()),
    nextReportDueDate: v.optional(v.number()),
    reportingFrequency: v.optional(v.union(v.literal("Monthly"), v.literal("Quarterly"), v.literal("SemiAnnual"), v.literal("Annual"), v.literal("Final"))),
    totalSpent: v.optional(v.float64()),
    remainingBalance: v.optional(v.float64()),
    contactAtFunder: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager", "FinanceUser"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
    await writeAuditLog(ctx, caller._id, "Update", "awards", id, `Updated award`);
  },
});

export const deleteAward = mutation({
  args: { id: v.id("awards") },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    await ctx.db.delete(args.id);
    await writeAuditLog(ctx, caller._id, "Delete", "awards", args.id, `Deleted award`);
  },
});

export const getAwardsByStatus = query({
  args: {
    status: v.union(v.literal("Active"), v.literal("OnTrack"), v.literal("AtRisk"), v.literal("Completed"), v.literal("Closed")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db
      .query("awards")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});
