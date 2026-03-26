import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireRole } from "./helpers";

export const listNotifications = query({
  args: {
    userId: v.id("users"),
    isRead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    if (args.isRead !== undefined) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_userId_isRead", (q) =>
          q.eq("userId", args.userId).eq("isRead", args.isRead!)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getNotification = query({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db.get(args.id);
  },
});

export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("DeadlineApproaching"), v.literal("StageChanged"), v.literal("TaskAssigned"), v.literal("ReportDue"), v.literal("AwardUpdated"), v.literal("SystemAlert")),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Admin-only or internal use; require at least authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    const id = await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const updateNotification = mutation({
  args: {
    id: v.id("notifications"),
    isRead: v.boolean(),
  },
  handler: async (ctx, args) => {
    const caller = await getCurrentUser(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    if (existing.userId !== caller._id) throw new Error("FORBIDDEN");
    await ctx.db.patch(args.id, { isRead: args.isRead });
  },
});

export const deleteNotification = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const caller = await getCurrentUser(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    if (existing.userId !== caller._id) throw new Error("FORBIDDEN");
    await ctx.db.delete(args.id);
  },
});

export const getNotificationsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const markNotificationRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const caller = await getCurrentUser(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    if (existing.userId !== caller._id) throw new Error("FORBIDDEN");
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllNotificationsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const caller = await getCurrentUser(ctx);
    if (caller._id !== args.userId) throw new Error("FORBIDDEN");
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }
  },
});

export const getUnreadNotificationCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .collect();
    return unread.length;
  },
});
