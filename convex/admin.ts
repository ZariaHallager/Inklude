import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all policies
export const getPolicies = query({
  handler: async (ctx) => {
    const policies = await ctx.db.query("policies").collect();

    // Convert to key-value object
    const policyObj: Record<string, string> = {};
    for (const policy of policies) {
      policyObj[policy.key] = policy.value;
    }

    return policyObj;
  },
});

// Update or create policy
export const updatePolicy = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    updatedBy: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("policies")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedBy: args.updatedBy,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("policies", {
        key: args.key,
        value: args.value,
        updatedBy: args.updatedBy,
        updatedAt: now,
      });
    }

    // Log audit entry
    await ctx.db.insert("auditLogs", {
      accountId: args.updatedBy,
      action: "update_policy",
      targetType: "policy",
      targetId: args.key,
      metadata: { value: args.value },
      createdAt: now,
    });
  },
});

// Get audit log
export const getAuditLog = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    // Fetch account info for each log
    const results = await Promise.all(
      logs.map(async (log) => {
        const account = await ctx.db.get(log.accountId);
        return {
          ...log,
          account: account
            ? { email: account.email, name: account.name }
            : null,
        };
      })
    );

    return results;
  },
});

// Log admin action
export const logAdminAction = mutation({
  args: {
    accountId: v.id("accounts"),
    action: v.string(),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLogs", {
      accountId: args.accountId,
      action: args.action,
      targetType: args.targetType,
      targetId: args.targetId,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});
