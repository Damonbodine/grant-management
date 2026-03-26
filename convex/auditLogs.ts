import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./helpers";

export const listAuditLogs = query({
  args: {
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    action: v.optional(v.union(v.literal("Create"), v.literal("Update"), v.literal("Delete"), v.literal("StageChange"), v.literal("Approval"), v.literal("Submission"))),
    limit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (user.role !== "Admin" && user.role !== "GrantManager")) {
      throw new Error("FORBIDDEN");
    }
    const limit = args.limit ? Math.min(Math.floor(args.limit), 500) : 100;
    if (args.entityType !== undefined && args.entityId !== undefined) {
      return await ctx.db
        .query("auditLogs")
        .withIndex("by_entityType_entityId", (q) =>
          q.eq("entityType", args.entityType!).eq("entityId", args.entityId!)
        )
        .order("desc")
        .take(limit);
    }
    if (args.action !== undefined) {
      return await ctx.db
        .query("auditLogs")
        .withIndex("by_action", (q) => q.eq("action", args.action!))
        .order("desc")
        .take(limit);
    }
    return await ctx.db.query("auditLogs").order("desc").take(limit);
  },
});

export const getAuditLog = query({
  args: { id: v.id("auditLogs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (user.role !== "Admin" && user.role !== "GrantManager")) {
      throw new Error("FORBIDDEN");
    }
    return await ctx.db.get(args.id);
  },
});

export const createAuditLog = mutation({
  args: {
    userId: v.id("users"),
    action: v.union(v.literal("Create"), v.literal("Update"), v.literal("Delete"), v.literal("StageChange"), v.literal("Approval"), v.literal("Submission")),
    entityType: v.string(),
    entityId: v.string(),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Only Admin or GrantManager can create audit logs directly
    await requireRole(ctx, ["Admin", "GrantManager"]);
    return await ctx.db.insert("auditLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getRecentActivity = query({
  args: { limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (user.role !== "Admin" && user.role !== "GrantManager")) {
      return [];
    }
    const limit = args.limit ? Math.min(Math.floor(args.limit), 100) : 20;
    const logs = await ctx.db.query("auditLogs").order("desc").take(limit);
    // Enrich with user info
    const enriched = await Promise.all(
      logs.map(async (log) => {
        const actor = await ctx.db.get(log.userId);
        return { ...log, actorName: actor?.name ?? "Unknown", actorEmail: actor?.email ?? "" };
      })
    );
    return enriched;
  },
});
