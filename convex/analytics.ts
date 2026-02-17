import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get overview stats
export const getOverview = query({
  handler: async (ctx) => {
    const accounts = await ctx.db.query("accounts").collect();
    const identities = await ctx.db.query("identities").collect();
    const templates = await ctx.db.query("templates").collect();
    const analysisRecords = await ctx.db.query("analysisRecords").collect();

    const totalIssues = analysisRecords.reduce(
      (sum, record) => sum + record.issuesFound,
      0
    );

    return {
      totalAnalyses: analysisRecords.length,
      totalIssues,
      totalIdentities: identities.length,
      totalAccounts: accounts.length,
      totalTemplates: templates.length,
    };
  },
});

// Get trends over time
export const getTrends = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const records = await ctx.db
      .query("analysisRecords")
      .withIndex("by_created")
      .filter((q) => q.gte(q.field("createdAt"), cutoff))
      .collect();

    // Group by day
    const byDay = new Map<string, { analyses: number; issues: number }>();

    for (const record of records) {
      const date = new Date(record.createdAt);
      const dayKey = date.toISOString().split("T")[0];

      if (!byDay.has(dayKey)) {
        byDay.set(dayKey, { analyses: 0, issues: 0 });
      }

      const day = byDay.get(dayKey)!;
      day.analyses++;
      day.issues += record.issuesFound;
    }

    // Convert to array and sort
    const trends = Array.from(byDay.entries())
      .map(([date, data]) => ({
        date,
        analyses: data.analyses,
        issues: data.issues,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trends;
  },
});

// Get category breakdown
export const getCategoryBreakdown = query({
  handler: async (ctx) => {
    const records = await ctx.db.query("analysisRecords").collect();

    const categoryCount = new Map<string, number>();

    for (const record of records) {
      for (const category of record.categories) {
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
      }
    }

    return Array.from(categoryCount.entries()).map(([category, count]) => ({
      category,
      count,
    }));
  },
});

// Log analysis record (mutation - actually inserts into database)
export const logAnalysis = mutation({
  args: {
    accountId: v.optional(v.id("accounts")),
    textLength: v.number(),
    issuesFound: v.number(),
    categories: v.array(v.string()),
    tone: v.string(),
    provider: v.union(v.literal("gemini"), v.literal("spacy")),
  },
  handler: async (ctx, args) => {
    const recordId = await ctx.db.insert("analysisRecords", {
      accountId: args.accountId,
      textLength: args.textLength,
      issuesFound: args.issuesFound,
      categories: args.categories,
      tone: args.tone,
      provider: args.provider,
      createdAt: Date.now(),
    });
    return recordId;
  },
});
