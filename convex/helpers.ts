import { query, mutation, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("UNAUTHORIZED");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: Array<"Admin" | "GrantManager" | "GrantWriter" | "FinanceUser">
) {
  const user = await getCurrentUser(ctx);
  if (!allowedRoles.includes(user.role as any)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function writeAuditLog(
  ctx: MutationCtx,
  userId: string,
  action: "Create" | "Update" | "Delete" | "StageChange" | "Approval" | "Submission",
  entityType: string,
  entityId: string,
  details?: string
) {
  await ctx.db.insert("auditLogs", {
    userId: userId as any,
    action,
    entityType,
    entityId,
    details,
    createdAt: Date.now(),
  });
}
