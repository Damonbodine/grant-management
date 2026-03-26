import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser as getAuthUser, requireRole, writeAuditLog } from "./helpers";

export const listUsers = query({
  args: {
    role: v.optional(v.union(v.literal("Admin"), v.literal("GrantManager"), v.literal("GrantWriter"), v.literal("FinanceUser"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    if (args.role !== undefined) {
      let q = ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", args.role!));
      const results = await q.collect();
      if (args.isActive !== undefined) {
        return results.filter((u) => u.isActive === args.isActive);
      }
      return results;
    }
    const all = await ctx.db.query("users").order("desc").collect();
    if (args.isActive !== undefined) {
      return all.filter((u) => u.isActive === args.isActive);
    }
    return all;
  },
});

export const getUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db.get(args.id);
  },
});

export const getCurrentUserRecord = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("Admin"), v.literal("GrantManager"), v.literal("GrantWriter"), v.literal("FinanceUser")),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    title: v.optional(v.string()),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin"]);
    const now = Date.now();
    const id = await ctx.db.insert("users", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    await writeAuditLog(ctx, caller._id, "Create", "users", id, `Created user ${args.email}`);
    return id;
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("Admin"), v.literal("GrantManager"), v.literal("GrantWriter"), v.literal("FinanceUser"))),
    title: v.optional(v.string()),
    department: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!caller) throw new Error("UNAUTHORIZED");
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    // Only Admin can change roles or update other users
    if (args.role !== undefined && caller.role !== "Admin") throw new Error("FORBIDDEN");
    if (caller._id !== args.id && caller.role !== "Admin") throw new Error("FORBIDDEN");
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
    await writeAuditLog(ctx, caller._id, "Update", "users", id, `Updated user`);
  },
});

export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    await ctx.db.patch(args.id, { isActive: false, updatedAt: Date.now() });
    await writeAuditLog(ctx, caller._id, "Delete", "users", args.id, `Deactivated user ${existing.email}`);
  },
});

// Alias for getCurrentUserRecord for backward compatibility
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (existing) return existing;
    const now = Date.now();
    const id = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl,
      role: "GrantWriter",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});
