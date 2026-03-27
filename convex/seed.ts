import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

// Temporary: promote any authenticated user to Admin so the test user can access all features
export const promoteToAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { role: "Admin" });
      return { message: `Promoted ${existing.name} to Admin`, userId: existing._id };
    }
    // Create as Admin if doesn't exist
    const now = Date.now();
    const id = await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name ?? "Test Admin",
      email: identity.email ?? "test@example.com",
      role: "Admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    return { message: `Created Admin user`, userId: id };
  },
});

async function clearTable(ctx: any, tableName: string) {
  const rows = await ctx.db.query(tableName).collect();
  for (const row of rows) {
    await ctx.db.delete(row._id);
  }
  return rows.length;
}

export const seedDatabase = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clear all existing data in reverse dependency order
    await clearTable(ctx, "auditLogs");
    await clearTable(ctx, "notifications");
    await clearTable(ctx, "reports");
    await clearTable(ctx, "expenditures");
    await clearTable(ctx, "awards");
    await clearTable(ctx, "applicationNotes");
    await clearTable(ctx, "applicationTasks");
    await clearTable(ctx, "applications");
    await clearTable(ctx, "grants");
    await clearTable(ctx, "funders");
    await clearTable(ctx, "organizations");
    await clearTable(ctx, "users");

    // All dates are relative to "now" = March 26, 2026
    const NOW = new Date("2026-03-26T12:00:00Z").getTime();
    const DAY = 86400000;

    // ─── Users ────────────────────────────────────────────────────────────────
    const aliceId = await ctx.db.insert("users", {
      clerkId: "user_3BV4YzajQ96nGS3hlBDld9VcLa8",
      name: "Demo User",
      email: "demo@factory512.dev",
      phone: "512-555-0101",
      avatarUrl: undefined,
      role: "Admin",
      title: "Executive Director",
      department: "Leadership",
      isActive: true,
      createdAt: NOW - 365 * DAY,
      updatedAt: NOW - 365 * DAY,
    });

    const bobId = await ctx.db.insert("users", {
      clerkId: "clerk_gm_002",
      name: "Bob Martinez",
      email: "bob.martinez@hopewellcommunityservices.org",
      phone: "512-555-0102",
      avatarUrl: undefined,
      role: "GrantManager",
      title: "Director of Development",
      department: "Development",
      isActive: true,
      createdAt: NOW - 364 * DAY,
      updatedAt: NOW - 364 * DAY,
    });

    const carolId = await ctx.db.insert("users", {
      clerkId: "clerk_gw_003",
      name: "Carol Chen",
      email: "carol.chen@hopewellcommunityservices.org",
      phone: "512-555-0103",
      avatarUrl: undefined,
      role: "GrantWriter",
      title: "Grant Writer",
      department: "Development",
      isActive: true,
      createdAt: NOW - 363 * DAY,
      updatedAt: NOW - 363 * DAY,
    });

    const daveId = await ctx.db.insert("users", {
      clerkId: "clerk_fu_004",
      name: "Dave Wilson",
      email: "dave.wilson@hopewellcommunityservices.org",
      phone: "512-555-0104",
      avatarUrl: undefined,
      role: "FinanceUser",
      title: "Finance Manager",
      department: "Finance",
      isActive: true,
      createdAt: NOW - 362 * DAY,
      updatedAt: NOW - 362 * DAY,
    });

    // ─── Organization ─────────────────────────────────────────────────────────
    await ctx.db.insert("organizations", {
      name: "Hopewell Community Services",
      ein: "45-1234567",
      mission:
        "To empower underserved communities in Central Texas through affordable housing, workforce development, and youth education programs.",
      address: "1204 E 6th Street, Suite 300",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
      phone: "512-555-0100",
      website: "https://www.hopewellcommunityservices.org",
      annualBudget: 2800000,
      fiscalYearEnd: "December 31",
      createdAt: NOW - 365 * DAY,
    });

    // ─── Funders ──────────────────────────────────────────────────────────────
    const acfId = await ctx.db.insert("funders", {
      name: "Austin Community Foundation",
      type: "Foundation",
      contactName: "Sarah Kellerman",
      contactEmail: "skellerman@austincf.org",
      contactPhone: "512-555-0201",
      website: "https://www.austincf.org",
      address: "4315 Guadalupe Street, Suite 300, Austin, TX 78751",
      focusAreas: "Health equity, affordable housing, community resilience, arts and culture",
      averageAwardSize: 150000,
      grantCycle: "Annual — LOI due January 15, full proposal March 1",
      notes:
        "Strong relationship built over 3 grant cycles. Program officer is Sarah Kellerman. Prefers multi-year funding commitments.",
      relationshipStatus: "Active",
      createdAt: NOW - 365 * DAY,
      updatedAt: NOW - 30 * DAY,
    });

    const thhsId = await ctx.db.insert("funders", {
      name: "Texas Health and Human Services",
      type: "Government",
      contactName: "James Treviño",
      contactEmail: "james.trevino@hhs.texas.gov",
      contactPhone: "512-555-0301",
      website: "https://www.hhs.texas.gov",
      address: "4900 N Lamar Blvd, Austin, TX 78751",
      focusAreas: "Affordable housing, rental assistance, homebuyer education, behavioral health",
      averageAwardSize: 500000,
      grantCycle: "NOFA released February; applications due April 30",
      notes:
        "Requires extensive compliance documentation. Must have 3 years of audited financials on file. Reporting is rigorous — monthly financial draws.",
      relationshipStatus: "Active",
      createdAt: NOW - 300 * DAY,
      updatedAt: NOW - 14 * DAY,
    });

    const dtfId = await ctx.db.insert("funders", {
      name: "Dell Technologies Foundation",
      type: "Corporate",
      contactName: "Anita Sharma",
      contactEmail: "anita.sharma@dell.com",
      contactPhone: "512-555-0401",
      website: "https://www.delltechnologies.com/foundation",
      address: "One Dell Way, Round Rock, TX 78682",
      focusAreas: "STEM education, workforce development, digital equity, computer science access",
      averageAwardSize: 50000,
      grantCycle: "Rolling applications reviewed quarterly",
      notes:
        "New relationship cultivated at Austin Community Foundation gala. Interested in our digital literacy program for workforce participants.",
      relationshipStatus: "Cultivating",
      createdAt: NOW - 200 * DAY,
      updatedAt: NOW - 7 * DAY,
    });

    // ─── Grants ───────────────────────────────────────────────────────────────
    // Grant 1: ACF — closed grant (awarded already), deadline in recent past
    const grantAcfId = await ctx.db.insert("grants", {
      funderId: acfId,
      name: "ACF Health Equity Initiative 2026",
      description:
        "Supports organizations working to address the root causes of poor health by investing in community-led solutions that advance health equity and well-being across Central Texas.",
      category: "Program",
      amountMin: 100000,
      amountMax: 250000,
      eligibilityRequirements:
        "501(c)(3) organizations operating for at least 3 years with demonstrated focus on health equity. Must serve populations in priority geographies within Travis County.",
      applicationUrl: "https://www.austincf.org/apply/health-equity-2026",
      openDate: NOW - 120 * DAY,
      deadline: NOW - 30 * DAY,
      announcementDate: NOW - 10 * DAY,
      grantPeriodMonths: 24,
      isRecurring: true,
      matchRequired: false,
      matchPercentage: undefined,
      status: "Closed",
      createdAt: NOW - 120 * DAY,
      updatedAt: NOW - 30 * DAY,
    });

    // Grant 2: THHS — open grant, deadline 35 days from now
    const grantThhsId = await ctx.db.insert("grants", {
      funderId: thhsId,
      name: "THHS Affordable Housing Program — 2026 NOFA",
      description:
        "Capital funding for acquisition, rehabilitation, or new construction of affordable rental housing units serving households at or below 60% AMI in Texas.",
      category: "Capital",
      amountMin: 250000,
      amountMax: 1000000,
      eligibilityRequirements:
        "Nonprofit or CHDO with HUD-certified Community Housing Development Organization status preferred. Must have site control and environmental clearance before application submission.",
      applicationUrl: "https://www.hhs.texas.gov/nofa-2026",
      openDate: NOW - 30 * DAY,
      deadline: NOW + 35 * DAY,
      announcementDate: NOW + 90 * DAY,
      grantPeriodMonths: 36,
      isRecurring: true,
      matchRequired: true,
      matchPercentage: 25,
      status: "Open",
      createdAt: NOW - 60 * DAY,
      updatedAt: NOW - 5 * DAY,
    });

    // Grant 3: Dell — upcoming grant, deadline 60 days from now
    const grantDtfId = await ctx.db.insert("grants", {
      funderId: dtfId,
      name: "Dell Foundation Digital Equity Grant",
      description:
        "Supports programs providing digital skills training and device access to low-income adults and youth in the Austin metro area.",
      category: "Program",
      amountMin: 25000,
      amountMax: 75000,
      eligibilityRequirements:
        "Austin-based 501(c)(3) serving low-income populations. Program must include measurable outcomes for digital literacy improvement and device access.",
      applicationUrl: "https://www.delltechnologies.com/foundation/apply",
      openDate: NOW + 14 * DAY,
      deadline: NOW + 60 * DAY,
      announcementDate: undefined,
      grantPeriodMonths: 12,
      isRecurring: false,
      matchRequired: false,
      matchPercentage: undefined,
      status: "Upcoming",
      createdAt: NOW - 14 * DAY,
      updatedAt: NOW - 7 * DAY,
    });

    // ─── Applications ─────────────────────────────────────────────────────────
    const appAwardedId = await ctx.db.insert("applications", {
      grantId: grantAcfId,
      leadWriterId: carolId,
      title: "Expanding Health Equity Access in Austin's East Side",
      requestedAmount: 200000,
      projectSummary:
        "This project will establish a community health navigator program embedded within our existing workforce development centers, connecting 500 low-income residents annually to preventive care, mental health services, and insurance enrollment support.",
      stage: "Awarded",
      priority: "High",
      submittedDate: NOW - 45 * DAY,
      decisionDate: NOW - 10 * DAY,
      decisionNotes:
        "Awarded at $175,000 — slightly below requested amount. Funder requested we narrow scope to East Austin zip codes only (78702, 78721, 78722, 78723).",
      reviewedById: bobId,
      reviewedAt: NOW - 50 * DAY,
      internalScore: 9.2,
      tags: "health-equity,community-health,east-austin",
      createdAt: NOW - 90 * DAY,
      updatedAt: NOW - 10 * DAY,
    });

    const appSubmittedId = await ctx.db.insert("applications", {
      grantId: grantThhsId,
      leadWriterId: carolId,
      title: "Hopewell Affordable Housing Renovation — Cedar Creek Units",
      requestedAmount: 750000,
      projectSummary:
        "Rehabilitation of 24 affordable rental units at our Cedar Creek property, addressing deferred maintenance and improving energy efficiency. Project will preserve affordability for households at 30–60% AMI for a minimum 30-year period.",
      stage: "Submitted",
      priority: "Critical",
      submittedDate: NOW - 5 * DAY,
      decisionDate: undefined,
      decisionNotes: undefined,
      reviewedById: bobId,
      reviewedAt: NOW - 7 * DAY,
      internalScore: 8.7,
      tags: "affordable-housing,capital,rehabilitation,cedar-creek",
      createdAt: NOW - 30 * DAY,
      updatedAt: NOW - 5 * DAY,
    });

    const appDraftId = await ctx.db.insert("applications", {
      grantId: grantDtfId,
      leadWriterId: carolId,
      title: "Digital Literacy for Working Families Program",
      requestedAmount: 60000,
      projectSummary:
        "12-month program providing digital skills training, device lending, and broadband navigation support to 200 low-income adults enrolled in our workforce training programs.",
      stage: "Draft",
      priority: "Medium",
      submittedDate: undefined,
      decisionDate: undefined,
      decisionNotes: undefined,
      reviewedById: undefined,
      reviewedAt: undefined,
      internalScore: undefined,
      tags: "digital-equity,workforce,digital-literacy",
      createdAt: NOW - 7 * DAY,
      updatedAt: NOW - 2 * DAY,
    });

    // ─── Application Tasks ────────────────────────────────────────────────────
    await ctx.db.insert("applicationTasks", {
      applicationId: appAwardedId,
      assigneeId: carolId,
      title: "Write program narrative (2,500 words max)",
      category: "Writing",
      dueDate: NOW - 60 * DAY,
      isCompleted: true,
      completedAt: NOW - 62 * DAY,
      completedById: carolId,
      sortOrder: 1,
      createdAt: NOW - 90 * DAY,
    });

    await ctx.db.insert("applicationTasks", {
      applicationId: appAwardedId,
      assigneeId: daveId,
      title: "Prepare project budget and budget justification",
      category: "Budget",
      dueDate: NOW - 55 * DAY,
      isCompleted: true,
      completedAt: NOW - 57 * DAY,
      completedById: daveId,
      sortOrder: 2,
      createdAt: NOW - 90 * DAY,
    });

    await ctx.db.insert("applicationTasks", {
      applicationId: appAwardedId,
      assigneeId: carolId,
      title: "Gather letters of support from community partners",
      category: "Attachments",
      dueDate: NOW - 50 * DAY,
      isCompleted: true,
      completedAt: NOW - 52 * DAY,
      completedById: carolId,
      sortOrder: 3,
      createdAt: NOW - 90 * DAY,
    });

    await ctx.db.insert("applicationTasks", {
      applicationId: appAwardedId,
      assigneeId: bobId,
      title: "Internal review and executive sign-off",
      category: "Review",
      dueDate: NOW - 48 * DAY,
      isCompleted: true,
      completedAt: NOW - 49 * DAY,
      completedById: bobId,
      sortOrder: 4,
      createdAt: NOW - 90 * DAY,
    });

    await ctx.db.insert("applicationTasks", {
      applicationId: appDraftId,
      assigneeId: carolId,
      title: "Write program narrative",
      category: "Writing",
      dueDate: NOW + 30 * DAY,
      isCompleted: false,
      completedAt: undefined,
      completedById: undefined,
      sortOrder: 1,
      createdAt: NOW - 7 * DAY,
    });

    await ctx.db.insert("applicationTasks", {
      applicationId: appDraftId,
      assigneeId: daveId,
      title: "Draft project budget with line-item justification",
      category: "Budget",
      dueDate: NOW + 40 * DAY,
      isCompleted: false,
      completedAt: undefined,
      completedById: undefined,
      sortOrder: 2,
      createdAt: NOW - 7 * DAY,
    });

    // ─── Application Notes ────────────────────────────────────────────────────
    await ctx.db.insert("applicationNotes", {
      applicationId: appAwardedId,
      authorId: bobId,
      content:
        "Called Sarah Kellerman at ACF on Feb 8. She confirmed our LOI was well received and encouraged us to submit full proposal. She mentioned the review committee is especially interested in the insurance enrollment component. Key relationship moment — make sure we acknowledge her support in our acknowledgements section.",
      isPinned: true,
      isInternal: true,
      createdAt: NOW - 75 * DAY,
    });

    await ctx.db.insert("applicationNotes", {
      applicationId: appAwardedId,
      authorId: carolId,
      content:
        "Narrative draft v1 complete and shared with Bob for review. Main open items: need updated participant count data from program team and confirmation of match from Hopewell operating reserves. Will follow up with Finance.",
      isPinned: false,
      isInternal: false,
      createdAt: NOW - 60 * DAY,
    });

    await ctx.db.insert("applicationNotes", {
      applicationId: appSubmittedId,
      authorId: carolId,
      content:
        "Environmental clearance documentation has been received from the consultant. Site control letter from the property management company is on file. All pre-submission attachments are ready.",
      isPinned: false,
      isInternal: false,
      createdAt: NOW - 8 * DAY,
    });

    // ─── Award ────────────────────────────────────────────────────────────────
    const awardId = await ctx.db.insert("awards", {
      applicationId: appAwardedId,
      grantId: grantAcfId,
      awardedAmount: 175000,
      startDate: NOW - 5 * DAY,
      endDate: NOW + 730 * DAY,
      status: "OnTrack",
      restrictionType: "TemporarilyRestricted",
      deliverables:
        "1. Hire and train 2 FTE Community Health Navigators by month 3\n2. Enroll minimum 250 participants by month 12\n3. Connect 500 participants to preventive care services by month 24\n4. Submit quarterly progress reports and annual financial reports\n5. Conduct participant survey with minimum 80% satisfaction rating",
      complianceNotes:
        "Award restricted to East Austin zip codes: 78702, 78721, 78722, 78723. No indirect costs allowable. All personnel must have background checks on file.",
      nextReportDueDate: NOW + 85 * DAY,
      reportingFrequency: "Quarterly",
      totalSpent: 38420,
      remainingBalance: 136580,
      contactAtFunder: "Sarah Kellerman — skellerman@austincf.org — 512-555-0201",
      notes:
        "Funder was very pleased with our LOI follow-up calls. Sarah mentioned ACF may have a capacity building supplement available mid-grant year.",
      createdAt: NOW - 5 * DAY,
    });

    // ─── Expenditures ─────────────────────────────────────────────────────────
    const expPersonnelId = await ctx.db.insert("expenditures", {
      awardId: awardId,
      recordedById: daveId,
      description:
        "Salary — Community Health Navigator (Maria Gonzalez) — March 2026 pro-rated (March 21–31)",
      amount: 3250,
      category: "Personnel",
      date: NOW - 5 * DAY,
      vendor: undefined,
      receiptUrl: undefined,
      isApproved: true,
      approvedById: aliceId,
      createdAt: NOW - 4 * DAY,
    });

    await ctx.db.insert("expenditures", {
      awardId: awardId,
      recordedById: daveId,
      description:
        "Purchase of laptop computers for community health navigator workstations (2 units x $1,350)",
      amount: 2700,
      category: "Equipment",
      date: NOW - 3 * DAY,
      vendor: "Dell Technologies — Austin Direct Sales",
      receiptUrl:
        "https://files.hopewellcommunityservices.org/receipts/dell-invoice-2026-03.pdf",
      isApproved: true,
      approvedById: aliceId,
      createdAt: NOW - 2 * DAY,
    });

    await ctx.db.insert("expenditures", {
      awardId: awardId,
      recordedById: daveId,
      description:
        "Office supplies — intake forms, folders, and outreach materials printing",
      amount: 470,
      category: "Supplies",
      date: NOW - 2 * DAY,
      vendor: "Office Depot — Austin Mueller",
      receiptUrl: undefined,
      isApproved: false,
      createdAt: NOW - 1 * DAY,
    });

    // ─── Reports ──────────────────────────────────────────────────────────────
    await ctx.db.insert("reports", {
      awardId: awardId,
      authorId: carolId,
      title: "Q1 Progress Report — ACF Health Equity Initiative (March–June 2026)",
      type: "Progress",
      periodStart: NOW - 5 * DAY,
      periodEnd: NOW + 85 * DAY,
      content:
        "PROGRAM PROGRESS\n\nHopewell Community Services is pleased to submit this first quarterly progress report for the ACF Health Equity Initiative grant (Award #HEI-2026-0847).\n\nKey Accomplishments:\n- Hired and onboarded 2 FTE Community Health Navigators (Maria Gonzalez and Carlos Rivera)\n- Established partnerships with 4 federally qualified health centers in East Austin\n- Initial outreach began in target zip codes 78702, 78721, 78722, 78723\n\nFINANCIAL SUMMARY\nTotal awarded: $175,000\nExpended to date: $38,420 (22% of award)\nRemaining balance: $136,580\n\nAll expenditures are in compliance with award restrictions and ACF allowable cost guidelines.",
      status: "Draft",
      dueDate: NOW + 85 * DAY,
      submittedDate: undefined,
      createdAt: NOW - 2 * DAY,
    });

    // ─── Notifications ────────────────────────────────────────────────────────
    await ctx.db.insert("notifications", {
      userId: carolId,
      type: "DeadlineApproaching",
      title: "THHS Application Due in 35 Days",
      message:
        "Your application 'Hopewell Affordable Housing Renovation — Cedar Creek Units' is due on " + new Date(NOW + 35 * DAY).toLocaleDateString() + ". Current stage: Submitted. Confirm all required attachments are uploaded to the funder portal.",
      link: "/applications/" + appSubmittedId,
      isRead: false,
      createdAt: NOW - 1 * DAY,
    });

    await ctx.db.insert("notifications", {
      userId: carolId,
      type: "TaskAssigned",
      title: "New Task Assigned: Digital Literacy Application Narrative",
      message:
        "Bob Martinez assigned you a new task: 'Write program narrative' on the Digital Literacy for Working Families Program application. Due date: " + new Date(NOW + 30 * DAY).toLocaleDateString() + ".",
      link: "/applications/" + appDraftId,
      isRead: false,
      createdAt: NOW - 7 * DAY,
    });

    await ctx.db.insert("notifications", {
      userId: bobId,
      type: "ReportDue",
      title: "Q1 Report Due in 85 Days",
      message:
        "The Q1 Progress Report for the ACF Health Equity Initiative is due on " + new Date(NOW + 85 * DAY).toLocaleDateString() + ". Current status: Draft. Please review and submit.",
      link: "/awards/" + awardId + "/reports",
      isRead: false,
      createdAt: NOW - 1 * DAY,
    });

    // ─── Audit Logs ───────────────────────────────────────────────────────────
    await ctx.db.insert("auditLogs", {
      userId: aliceId,
      action: "StageChange",
      entityType: "Application",
      entityId: appAwardedId,
      details: JSON.stringify({
        fromStage: "UnderFunderReview",
        toStage: "Awarded",
        note: "ACF confirmed award via email. Award letter received and filed.",
      }),
      ipAddress: "73.114.22.101",
      createdAt: NOW - 10 * DAY,
    });

    await ctx.db.insert("auditLogs", {
      userId: aliceId,
      action: "Approval",
      entityType: "Expenditure",
      entityId: expPersonnelId,
      details: JSON.stringify({
        expenditureDescription:
          "Salary — Community Health Navigator (Maria Gonzalez) — March 2026 pro-rated",
        amount: 3250,
        approvedBy: "Alice Admin",
      }),
      ipAddress: "73.114.22.101",
      createdAt: NOW - 3 * DAY,
    });

    await ctx.db.insert("auditLogs", {
      userId: carolId,
      action: "Create",
      entityType: "Application",
      entityId: appDraftId,
      details: "Created application: Digital Literacy for Working Families Program",
      ipAddress: "73.114.22.105",
      createdAt: NOW - 7 * DAY,
    });

    await ctx.db.insert("auditLogs", {
      userId: bobId,
      action: "Submission",
      entityType: "Application",
      entityId: appSubmittedId,
      details: "Application submitted to THHS via funder portal",
      ipAddress: "73.114.22.102",
      createdAt: NOW - 5 * DAY,
    });

    return {
      message: "Database seeded successfully (cleared and re-seeded)",
      counts: {
        users: 4,
        organizations: 1,
        funders: 3,
        grants: 3,
        applications: 3,
        applicationTasks: 6,
        applicationNotes: 3,
        awards: 1,
        expenditures: 3,
        reports: 1,
        notifications: 3,
        auditLogs: 4,
      },
    };
  },
});
