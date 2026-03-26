import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireRole, writeAuditLog } from "./helpers";

export const listFunders = query({
  args: {
    type: v.optional(v.union(v.literal("Foundation"), v.literal("Government"), v.literal("Corporate"), v.literal("Individual"), v.literal("Other"))),
    relationshipStatus: v.optional(v.union(v.literal("New"), v.literal("Active"), v.literal("Cultivating"), v.literal("Dormant"), v.literal("Declined"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    if (args.type !== undefined) {
      const byType = await ctx.db
        .query("funders")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
      if (args.relationshipStatus !== undefined) {
        return byType.filter((f) => f.relationshipStatus === args.relationshipStatus);
      }
      return byType;
    }
    if (args.relationshipStatus !== undefined) {
      return await ctx.db
        .query("funders")
        .withIndex("by_relationshipStatus", (q) => q.eq("relationshipStatus", args.relationshipStatus!))
        .collect();
    }
    return await ctx.db.query("funders").order("desc").collect();
  },
});

export const getFunder = query({
  args: { id: v.id("funders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db.get(args.id);
  },
});

export const createFunder = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("Foundation"), v.literal("Government"), v.literal("Corporate"), v.literal("Individual"), v.literal("Other")),
    relationshipStatus: v.union(v.literal("New"), v.literal("Active"), v.literal("Cultivating"), v.literal("Dormant"), v.literal("Declined")),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(v.string()),
    focusAreas: v.optional(v.string()),
    averageAwardSize: v.optional(v.float64()),
    grantCycle: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager", "GrantWriter"]);
    const now = Date.now();
    const id = await ctx.db.insert("funders", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    await writeAuditLog(ctx, caller._id, "Create", "funders", id, `Created funder ${args.name}`);
    return id;
  },
});

export const updateFunder = mutation({
  args: {
    id: v.id("funders"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("Foundation"), v.literal("Government"), v.literal("Corporate"), v.literal("Individual"), v.literal("Other"))),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(v.string()),
    focusAreas: v.optional(v.string()),
    averageAwardSize: v.optional(v.float64()),
    grantCycle: v.optional(v.string()),
    notes: v.optional(v.string()),
    relationshipStatus: v.optional(v.union(v.literal("New"), v.literal("Active"), v.literal("Cultivating"), v.literal("Dormant"), v.literal("Declined"))),
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
    await writeAuditLog(ctx, caller._id, "Update", "funders", id, `Updated funder`);
  },
});

export const deleteFunder = mutation({
  args: { id: v.id("funders") },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    // Check for related grants — prevent delete if any exist
    const relatedGrants = await ctx.db
      .query("grants")
      .withIndex("by_funderId", (q) => q.eq("funderId", args.id))
      .collect();
    if (relatedGrants.length > 0) {
      throw new Error("CANNOT_DELETE: Funder has related grants. Delete or reassign them first.");
    }
    await ctx.db.delete(args.id);
    await writeAuditLog(ctx, caller._id, "Delete", "funders", args.id, `Deleted funder ${existing.name}`);
  },
});
