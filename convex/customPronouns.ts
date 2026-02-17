import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List custom pronouns (own + approved)
export const listCustomPronouns = query({
  args: {
    accountId: v.optional(v.id("accounts")),
    showOnlyApproved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.showOnlyApproved) {
      return await ctx.db
        .query("customPronouns")
        .withIndex("by_approved", (q) => q.eq("isApproved", true))
        .collect();
    }

    if (args.accountId) {
      // Show user's own submissions + approved ones
      const own = await ctx.db
        .query("customPronouns")
        .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
        .collect();

      const approved = await ctx.db
        .query("customPronouns")
        .withIndex("by_approved", (q) => q.eq("isApproved", true))
        .collect();

      // Merge and deduplicate
      const seen = new Set(own.map((p) => p._id));
      const combined = [...own];

      for (const p of approved) {
        if (!seen.has(p._id)) {
          combined.push(p);
          seen.add(p._id);
        }
      }

      return combined;
    }

    // Admin view: all submissions
    return await ctx.db.query("customPronouns").collect();
  },
});

// Get user's submissions
export const getUserSubmissions = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customPronouns")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();
  },
});

// Submit custom pronoun set
export const submitCustomPronoun = mutation({
  args: {
    accountId: v.id("accounts"),
    label: v.string(),
    subject: v.string(),
    object: v.string(),
    possessive: v.string(),
    possessivePronoun: v.string(),
    reflexive: v.string(),
    usageNote: v.optional(v.string()),
    exampleSentence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const pronounId = await ctx.db.insert("customPronouns", {
      accountId: args.accountId,
      label: args.label,
      subject: args.subject,
      object: args.object,
      possessive: args.possessive,
      possessivePronoun: args.possessivePronoun,
      reflexive: args.reflexive,
      usageNote: args.usageNote,
      exampleSentence: args.exampleSentence,
      isApproved: false,
      createdAt: Date.now(),
    });

    return pronounId;
  },
});

// Approve custom pronoun (admin only)
export const approveCustomPronoun = mutation({
  args: {
    pronounId: v.id("customPronouns"),
    approvedBy: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.pronounId, {
      isApproved: true,
      approvedBy: args.approvedBy,
      approvedAt: Date.now(),
    });
  },
});

// Delete custom pronoun
export const deleteCustomPronoun = mutation({
  args: { pronounId: v.id("customPronouns") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.pronounId);
  },
});
