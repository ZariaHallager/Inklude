import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User accounts from Clerk OAuth
  accounts: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    picture: v.optional(v.string()),
    role: v.union(
      v.literal("user"),
      v.literal("admin"),
      v.literal("super_admin")
    ),
    clerkId: v.string(), // Clerk user ID
    googleId: v.optional(v.string()), // Legacy, kept for migration
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_clerkId", ["clerkId"])
    .index("by_googleId", ["googleId"]),

  // Identity profiles (pronoun profiles for people)
  identities: defineTable({
    accountId: v.optional(v.id("accounts")), // Links to account if it's the user's own identity
    email: v.optional(v.string()),
    displayName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_email", ["email"]),

  // Pronoun sets for identities
  pronounSets: defineTable({
    identityId: v.id("identities"),
    subject: v.string(), // they, she, he, ze, etc.
    object: v.string(), // them, her, him, zir, etc.
    possessive: v.string(), // their, her, his, hir, etc.
    possessivePronoun: v.string(), // theirs, hers, his, hirs, etc.
    reflexive: v.string(), // themself, herself, himself, hirself, etc.
    isPrimary: v.boolean(),
    createdAt: v.number(),
  }).index("by_identity", ["identityId"]),

  // User preferences (linked to identity)
  preferences: defineTable({
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
    visibility: v.union(
      v.literal("private"),
      v.literal("team"),
      v.literal("internal"),
      v.literal("public")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_identity", ["identityId"]),

  // Custom pronouns submitted by users
  customPronouns: defineTable({
    accountId: v.id("accounts"),
    label: v.string(),
    subject: v.string(),
    object: v.string(),
    possessive: v.string(),
    possessivePronoun: v.string(),
    reflexive: v.string(),
    usageNote: v.optional(v.string()),
    exampleSentence: v.optional(v.string()),
    isApproved: v.boolean(),
    approvedBy: v.optional(v.id("accounts")),
    approvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_approved", ["isApproved"]),

  // Standard pronoun library (seeded data)
  pronouns: defineTable({
    subject: v.string(), // they, she, he, ze, etc.
    object: v.string(), // them, her, him, zir, etc.
    possessive: v.string(), // theirs, hers, his, hirs, etc.
    possessiveAdj: v.string(), // their, her, his, hir, etc.
    reflexive: v.string(), // themself, herself, himself, hirself, etc.
    isNeo: v.boolean(), // true for neo-pronouns
    createdAt: v.number(),
  }).index("by_subject", ["subject"]),

  // Inclusive language replacement templates
  inclusiveTemplates: defineTable({
    category: v.union(
      v.literal("gender"),
      v.literal("disability"),
      v.literal("race"),
      v.literal("age"),
      v.literal("socioeconomic"),
      v.literal("general")
    ),
    original: v.string(), // The problematic term
    replacement: v.string(), // Suggested replacement(s)
    explanation: v.string(), // Why this change matters
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_original", ["original"]),

  // Document templates (for generating inclusive documents)
  templates: defineTable({
    title: v.string(),
    category: v.union(
      v.literal("offer_letter"),
      v.literal("performance_review"),
      v.literal("job_description"),
      v.literal("announcement")
    ),
    description: v.optional(v.string()),
    content: v.string(),
    variables: v.optional(v.array(v.string())), // List of variables used in template
    createdBy: v.optional(v.id("accounts")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_created", ["createdAt"]),

  // Analysis records (for analytics)
  analysisRecords: defineTable({
    accountId: v.optional(v.id("accounts")),
    textLength: v.number(),
    issuesFound: v.number(),
    categories: v.array(v.string()),
    tone: v.string(),
    provider: v.union(v.literal("gemini"), v.literal("spacy")),
    createdAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_created", ["createdAt"]),

  // Admin policies
  policies: defineTable({
    key: v.string(),
    value: v.string(),
    updatedBy: v.id("accounts"),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // Audit log for admin actions
  auditLogs: defineTable({
    accountId: v.id("accounts"),
    action: v.string(),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    metadata: v.optional(v.object({})),
    createdAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_created", ["createdAt"]),
});
