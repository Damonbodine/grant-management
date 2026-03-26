import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireRole, writeAuditLog } from "./helpers";

export const listApplicationNotes = query({
  args: {
    applicationId: v.id("applications"),
    isPinned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    if (args.isPinned !== undefined) {
      return await ctx.db
        .query("applicationNotes")
        .withIndex("by_applicationId_isPinned", (q) =>
          q.eq("applicationId", args.applicationId).eq("isPinned", args.isPinned!)
        )
        .collect();
    }
    return await ctx.db
      .query("applicationNotes")
      .withIndex("by_applicationId", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")
      .collect();
  },
});

export const getApplicationNote = query({
  args: { id: v.id("applicationNotes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db.get(args.id);
  },
});

export const createApplicationNote = mutation({
  args: {
    applicationId: v.id("applications"),
    authorId: v.id("users"),
    content: v.string(),
    isPinned: v.boolean(),
    isInternal: v.boolean(),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["Admin", "GrantManager", "GrantWriter"]);
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("NOT_FOUND");
    const id = await ctx.db.insert("applicationNotes", {
      ...args,
      createdAt: Date.now(),
    });
    await writeAuditLog(ctx, caller._id, "Create", "applicationNotes", id, `Added note to application`);
    return id;
  },
});

export const updateApplicationNote = mutation({
  args: {
    id: v.id("applicationNotes"),
    content: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
    isInternal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const caller = await getCurrentUser(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    // Only author or Admin can edit
    if (caller.role !== "Admin" && existing.authorId !== caller._id) {
      throw new Error("FORBIDDEN");
    }
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
    await writeAuditLog(ctx, caller._id, "Update", "applicationNotes", id, `Updated note`);
  },
});

export const deleteApplicationNote = mutation({
  args: { id: v.id("applicationNotes") },
  handler: async (ctx, args) => {
    const caller = await getCurrentUser(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("NOT_FOUND");
    // Author, Admin, or GrantManager can delete
    if (
      caller.role !== "Admin" &&
      caller.role !== "GrantManager" &&
      existing.authorId !== caller._id
    ) {
      throw new Error("FORBIDDEN");
    }
    await ctx.db.delete(args.id);
    await writeAuditLog(ctx, caller._id, "Delete", "applicationNotes", args.id, `Deleted note`);
  },
});

export const getNotesByApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    return await ctx.db
      .query("applicationNotes")
      .withIndex("by_applicationId", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")
      .collect();
  },
});
