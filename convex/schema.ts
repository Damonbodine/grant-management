import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("Admin"), v.literal("GrantManager"), v.literal("GrantWriter"), v.literal("FinanceUser")),
    title: v.optional(v.string()),
    department: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_createdAt", ["createdAt"]),

  organizations: defineTable({
    name: v.string(),
    ein: v.optional(v.string()),
    mission: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    annualBudget: v.optional(v.float64()),
    fiscalYearEnd: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_createdAt", ["createdAt"]),

  funders: defineTable({
    name: v.string(),
    type: v.union(v.literal("Foundation"), v.literal("Government"), v.literal("Corporate"), v.literal("Individual"), v.literal("Other")),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(v.string()),
    focusAreas: v.optional(v.string()),
    averageAwardSize: v.optional(v.float64()),
    grantCycle: v.optional(v.string()),
    notes: v.optional(v.string()),
    relationshipStatus: v.union(v.literal("New"), v.literal("Active"), v.literal("Cultivating"), v.literal("Dormant"), v.literal("Declined")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_relationshipStatus", ["relationshipStatus"])
    .index("by_name", ["name"])
    .index("by_createdAt", ["createdAt"]),

  grants: defineTable({
    funderId: v.id("funders"),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(v.literal("General Operating"), v.literal("Program"), v.literal("Capital"), v.literal("Capacity Building"), v.literal("Research"), v.literal("Emergency"), v.literal("Other")),
    amountMin: v.optional(v.float64()),
    amountMax: v.optional(v.float64()),
    eligibilityRequirements: v.optional(v.string()),
    applicationUrl: v.optional(v.string()),
    openDate: v.optional(v.number()),
    deadline: v.number(),
    announcementDate: v.optional(v.number()),
    grantPeriodMonths: v.optional(v.float64()),
    isRecurring: v.boolean(),
    matchRequired: v.optional(v.boolean()),
    matchPercentage: v.optional(v.float64()),
    status: v.union(v.literal("Researching"), v.literal("Upcoming"), v.literal("Open"), v.literal("Closed"), v.literal("Archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_funderId", ["funderId"])
    .index("by_deadline", ["deadline"])
    .index("by_status", ["status"])
    .index("by_status_deadline", ["status", "deadline"])
    .index("by_category", ["category"])
    .index("by_createdAt", ["createdAt"]),

  applications: defineTable({
    grantId: v.id("grants"),
    leadWriterId: v.id("users"),
    title: v.string(),
    requestedAmount: v.float64(),
    projectSummary: v.optional(v.string()),
    stage: v.union(v.literal("Draft"), v.literal("InReview"), v.literal("Submitted"), v.literal("UnderFunderReview"), v.literal("Awarded"), v.literal("Declined"), v.literal("Withdrawn")),
    priority: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"), v.literal("Critical")),
    submittedDate: v.optional(v.number()),
    decisionDate: v.optional(v.number()),
    decisionNotes: v.optional(v.string()),
    reviewedById: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    internalScore: v.optional(v.float64()),
    tags: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_grantId", ["grantId"])
    .index("by_leadWriterId", ["leadWriterId"])
    .index("by_stage", ["stage"])
    .index("by_stage_grantId", ["stage", "grantId"])
    .index("by_stage_leadWriterId", ["stage", "leadWriterId"])
    .index("by_priority", ["priority"])
    .index("by_reviewedById", ["reviewedById"])
    .index("by_createdAt", ["createdAt"]),

  applicationTasks: defineTable({
    applicationId: v.id("applications"),
    assigneeId: v.optional(v.id("users")),
    title: v.string(),
    category: v.union(v.literal("Writing"), v.literal("Budget"), v.literal("Attachments"), v.literal("Review"), v.literal("Compliance"), v.literal("Other")),
    dueDate: v.optional(v.number()),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    completedById: v.optional(v.id("users")),
    sortOrder: v.float64(),
    createdAt: v.number(),
  })
    .index("by_applicationId", ["applicationId"])
    .index("by_assigneeId", ["assigneeId"])
    .index("by_applicationId_isCompleted", ["applicationId", "isCompleted"])
    .index("by_applicationId_sortOrder", ["applicationId", "sortOrder"])
    .index("by_createdAt", ["createdAt"]),

  applicationNotes: defineTable({
    applicationId: v.id("applications"),
    authorId: v.id("users"),
    content: v.string(),
    isPinned: v.boolean(),
    isInternal: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_applicationId", ["applicationId"])
    .index("by_authorId", ["authorId"])
    .index("by_applicationId_isPinned", ["applicationId", "isPinned"])
    .index("by_createdAt", ["createdAt"]),

  awards: defineTable({
    applicationId: v.id("applications"),
    grantId: v.id("grants"),
    awardedAmount: v.float64(),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(v.literal("Active"), v.literal("OnTrack"), v.literal("AtRisk"), v.literal("Completed"), v.literal("Closed")),
    restrictionType: v.union(v.literal("Unrestricted"), v.literal("TemporarilyRestricted"), v.literal("PermanentlyRestricted")),
    deliverables: v.optional(v.string()),
    complianceNotes: v.optional(v.string()),
    nextReportDueDate: v.optional(v.number()),
    reportingFrequency: v.union(v.literal("Monthly"), v.literal("Quarterly"), v.literal("SemiAnnual"), v.literal("Annual"), v.literal("Final")),
    totalSpent: v.float64(),
    remainingBalance: v.float64(),
    contactAtFunder: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_applicationId", ["applicationId"])
    .index("by_grantId", ["grantId"])
    .index("by_status", ["status"])
    .index("by_nextReportDueDate", ["nextReportDueDate"])
    .index("by_endDate", ["endDate"])
    .index("by_createdAt", ["createdAt"]),

  expenditures: defineTable({
    awardId: v.id("awards"),
    recordedById: v.id("users"),
    description: v.string(),
    amount: v.float64(),
    category: v.union(v.literal("Personnel"), v.literal("Supplies"), v.literal("Travel"), v.literal("Equipment"), v.literal("Contractual"), v.literal("Indirect"), v.literal("Other")),
    date: v.number(),
    vendor: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
    isApproved: v.boolean(),
    approvedById: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_awardId", ["awardId"])
    .index("by_recordedById", ["recordedById"])
    .index("by_awardId_isApproved", ["awardId", "isApproved"])
    .index("by_awardId_category", ["awardId", "category"])
    .index("by_date", ["date"])
    .index("by_createdAt", ["createdAt"]),

  reports: defineTable({
    awardId: v.id("awards"),
    authorId: v.id("users"),
    title: v.string(),
    type: v.union(v.literal("Progress"), v.literal("Financial"), v.literal("Final"), v.literal("Interim")),
    periodStart: v.number(),
    periodEnd: v.number(),
    content: v.string(),
    status: v.union(v.literal("Draft"), v.literal("InReview"), v.literal("Submitted"), v.literal("Accepted")),
    dueDate: v.number(),
    submittedDate: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_awardId", ["awardId"])
    .index("by_authorId", ["authorId"])
    .index("by_awardId_status", ["awardId", "status"])
    .index("by_dueDate", ["dueDate"])
    .index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("DeadlineApproaching"), v.literal("StageChanged"), v.literal("TaskAssigned"), v.literal("ReportDue"), v.literal("AwardUpdated"), v.literal("SystemAlert")),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isRead", ["userId", "isRead"])
    .index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"]),

  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.union(v.literal("Create"), v.literal("Update"), v.literal("Delete"), v.literal("StageChange"), v.literal("Approval"), v.literal("Submission")),
    entityType: v.string(),
    entityId: v.string(),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_entityType_entityId", ["entityType", "entityId"])
    .index("by_action", ["action"])
    .index("by_createdAt", ["createdAt"]),
});
