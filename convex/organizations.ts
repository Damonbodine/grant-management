import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireRole, writeAuditLog } from "./helpers";

export const listOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db.query("organizations").withIndex("by_name").order("asc").collect();
  },
});

export const getOrganization = query({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db.get(args.id);
  },
});

export const createOrganization = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    ein: v.optional(v.string()),
    mission: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    annualBudget: v.optional(v.float64()),
    fiscalYearEnd: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager"]);
    const id = await ctx.db.insert("organizations", {
      ...args,
      createdAt: Date.now(),
    });
    await writeAuditLog(ctx, caller._id, "Create", "organizations", id, `Created organization ${args.name}`);
    return id;
  },
});

export const updateOrganization = mutation({
  args: {
    id: v.id("organizations"),
    name: v.optional(v.string()),
    ein: v.optional(v.string()),
    mission: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    annualBudget: v.optional(v.float64()),
    fiscalYearEnd: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
    await writeAuditLog(ctx, caller._id, "Update", "organizations", id, `Updated organization`);
  },
});

export const deleteOrganization = mutation({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    await ctx.db.delete(args.id);
    await writeAuditLog(ctx, caller._id, "Delete", "organizations", args.id, `Deleted organization ${existing.name}`);
  },
});
