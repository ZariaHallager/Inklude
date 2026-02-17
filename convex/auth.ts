import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Get current user by Clerk ID
export const getCurrentUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return account;
  },
});

// Get current user by email (legacy, for migration)
export const getCurrentUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return account;
  },
});

// Get user by ID
export const getUserById = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.accountId);
  },
});

// List all users (admin only - enforced in frontend)
export const listUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("accounts").collect();
  },
});

// Sync user from Clerk (called by webhook or on first login)
export const syncClerkUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    picture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if account exists by Clerk ID
    const existingByClerk = await ctx.db
      .query("accounts")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingByClerk) {
      // Update existing account
      await ctx.db.patch(existingByClerk._id, {
        email: args.email,
        name: args.name,
        picture: args.picture,
        updatedAt: Date.now(),
      });
      return existingByClerk._id;
    }

    // Check if account exists by email (migration from old system)
    const existingByEmail = await ctx.db
      .query("accounts")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingByEmail) {
      // Link existing account to Clerk
      await ctx.db.patch(existingByEmail._id, {
        clerkId: args.clerkId,
        name: args.name,
        picture: args.picture,
        updatedAt: Date.now(),
      });
      return existingByEmail._id;
    }

    // Create new account
    // First account gets super_admin role
    const accountCount = (await ctx.db.query("accounts").collect()).length;
    const role = accountCount === 0 ? "super_admin" : "user";

    const accountId = await ctx.db.insert("accounts", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      picture: args.picture,
      role,
      createdAt: Date.now(),
    });

    return accountId;
  },
});

// Internal mutation for webhook (bypasses auth)
export const internalSyncClerkUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    picture: v.optional(v.string()),
    deleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.deleted) {
      // User was deleted in Clerk - we could soft-delete or mark inactive
      const existing = await ctx.db
        .query("accounts")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (existing) {
        // For now, just update the name to indicate deleted
        await ctx.db.patch(existing._id, {
          name: `[Deleted] ${existing.name || existing.email}`,
          updatedAt: Date.now(),
        });
      }
      return;
    }

    // Check if account exists by Clerk ID
    const existingByClerk = await ctx.db
      .query("accounts")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingByClerk) {
      await ctx.db.patch(existingByClerk._id, {
        email: args.email,
        name: args.name,
        picture: args.picture,
        updatedAt: Date.now(),
      });
      return existingByClerk._id;
    }

    // Check by email for migration
    const existingByEmail = await ctx.db
      .query("accounts")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingByEmail) {
      await ctx.db.patch(existingByEmail._id, {
        clerkId: args.clerkId,
        name: args.name,
        picture: args.picture,
        updatedAt: Date.now(),
      });
      return existingByEmail._id;
    }

    // Create new
    const accountCount = (await ctx.db.query("accounts").collect()).length;
    const role = accountCount === 0 ? "super_admin" : "user";

    return await ctx.db.insert("accounts", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      picture: args.picture,
      role,
      createdAt: Date.now(),
    });
  },
});

// Legacy: Create or update account (kept for backward compatibility)
export const upsertAccount = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    picture: v.optional(v.string()),
    googleId: v.optional(v.string()),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // If clerkId provided, use new flow
    if (args.clerkId) {
      return await syncClerkUser(ctx, {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        picture: args.picture,
      });
    }

    // Legacy flow for googleId
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        picture: args.picture,
        googleId: args.googleId,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      const accountCount = (await ctx.db.query("accounts").collect()).length;
      const role = accountCount === 0 ? "super_admin" : "user";

      // Need a clerkId for new accounts - generate a placeholder if not provided
      const clerkId = args.clerkId || `legacy_${args.googleId || args.email}`;

      const accountId = await ctx.db.insert("accounts", {
        email: args.email,
        name: args.name,
        picture: args.picture,
        googleId: args.googleId,
        clerkId,
        role,
        createdAt: Date.now(),
      });

      return accountId;
    }
  },
});

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    accountId: v.id("accounts"),
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("super_admin")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.accountId, { role: args.role });
  },
});
