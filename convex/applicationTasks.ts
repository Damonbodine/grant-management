import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireRole, writeAuditLog } from "./helpers";

export const listApplicationTasks = query({
  args: {
    applicationId: v.id("applications"),
    isCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    if (args.isCompleted !== undefined) {
      return await ctx.db
        .query("applicationTasks")
        .withIndex("by_applicationId_isCompleted", (q) =>
          q.eq("applicationId", args.applicationId).eq("isCompleted", args.isCompleted!)
        )
        .collect();
    }
    return await ctx.db
      .query("applicationTasks")
      .withIndex("by_applicationId_sortOrder", (q) => q.eq("applicationId", args.applicationId))
      .order("asc")
      .collect();
  },
});

export const getApplicationTask = query({
  args: { id: v.id("applicationTasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db.get(args.id);
  },
});

export const createApplicationTask = mutation({
  args: {
    applicationId: v.id("applications"),
    title: v.string(),
    category: v.union(v.literal("Writing"), v.literal("Budget"), v.literal("Attachments"), v.literal("Review"), v.literal("Compliance"), v.literal("Other")),
    sortOrder: v.float64(),
    assigneeId: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager", "GrantWriter"]);
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("NOT_FOUND");
    const id = await ctx.db.insert("applicationTasks", {
      ...args,
      isCompleted: false,
      createdAt: Date.now(),
    });
    // Notify assignee if set
    if (args.assigneeId) {
      await ctx.db.insert("notifications", {
        userId: args.assigneeId,
        type: "TaskAssigned",
        title: "New Task Assigned",
        message: `You have been assigned a task: ${args.title}`,
        isRead: false,
        createdAt: Date.now(),
      });
    }
    await writeAuditLog(ctx, caller._id, "Create", "applicationTasks", id, `Created task: ${args.title}`);
    return id;
  },
});

export const updateApplicationTask = mutation({
  args: {
    id: v.id("applicationTasks"),
    title: v.optional(v.string()),
    category: v.optional(v.union(v.literal("Writing"), v.literal("Budget"), v.literal("Attachments"), v.literal("Review"), v.literal("Compliance"), v.literal("Other"))),
    assigneeId: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    sortOrder: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager", "GrantWriter"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
    await writeAuditLog(ctx, caller._id, "Update", "applicationTasks", id, `Updated task`);
  },
});

export const deleteApplicationTask = mutation({
  args: { id: v.id("applicationTasks") },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    await ctx.db.delete(args.id);
    await writeAuditLog(ctx, caller._id, "Delete", "applicationTasks", args.id, `Deleted task: ${existing.title}`);
  },
});

export const getTasksByApplication = query({
  args: {
    applicationId: v.id("applications"),
    isCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    if (args.isCompleted !== undefined) {
      return await ctx.db
        .query("applicationTasks")
        .withIndex("by_applicationId_isCompleted", (q) =>
          q.eq("applicationId", args.applicationId).eq("isCompleted", args.isCompleted!)
        )
        .collect();
    }
    return await ctx.db
      .query("applicationTasks")
      .withIndex("by_applicationId", (q) => q.eq("applicationId", args.applicationId))
      .collect();
  },
});

export const toggleTaskComplete = mutation({
  args: {
    id: v.id("applicationTasks"),
    completedById: v.id("users"),
  },
  handler: async (ctx, args) => {
    const caller = await getCurrentUser(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    // Assignee can toggle their own task; managers can toggle any
    if (
      caller.role !== "Admin" &&
      caller.role !== "GrantManager" &&
      existing.assigneeId !== caller._id
    ) {
      throw new Error("FORBIDDEN");
    }
    const now = Date.now();
    const newCompleted = !existing.isCompleted;
    await ctx.db.patch(args.id, {
      isCompleted: newCompleted,
      completedAt: newCompleted ? now : undefined,
      completedById: newCompleted ? args.completedById : undefined,
    });
    await writeAuditLog(
      ctx, caller._id, "Update", "applicationTasks", args.id,
      `Task marked ${newCompleted ? "complete" : "incomplete"}`
    );
  },
});
