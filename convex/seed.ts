import { internalMutation } from "./_generated/server";

export const seedDatabase = internalMutation({
  args: {},
  handler: async (ctx) => {
    // ─── Users ────────────────────────────────────────────────────────────────
    const aliceId = await ctx.db.insert("users", {
      clerkId: "clerk_admin_001",
      name: "Alice Admin",
      email: "alice.admin@hopewellcommunityservices.org",
      phone: "512-555-0101",
      avatarUrl: undefined,
      role: "Admin",
      title: "Executive Director",
      department: "Leadership",
      isActive: true,
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
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
      createdAt: 1704153600000,
      updatedAt: 1704153600000,
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
      createdAt: 1704240000000,
      updatedAt: 1704240000000,
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
      createdAt: 1704326400000,
      updatedAt: 1704326400000,
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
      createdAt: 1704067200000,
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
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
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
      createdAt: 1704153600000,
      updatedAt: 1704153600000,
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
      createdAt: 1706745600000,
      updatedAt: 1706745600000,
    });

    // ─── Grants ───────────────────────────────────────────────────────────────
    const grantAcfId = await ctx.db.insert("grants", {
      funderId: acfId,
      name: "ACF Health Equity Initiative 2024",
      description:
        "Supports organizations working to address the root causes of poor health by investing in community-led solutions that advance health equity and well-being across Central Texas.",
      category: "Program",
      amountMin: 100000,
      amountMax: 250000,
      eligibilityRequirements:
        "501(c)(3) organizations operating for at least 3 years with demonstrated focus on health equity. Must serve populations in priority geographies within Travis County.",
      applicationUrl: "https://www.austincf.org/apply/health-equity-2024",
      openDate: 1704067200000,
      deadline: 1709251200000,
      announcementDate: 1714521600000,
      grantPeriodMonths: 24,
      isRecurring: true,
      matchRequired: false,
      matchPercentage: undefined,
      status: "Closed",
      createdAt: 1704067200000,
      updatedAt: 1709251200000,
    });

    const grantThhsId = await ctx.db.insert("grants", {
      funderId: thhsId,
      name: "THHS Affordable Housing Program — 2025 NOFA",
      description:
        "Capital funding for acquisition, rehabilitation, or new construction of affordable rental housing units serving households at or below 60% AMI in Texas.",
      category: "Capital",
      amountMin: 250000,
      amountMax: 1000000,
      eligibilityRequirements:
        "Nonprofit or CHDO with HUD-certified Community Housing Development Organization status preferred. Must have site control and environmental clearance before application submission.",
      applicationUrl: "https://www.hhs.texas.gov/nofa-2025",
      openDate: 1740787200000,
      deadline: 1746057600000,
      announcementDate: 1751328000000,
      grantPeriodMonths: 36,
      isRecurring: true,
      matchRequired: true,
      matchPercentage: 25,
      status: "Open",
      createdAt: 1738368000000,
      updatedAt: 1740787200000,
    });

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
      openDate: 1743465600000,
      deadline: 1751328000000,
      announcementDate: undefined,
      grantPeriodMonths: 12,
      isRecurring: false,
      matchRequired: false,
      matchPercentage: undefined,
      status: "Upcoming",
      createdAt: 1743465600000,
      updatedAt: 1743465600000,
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
      submittedDate: 1709078400000,
      decisionDate: 1714694400000,
      decisionNotes:
        "Awarded at $175,000 — slightly below requested amount. Funder requested we narrow scope to East Austin zip codes only (78702, 78721, 78722, 78723).",
      reviewedById: bobId,
      reviewedAt: 1708992000000,
      internalScore: 9.2,
      tags: "health-equity,community-health,east-austin",
      createdAt: 1706745600000,
      updatedAt: 1714694400000,
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
      submittedDate: 1743552000000,
      decisionDate: undefined,
      decisionNotes: undefined,
      reviewedById: bobId,
      reviewedAt: 1743379200000,
      internalScore: 8.7,
      tags: "affordable-housing,capital,rehabilitation,cedar-creek",
      createdAt: 1740960000000,
      updatedAt: 1743552000000,
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
      createdAt: 1743638400000,
      updatedAt: 1743638400000,
    });

    // ─── Application Tasks ────────────────────────────────────────────────────
    await ctx.db.insert("applicationTasks", {
      applicationId: appAwardedId,
      assigneeId: carolId,
      title: "Write program narrative (2,500 words max)",
      category: "Writing",
      dueDate: 1708300800000,
      isCompleted: true,
      completedAt: 1708214400000,
      completedById: carolId,
      sortOrder: 1,
      createdAt: 1706745600000,
    });

    await ctx.db.insert("applicationTasks", {
      applicationId: appAwardedId,
      assigneeId: daveId,
      title: "Prepare project budget and budget justification",
      category: "Budget",
      dueDate: 1708387200000,
      isCompleted: true,
      completedAt: 1708300800000,
      completedById: daveId,
      sortOrder: 2,
      createdAt: 1706745600000,
    });

    await ctx.db.insert("applicationTasks", {
      applicationId: appAwardedId,
      assigneeId: carolId,
      title: "Gather letters of support from community partners",
      category: "Attachments",
      dueDate: 1708560000000,
      isCompleted: true,
      completedAt: 1708473600000,
      completedById: carolId,
      sortOrder: 3,
      createdAt: 1706745600000,
    });

    await ctx.db.insert("applicationTasks", {
      applicationId: appAwardedId,
      assigneeId: bobId,
      title: "Internal review and executive sign-off",
      category: "Review",
      dueDate: 1708905600000,
      isCompleted: true,
      completedAt: 1708819200000,
      completedById: bobId,
      sortOrder: 4,
      createdAt: 1706745600000,
    });

    await ctx.db.insert("applicationTasks", {
      applicationId: appDraftId,
      assigneeId: carolId,
      title: "Write program narrative",
      category: "Writing",
      dueDate: 1748736000000,
      isCompleted: false,
      completedAt: undefined,
      completedById: undefined,
      sortOrder: 1,
      createdAt: 1743724800000,
    });

    // ─── Application Notes ────────────────────────────────────────────────────
    await ctx.db.insert("applicationNotes", {
      applicationId: appAwardedId,
      authorId: bobId,
      content:
        "Called Sarah Kellerman at ACF on Feb 8. She confirmed our LOI was well received and encouraged us to submit full proposal. She mentioned the review committee is especially interested in the insurance enrollment component. Key relationship moment — make sure we acknowledge her support in our acknowledgements section.",
      isPinned: true,
      isInternal: true,
      createdAt: 1707436800000,
    });

    await ctx.db.insert("applicationNotes", {
      applicationId: appAwardedId,
      authorId: carolId,
      content:
        "Narrative draft v1 complete and shared with Bob for review. Main open items: need updated participant count data from program team and confirmation of match from Hopewell operating reserves. Will follow up with Finance.",
      isPinned: false,
      isInternal: false,
      createdAt: 1708128000000,
    });

    // ─── Award ────────────────────────────────────────────────────────────────
    const awardId = await ctx.db.insert("awards", {
      applicationId: appAwardedId,
      grantId: grantAcfId,
      awardedAmount: 175000,
      startDate: 1717200000000,
      endDate: 1780358400000,
      status: "OnTrack",
      restrictionType: "TemporarilyRestricted",
      deliverables:
        "1. Hire and train 2 FTE Community Health Navigators by month 3\n2. Enroll minimum 250 participants by month 12\n3. Connect 500 participants to preventive care services by month 24\n4. Submit quarterly progress reports and annual financial reports\n5. Conduct participant survey with minimum 80% satisfaction rating",
      complianceNotes:
        "Award restricted to East Austin zip codes: 78702, 78721, 78722, 78723. No indirect costs allowable. All personnel must have background checks on file.",
      nextReportDueDate: 1751328000000,
      reportingFrequency: "Quarterly",
      totalSpent: 38420,
      remainingBalance: 136580,
      contactAtFunder: "Sarah Kellerman — skellerman@austincf.org — 512-555-0201",
      notes:
        "Funder was very pleased with our LOI follow-up calls. Sarah mentioned ACF may have a capacity building supplement available mid-grant year.",
      createdAt: 1714780800000,
    });

    // ─── Expenditures ─────────────────────────────────────────────────────────
    const expPersonnelId = await ctx.db.insert("expenditures", {
      awardId: awardId,
      recordedById: daveId,
      description:
        "Salary — Community Health Navigator (Maria Gonzalez) — June 2024 pro-rated (June 15–30)",
      amount: 3250,
      category: "Personnel",
      date: 1719705600000,
      vendor: undefined,
      receiptUrl: undefined,
      isApproved: true,
      approvedById: aliceId,
      createdAt: 1719792000000,
    });

    await ctx.db.insert("expenditures", {
      awardId: awardId,
      recordedById: daveId,
      description:
        "Purchase of laptop computers for community health navigator workstations (2 units × $1,350)",
      amount: 2700,
      category: "Equipment",
      date: 1720310400000,
      vendor: "Dell Technologies — Austin Direct Sales",
      receiptUrl:
        "https://files.hopewellcommunityservices.org/receipts/dell-invoice-2024-07.pdf",
      isApproved: true,
      approvedById: aliceId,
      createdAt: 1720396800000,
    });

    // ─── Reports ──────────────────────────────────────────────────────────────
    await ctx.db.insert("reports", {
      awardId: awardId,
      authorId: carolId,
      title: "Q1 Progress Report — ACF Health Equity Initiative (June–September 2024)",
      type: "Progress",
      periodStart: 1717200000000,
      periodEnd: 1727740800000,
      content:
        "PROGRAM PROGRESS\n\nHopewell Community Services is pleased to submit this first quarterly progress report for the ACF Health Equity Initiative grant (Award #HEI-2024-0847).\n\nKey Accomplishments:\n• Hired and onboarded 2 FTE Community Health Navigators (Maria Gonzalez and Carlos Rivera) by July 1, 2024\n• Established partnerships with 4 federally qualified health centers in East Austin\n• Enrolled 87 participants in the first quarter — on pace to meet 250-participant Year 1 goal\n• Connected 52 participants to primary care services and 31 to insurance enrollment support\n\nChallenges:\n• Recruitment for bilingual Spanish/English outreach coordinator position took longer than anticipated. Position filled September 15.\n\nFINANCIAL SUMMARY\nTotal awarded: $175,000\nExpended to date: $38,420 (22% of award)\nRemaining balance: $136,580\n\nAll expenditures are in compliance with award restrictions and ACF allowable cost guidelines.",
      status: "Submitted",
      dueDate: 1730419200000,
      submittedDate: 1729814400000,
      createdAt: 1728518400000,
    });

    // ─── Notifications ────────────────────────────────────────────────────────
    await ctx.db.insert("notifications", {
      userId: carolId,
      type: "DeadlineApproaching",
      title: "THHS Application Due in 7 Days",
      message:
        "Your application 'Hopewell Affordable Housing Renovation — Cedar Creek Units' is due on April 30, 2025. Current stage: Submitted. Confirm all required attachments are uploaded to the funder portal.",
      link: "/applications/" + appSubmittedId,
      isRead: false,
      createdAt: 1745452800000,
    });

    await ctx.db.insert("notifications", {
      userId: carolId,
      type: "TaskAssigned",
      title: "New Task Assigned: Digital Literacy Application Narrative",
      message:
        "Bob Martinez assigned you a new task: 'Write program narrative' on the Digital Literacy for Working Families Program application. Due date: June 1, 2025.",
      link: "/applications/" + appDraftId,
      isRead: false,
      createdAt: 1743724800000,
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
      createdAt: 1714694400000,
    });

    await ctx.db.insert("auditLogs", {
      userId: aliceId,
      action: "Approval",
      entityType: "Expenditure",
      entityId: expPersonnelId,
      details: JSON.stringify({
        expenditureDescription:
          "Salary — Community Health Navigator (Maria Gonzalez) — June 2024 pro-rated",
        amount: 3250,
        approvedBy: "Alice Admin",
      }),
      ipAddress: "73.114.22.101",
      createdAt: 1719878400000,
    });

    return {
      message: "Database seeded successfully",
      counts: {
        users: 4,
        organizations: 1,
        funders: 3,
        grants: 3,
        applications: 3,
        applicationTasks: 5,
        applicationNotes: 2,
        awards: 1,
        expenditures: 2,
        reports: 1,
        notifications: 2,
        auditLogs: 2,
      },
    };
  },
});
