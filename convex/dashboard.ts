import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    const [applications, awards, grants, funders] = await Promise.all([
      ctx.db.query("applications").collect(),
      ctx.db.query("awards").collect(),
      ctx.db.query("grants").collect(),
      ctx.db.query("funders").collect(),
    ]);

    const applicationsByStage: Record<string, number> = {
      Draft: 0,
      InReview: 0,
      Submitted: 0,
      UnderFunderReview: 0,
      Awarded: 0,
      Declined: 0,
      Withdrawn: 0,
    };
    for (const app of applications) {
      applicationsByStage[app.stage] = (applicationsByStage[app.stage] ?? 0) + 1;
    }

    const totalAwardedAmount = awards.reduce((sum, a) => sum + a.awardedAmount, 0);
    const totalSpent = awards.reduce((sum, a) => sum + a.totalSpent, 0);
    const totalRemaining = awards.reduce((sum, a) => sum + a.remainingBalance, 0);

    const activeAwardsByStatus: Record<string, number> = {
      Active: 0,
      OnTrack: 0,
      AtRisk: 0,
      Completed: 0,
      Closed: 0,
    };
    for (const award of awards) {
      activeAwardsByStatus[award.status] = (activeAwardsByStatus[award.status] ?? 0) + 1;
    }

    const openGrants = grants.filter((g) => g.status === "Open").length;
    const activeApplications = applications.filter(
      (a) => a.stage !== "Declined" && a.stage !== "Withdrawn"
    ).length;

    return {
      totalApplications: applications.length,
      activeApplications,
      applicationsByStage,
      totalAwards: awards.length,
      totalAwardedAmount,
      totalSpent,
      totalRemaining,
      activeAwardsByStatus,
      totalFunders: funders.length,
      openGrants,
      totalGrants: grants.length,
    };
  },
});

export const getUpcomingDeadlines = query({
  args: { daysAhead: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    const days = args.daysAhead ?? 30;
    const now = Date.now();
    const cutoff = now + days * 24 * 60 * 60 * 1000;

    // Upcoming grant deadlines
    const grants = await ctx.db
      .query("grants")
      .withIndex("by_deadline")
      .order("asc")
      .collect();
    const upcomingGrantDeadlines = grants
      .filter((g) => g.deadline >= now && g.deadline <= cutoff && g.status !== "Archived")
      .map((g) => ({
        type: "grant_deadline" as const,
        id: g._id,
        title: g.name,
        deadline: g.deadline,
        status: g.status,
      }));

    // Upcoming report due dates
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_dueDate")
      .order("asc")
      .collect();
    const upcomingReportDueDates = reports
      .filter((r) => r.dueDate >= now && r.dueDate <= cutoff && r.status !== "Submitted" && r.status !== "Accepted")
      .map((r) => ({
        type: "report_due" as const,
        id: r._id,
        title: r.title,
        deadline: r.dueDate,
        status: r.status,
      }));

    // Awards nearing end date
    const awards = await ctx.db
      .query("awards")
      .withIndex("by_endDate")
      .order("asc")
      .collect();
    const expiringAwards = awards
      .filter((a) => a.endDate >= now && a.endDate <= cutoff && a.status !== "Completed" && a.status !== "Closed")
      .map((a) => ({
        type: "award_expiring" as const,
        id: a._id,
        title: `Award ending`,
        deadline: a.endDate,
        status: a.status,
      }));

    return [
      ...upcomingGrantDeadlines,
      ...upcomingReportDueDates,
      ...expiringAwards,
    ].sort((a, b) => a.deadline - b.deadline);
  },
});
