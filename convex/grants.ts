import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, writeAuditLog } from "./helpers";

export const listGrants = query({
  args: {
    status: v.optional(v.union(v.literal("Researching"), v.literal("Upcoming"), v.literal("Open"), v.literal("Closed"), v.literal("Archived"))),
    category: v.optional(v.union(v.literal("General Operating"), v.literal("Program"), v.literal("Capital"), v.literal("Capacity Building"), v.literal("Research"), v.literal("Emergency"), v.literal("Other"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    if (args.status !== undefined) {
      const byStatus = await ctx.db
        .query("grants")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
      if (args.category !== undefined) {
        return byStatus.filter((g) => g.category === args.category);
      }
      return byStatus;
    }
    if (args.category !== undefined) {
      return await ctx.db
        .query("grants")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    }
    return await ctx.db.query("grants").withIndex("by_deadline").order("asc").collect();
  },
});

export const getGrant = query({
  args: { id: v.id("grants") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db.get(args.id);
  },
});

export const createGrant = mutation({
  args: {
    funderId: v.id("funders"),
    name: v.string(),
    category: v.union(v.literal("General Operating"), v.literal("Program"), v.literal("Capital"), v.literal("Capacity Building"), v.literal("Research"), v.literal("Emergency"), v.literal("Other")),
    deadline: v.number(),
    status: v.union(v.literal("Researching"), v.literal("Upcoming"), v.literal("Open"), v.literal("Closed"), v.literal("Archived")),
    isRecurring: v.boolean(),
    description: v.optional(v.string()),
    amountMin: v.optional(v.float64()),
    amountMax: v.optional(v.float64()),
    eligibilityRequirements: v.optional(v.string()),
    applicationUrl: v.optional(v.string()),
    openDate: v.optional(v.number()),
    announcementDate: v.optional(v.number()),
    grantPeriodMonths: v.optional(v.float64()),
    matchRequired: v.optional(v.boolean()),
    matchPercentage: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager", "GrantWriter"]);
    const funder = await ctx.db.get(args.funderId);
    if (!funder) throw new Error("NOT_FOUND");
    const now = Date.now();
    const id = await ctx.db.insert("grants", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    await writeAuditLog(ctx, caller._id, "Create", "grants", id, `Created grant ${args.name}`);
    return id;
  },
});

export const updateGrant = mutation({
  args: {
    id: v.id("grants"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(v.literal("General Operating"), v.literal("Program"), v.literal("Capital"), v.literal("Capacity Building"), v.literal("Research"), v.literal("Emergency"), v.literal("Other"))),
    amountMin: v.optional(v.float64()),
    amountMax: v.optional(v.float64()),
    eligibilityRequirements: v.optional(v.string()),
    applicationUrl: v.optional(v.string()),
    openDate: v.optional(v.number()),
    deadline: v.optional(v.number()),
    announcementDate: v.optional(v.number()),
    grantPeriodMonths: v.optional(v.float64()),
    isRecurring: v.optional(v.boolean()),
    matchRequired: v.optional(v.boolean()),
    matchPercentage: v.optional(v.float64()),
    status: v.optional(v.union(v.literal("Researching"), v.literal("Upcoming"), v.literal("Open"), v.literal("Closed"), v.literal("Archived"))),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager", "GrantWriter"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
    await writeAuditLog(ctx, caller._id, "Update", "grants", id, `Updated grant`);
  },
});

export const deleteGrant = mutation({
  args: { id: v.id("grants") },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    // Check for related applications — prevent delete if any exist
    const relatedApps = await ctx.db
      .query("applications")
      .withIndex("by_grantId", (q) => q.eq("grantId", args.id))
      .collect();
    if (relatedApps.length > 0) {
      throw new Error("CANNOT_DELETE: Grant has related applications. Delete or reassign them first.");
    }
    await ctx.db.delete(args.id);
    await writeAuditLog(ctx, caller._id, "Delete", "grants", args.id, `Deleted grant ${existing.name}`);
  },
});

export const getGrantsByFunder = query({
  args: {
    funderId: v.id("funders"),
    status: v.optional(v.union(v.literal("Researching"), v.literal("Upcoming"), v.literal("Open"), v.literal("Closed"), v.literal("Archived"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    const byFunder = await ctx.db
      .query("grants")
      .withIndex("by_funderId", (q) => q.eq("funderId", args.funderId))
      .collect();
    if (args.status !== undefined) {
      return byFunder.filter((g) => g.status === args.status);
    }
    return byFunder;
  },
});
