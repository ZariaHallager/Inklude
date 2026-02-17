import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List identities with pagination
export const listIdentities = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const identities = await ctx.db
      .query("identities")
      .order("desc")
      .take(limit + 1);

    const hasMore = identities.length > limit;
    const items = hasMore ? identities.slice(0, limit) : identities;

    // Fetch pronoun sets for each identity
    const results = await Promise.all(
      items.map(async (identity) => {
        const pronounSets = await ctx.db
          .query("pronounSets")
          .withIndex("by_identity", (q) => q.eq("identityId", identity._id))
          .collect();

        const preference = await ctx.db
          .query("preferences")
          .withIndex("by_identity", (q) => q.eq("identityId", identity._id))
          .first();

        return {
          ...identity,
          pronounSets,
          preference,
        };
      })
    );

    return {
      identities: results,
      hasMore,
    };
  },
});

// Get single identity
export const getIdentity = query({
  args: { identityId: v.id("identities") },
  handler: async (ctx, args) => {
    const identity = await ctx.db.get(args.identityId);
    if (!identity) return null;

    const pronounSets = await ctx.db
      .query("pronounSets")
      .withIndex("by_identity", (q) => q.eq("identityId", args.identityId))
      .collect();

    const preference = await ctx.db
      .query("preferences")
      .withIndex("by_identity", (q) => q.eq("identityId", args.identityId))
      .first();

    return {
      ...identity,
      pronounSets,
      preference,
    };
  },
});

// Get identity by account ID
export const getIdentityByAccount = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    const identity = await ctx.db
      .query("identities")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .first();

    if (!identity) return null;

    const pronounSets = await ctx.db
      .query("pronounSets")
      .withIndex("by_identity", (q) => q.eq("identityId", identity._id))
      .collect();

    const preference = await ctx.db
      .query("preferences")
      .withIndex("by_identity", (q) => q.eq("identityId", identity._id))
      .first();

    return {
      ...identity,
      pronounSets,
      preference,
    };
  },
});

// Create identity
export const createIdentity = mutation({
  args: {
    accountId: v.optional(v.id("accounts")),
    email: v.optional(v.string()),
    displayName: v.string(),
    pronounSets: v.array(
      v.object({
        subject: v.string(),
        object: v.string(),
        possessive: v.string(),
        possessivePronoun: v.string(),
        reflexive: v.string(),
        isPrimary: v.boolean(),
      })
    ),
    title: v.optional(
      v.union(
        v.literal("Mr."),
        v.literal("Mrs."),
        v.literal("Ms."),
        v.literal("Mx."),
        v.literal("Dr."),
        v.literal("Prof.")
      )
    ),
    visibility: v.optional(
      v.union(
        v.literal("private"),
        v.literal("team"),
        v.literal("internal"),
        v.literal("public")
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create identity
    const identityId = await ctx.db.insert("identities", {
      accountId: args.accountId,
      email: args.email,
      displayName: args.displayName,
      createdAt: now,
      updatedAt: now,
    });

    // Create pronoun sets
    for (const set of args.pronounSets) {
      await ctx.db.insert("pronounSets", {
        identityId,
        ...set,
        createdAt: now,
      });
    }

    // Create preferences
    if (args.title || args.visibility) {
      await ctx.db.insert("preferences", {
        identityId,
        title: args.title,
        visibility: args.visibility || "internal",
        createdAt: now,
        updatedAt: now,
      });
    }

    return identityId;
  },
});

// Update identity
export const updateIdentity = mutation({
  args: {
    identityId: v.id("identities"),
    displayName: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = { updatedAt: Date.now() };
    if (args.displayName) updates.displayName = args.displayName;
    if (args.email !== undefined) updates.email = args.email;

    await ctx.db.patch(args.identityId, updates);
  },
});

// Delete identity
export const deleteIdentity = mutation({
  args: { identityId: v.id("identities") },
  handler: async (ctx, args) => {
    // Delete pronoun sets
    const pronounSets = await ctx.db
      .query("pronounSets")
      .withIndex("by_identity", (q) => q.eq("identityId", args.identityId))
      .collect();

    for (const set of pronounSets) {
      await ctx.db.delete(set._id);
    }

    // Delete preferences
    const preference = await ctx.db
      .query("preferences")
      .withIndex("by_identity", (q) => q.eq("identityId", args.identityId))
      .first();

    if (preference) {
      await ctx.db.delete(preference._id);
    }

    // Delete identity
    await ctx.db.delete(args.identityId);
  },
});

// Update pronoun sets
export const updatePronounSets = mutation({
  args: {
    identityId: v.id("identities"),
    pronounSets: v.array(
      v.object({
        subject: v.string(),
        object: v.string(),
        possessive: v.string(),
        possessivePronoun: v.string(),
        reflexive: v.string(),
        isPrimary: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Delete existing pronoun sets
    const existing = await ctx.db
      .query("pronounSets")
      .withIndex("by_identity", (q) => q.eq("identityId", args.identityId))
      .collect();

    for (const set of existing) {
      await ctx.db.delete(set._id);
    }

    // Create new pronoun sets
    const now = Date.now();
    for (const set of args.pronounSets) {
      await ctx.db.insert("pronounSets", {
        identityId: args.identityId,
        ...set,
        createdAt: now,
      });
    }

    // Update identity timestamp
    await ctx.db.patch(args.identityId, { updatedAt: now });
  },
});

// Update preferences
export const updatePreferences = mutation({
  args: {
    identityId: v.id("identities"),
    title: v.optional(
      v.union(
        v.literal("Mr."),
        v.literal("Mrs."),
        v.literal("Ms."),
        v.literal("Mx."),
        v.literal("Dr."),
        v.literal("Prof.")
      )
    ),
    visibility: v.optional(
      v.union(
        v.literal("private"),
        v.literal("team"),
        v.literal("internal"),
        v.literal("public")
      )
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("preferences")
      .withIndex("by_identity", (q) => q.eq("identityId", args.identityId))
      .first();

    const now = Date.now();

    if (existing) {
      const updates: any = { updatedAt: now };
      if (args.title !== undefined) updates.title = args.title;
      if (args.visibility) updates.visibility = args.visibility;
      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("preferences", {
        identityId: args.identityId,
        title: args.title,
        visibility: args.visibility || "internal",
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Search identities by name
export const searchIdentities = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const allIdentities = await ctx.db.query("identities").collect();
    const q = args.query.toLowerCase();

    const matches = allIdentities.filter(
      (id) =>
        id.displayName.toLowerCase().includes(q) ||
        (id.email && id.email.toLowerCase().includes(q))
    );

    // Fetch pronoun sets for each match
    const results = await Promise.all(
      matches.slice(0, 10).map(async (identity) => {
        const pronounSets = await ctx.db
          .query("pronounSets")
          .withIndex("by_identity", (q) => q.eq("identityId", identity._id))
          .collect();

        return {
          ...identity,
          pronounSets,
        };
      })
    );

    return results;
  },
});
