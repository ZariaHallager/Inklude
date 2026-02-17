import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List templates
export const listTemplates = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("offer_letter"),
        v.literal("performance_review"),
        v.literal("job_description"),
        v.literal("announcement")
      )
    ),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("templates")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("templates")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});

// Get single template
export const getTemplate = query({
  args: { templateId: v.id("templates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

// Create template
export const createTemplate = mutation({
  args: {
    title: v.string(),
    category: v.union(
      v.literal("offer_letter"),
      v.literal("performance_review"),
      v.literal("job_description"),
      v.literal("announcement")
    ),
    description: v.optional(v.string()),
    content: v.string(),
    createdBy: v.optional(v.id("accounts")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Extract variables from content (e.g., {{NAME}}, {{PRONOUN_SUBJECT}})
    const variableRegex = /\{\{([A-Z_]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(args.content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    const templateId = await ctx.db.insert("templates", {
      title: args.title,
      category: args.category,
      description: args.description,
      content: args.content,
      variables,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    return templateId;
  },
});

// Update template
export const updateTemplate = mutation({
  args: {
    templateId: v.id("templates"),
    title: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("offer_letter"),
        v.literal("performance_review"),
        v.literal("job_description"),
        v.literal("announcement")
      )
    ),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = { updatedAt: Date.now() };

    if (args.title) updates.title = args.title;
    if (args.category) updates.category = args.category;
    if (args.description !== undefined) updates.description = args.description;
    if (args.content) {
      updates.content = args.content;

      // Re-extract variables
      const variableRegex = /\{\{([A-Z_]+)\}\}/g;
      const variables: string[] = [];
      let match;

      while ((match = variableRegex.exec(args.content)) !== null) {
        if (!variables.includes(match[1])) {
          variables.push(match[1]);
        }
      }

      updates.variables = variables;
    }

    await ctx.db.patch(args.templateId, updates);
  },
});

// Delete template
export const deleteTemplate = mutation({
  args: { templateId: v.id("templates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.templateId);
  },
});

// Fill template with values
export const fillTemplate = query({
  args: {
    templateId: v.id("templates"),
    values: v.object({}),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) return null;

    let filled = template.content;

    // Replace each variable
    for (const [key, value] of Object.entries(args.values)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      filled = filled.replace(regex, value as string);
    }

    return {
      ...template,
      filledContent: filled,
    };
  },
});
