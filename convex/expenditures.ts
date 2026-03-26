import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, writeAuditLog } from "./helpers";

export const listExpenditures = query({
  args: {
    awardId: v.id("awards"),
    isApproved: v.optional(v.boolean()),
    category: v.optional(v.union(v.literal("Personnel"), v.literal("Supplies"), v.literal("Travel"), v.literal("Equipment"), v.literal("Contractual"), v.literal("Indirect"), v.literal("Other"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    if (args.isApproved !== undefined) {
      const byApproved = await ctx.db
        .query("expenditures")
        .withIndex("by_awardId_isApproved", (q) =>
          q.eq("awardId", args.awardId).eq("isApproved", args.isApproved!)
        )
        .collect();
      if (args.category !== undefined) {
        return byApproved.filter((e) => e.category === args.category);
      }
      return byApproved;
    }
    if (args.category !== undefined) {
      return await ctx.db
        .query("expenditures")
        .withIndex("by_awardId_category", (q) =>
          q.eq("awardId", args.awardId).eq("category", args.category!)
        )
        .collect();
    }
    return await ctx.db
      .query("expenditures")
      .withIndex("by_awardId", (q) => q.eq("awardId", args.awardId))
      .order("desc")
      .collect();
  },
});

export const getExpenditure = query({
  args: { id: v.id("expenditures") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db.get(args.id);
  },
});

export const createExpenditure = mutation({
  args: {
    awardId: v.id("awards"),
    recordedById: v.id("users"),
    description: v.string(),
    amount: v.float64(),
    category: v.union(v.literal("Personnel"), v.literal("Supplies"), v.literal("Travel"), v.literal("Equipment"), v.literal("Contractual"), v.literal("Indirect"), v.literal("Other")),
    date: v.number(),
    vendor: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager", "FinanceUser"]);
    if (args.amount <= 0) throw new Error("VALIDATION_ERROR: Amount must be positive");
    const award = await ctx.db.get(args.awardId);
    if (!award) throw new Error("NOT_FOUND");
    // Business rule: expenditure cannot exceed remaining balance
    if (args.amount > award.remainingBalance) throw new Error("EXPENDITURE_EXCEEDS_BALANCE");
    const id = await ctx.db.insert("expenditures", {
      ...args,
      isApproved: false,
      createdAt: Date.now(),
    });
    // Update award running totals
    await ctx.db.patch(args.awardId, {
      totalSpent: award.totalSpent + args.amount,
      remainingBalance: award.remainingBalance - args.amount,
    });
    await writeAuditLog(ctx, caller._id, "Create", "expenditures", id, `Recorded expenditure: $${args.amount} (${args.category})`);
    return id;
  },
});

export const updateExpenditure = mutation({
  args: {
    id: v.id("expenditures"),
    description: v.optional(v.string()),
    amount: v.optional(v.float64()),
    category: v.optional(v.union(v.literal("Personnel"), v.literal("Supplies"), v.literal("Travel"), v.literal("Equipment"), v.literal("Contractual"), v.literal("Indirect"), v.literal("Other"))),
    date: v.optional(v.number()),
    vendor: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager", "FinanceUser"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    // If amount changes, validate against balance
    if (args.amount !== undefined && args.amount !== existing.amount) {
      if (args.amount <= 0) throw new Error("VALIDATION_ERROR: Amount must be positive");
      const award = await ctx.db.get(existing.awardId);
      if (!award) throw new Error("NOT_FOUND");
      const diff = args.amount - existing.amount;
      if (diff > award.remainingBalance) throw new Error("EXPENDITURE_EXCEEDS_BALANCE");
      // Update award running totals
      await ctx.db.patch(existing.awardId, {
        totalSpent: award.totalSpent + diff,
        remainingBalance: award.remainingBalance - diff,
      });
    }
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
    await writeAuditLog(ctx, caller._id, "Update", "expenditures", id, `Updated expenditure`);
  },
});

export const deleteExpenditure = mutation({
  args: { id: v.id("expenditures") },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager", "FinanceUser"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    if (existing.isApproved) throw new Error("FORBIDDEN: Cannot delete approved expenditures");
    const award = await ctx.db.get(existing.awardId);
    if (award) {
      // Reverse the award totals
      await ctx.db.patch(existing.awardId, {
        totalSpent: award.totalSpent - existing.amount,
        remainingBalance: award.remainingBalance + existing.amount,
      });
    }
    await ctx.db.delete(args.id);
    await writeAuditLog(ctx, caller._id, "Delete", "expenditures", args.id, `Deleted expenditure: $${existing.amount}`);
  },
});

export const getExpendituresByAward = query({
  args: {
    awardId: v.id("awards"),
    isApproved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    if (args.isApproved !== undefined) {
      return await ctx.db
        .query("expenditures")
        .withIndex("by_awardId_isApproved", (q) =>
          q.eq("awardId", args.awardId).eq("isApproved", args.isApproved!)
        )
        .collect();
    }
    return await ctx.db
      .query("expenditures")
      .withIndex("by_awardId", (q) => q.eq("awardId", args.awardId))
      .collect();
  },
});

export const getExpenditureSummaryByCategory = query({
  args: { awardId: v.id("awards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    const all = await ctx.db
      .query("expenditures")
      .withIndex("by_awardId", (q) => q.eq("awardId", args.awardId))
      .collect();
    const categories = ["Personnel", "Supplies", "Travel", "Equipment", "Contractual", "Indirect", "Other"] as const;
    const summary: Record<string, { total: number; approved: number; pending: number; count: number }> = {};
    for (const cat of categories) {
      const catItems = all.filter((e) => e.category === cat);
      summary[cat] = {
        total: catItems.reduce((sum, e) => sum + e.amount, 0),
        approved: catItems.filter((e) => e.isApproved).reduce((sum, e) => sum + e.amount, 0),
        pending: catItems.filter((e) => !e.isApproved).reduce((sum, e) => sum + e.amount, 0),
        count: catItems.length,
      };
    }
    return summary;
  },
});

export const approveExpenditure = mutation({
  args: {
    id: v.id("expenditures"),
    approvedById: v.id("users"),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    await ctx.db.patch(args.id, {
      isApproved: true,
      approvedById: args.approvedById,
    });
    await writeAuditLog(
      ctx, caller._id, "Approval", "expenditures", args.id,
      `Expenditure approved by ${caller.name}: $${existing.amount}`
    );
  },
});
