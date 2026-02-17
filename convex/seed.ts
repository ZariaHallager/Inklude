import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed neo-pronouns data
const NEO_PRONOUNS = [
  // Traditional pronouns
  { subject: "he", object: "him", possessive: "his", possessiveAdj: "his", reflexive: "himself", isNeo: false },
  { subject: "she", object: "her", possessive: "hers", possessiveAdj: "her", reflexive: "herself", isNeo: false },
  { subject: "they", object: "them", possessive: "theirs", possessiveAdj: "their", reflexive: "themself", isNeo: false },

  // Common neo-pronouns
  { subject: "ze", object: "zir", possessive: "zirs", possessiveAdj: "zir", reflexive: "zirself", isNeo: true },
  { subject: "ze", object: "hir", possessive: "hirs", possessiveAdj: "hir", reflexive: "hirself", isNeo: true },
  { subject: "xe", object: "xem", possessive: "xyrs", possessiveAdj: "xyr", reflexive: "xemself", isNeo: true },
  { subject: "ey", object: "em", possessive: "eirs", possessiveAdj: "eir", reflexive: "emself", isNeo: true },
  { subject: "ve", object: "ver", possessive: "vers", possessiveAdj: "ver", reflexive: "verself", isNeo: true },
  { subject: "per", object: "per", possessive: "pers", possessiveAdj: "per", reflexive: "perself", isNeo: true },
  { subject: "fae", object: "faer", possessive: "faers", possessiveAdj: "faer", reflexive: "faerself", isNeo: true },
  { subject: "ae", object: "aer", possessive: "aers", possessiveAdj: "aer", reflexive: "aerself", isNeo: true },
  { subject: "e", object: "em", possessive: "eirs", possessiveAdj: "eir", reflexive: "emself", isNeo: true },
  { subject: "ne", object: "nem", possessive: "nirs", possessiveAdj: "nir", reflexive: "nemself", isNeo: true },
  { subject: "thon", object: "thon", possessive: "thons", possessiveAdj: "thons", reflexive: "thonself", isNeo: true },
  { subject: "co", object: "co", possessive: "cos", possessiveAdj: "cos", reflexive: "coself", isNeo: true },

  // It/its (used by some non-binary individuals)
  { subject: "it", object: "it", possessive: "its", possessiveAdj: "its", reflexive: "itself", isNeo: false },

  // Name-based (placeholder for any name)
  { subject: "[name]", object: "[name]", possessive: "[name]'s", possessiveAdj: "[name]'s", reflexive: "[name]self", isNeo: true },
];

// Seed templates data
const TEMPLATES = [
  // Gender-inclusive templates
  {
    category: "gender",
    original: "Hey guys",
    replacement: "Hey everyone / Hey folks / Hey team",
    explanation: "Using 'guys' as a default can exclude non-male individuals. Neutral alternatives are more welcoming.",
  },
  {
    category: "gender",
    original: "mankind",
    replacement: "humankind / humanity / people",
    explanation: "Gender-neutral terms better represent all of humanity.",
  },
  {
    category: "gender",
    original: "man-made",
    replacement: "artificial / synthetic / manufactured / human-made",
    explanation: "These alternatives avoid gendered language while conveying the same meaning.",
  },
  {
    category: "gender",
    original: "fireman",
    replacement: "firefighter",
    explanation: "Gender-neutral job titles are more inclusive and accurate.",
  },
  {
    category: "gender",
    original: "policeman",
    replacement: "police officer",
    explanation: "Gender-neutral job titles recognize that people of all genders serve in this role.",
  },
  {
    category: "gender",
    original: "chairman",
    replacement: "chairperson / chair",
    explanation: "Neutral titles are more inclusive in professional settings.",
  },
  {
    category: "gender",
    original: "stewardess",
    replacement: "flight attendant",
    explanation: "This term is gender-neutral and is the industry standard.",
  },
  {
    category: "gender",
    original: "mailman",
    replacement: "mail carrier / postal worker",
    explanation: "Gender-neutral alternatives are more accurate and inclusive.",
  },

  // Disability-inclusive templates
  {
    category: "disability",
    original: "crazy / insane",
    replacement: "unbelievable / wild / intense / extreme",
    explanation: "Using mental health conditions as casual descriptors can be stigmatizing.",
  },
  {
    category: "disability",
    original: "lame",
    replacement: "uncool / boring / disappointing",
    explanation: "This term originated as an ableist slur and can be hurtful to people with mobility disabilities.",
  },
  {
    category: "disability",
    original: "blind to",
    replacement: "unaware of / ignoring / overlooking",
    explanation: "Using disability as a metaphor for ignorance can be stigmatizing.",
  },
  {
    category: "disability",
    original: "deaf to",
    replacement: "ignoring / dismissing / not listening to",
    explanation: "Using disability as a metaphor for not listening can be offensive.",
  },
  {
    category: "disability",
    original: "crippled by",
    replacement: "hindered by / impacted by / affected by",
    explanation: "The term 'crippled' is considered offensive by many in the disability community.",
  },
  {
    category: "disability",
    original: "wheelchair-bound",
    replacement: "wheelchair user / uses a wheelchair",
    explanation: "Many wheelchair users see their chair as liberating, not confining.",
  },
  {
    category: "disability",
    original: "suffers from [condition]",
    replacement: "has [condition] / lives with [condition]",
    explanation: "Person-first language that doesn't assume suffering is more respectful.",
  },
  {
    category: "disability",
    original: "special needs",
    replacement: "disabled / has a disability / accessibility needs",
    explanation: "Many in the disability community prefer direct language over euphemisms.",
  },

  // Race and ethnicity templates
  {
    category: "race",
    original: "blacklist / whitelist",
    replacement: "blocklist / allowlist / denylist / permitlist",
    explanation: "These alternatives avoid associating colors with positive/negative connotations.",
  },
  {
    category: "race",
    original: "master / slave",
    replacement: "primary / replica / leader / follower / main / secondary",
    explanation: "Technical terms that don't reference slavery are more inclusive.",
  },
  {
    category: "race",
    original: "grandfathered in",
    replacement: "legacy status / exempted / pre-approved",
    explanation: "The term has roots in discriminatory voting practices.",
  },
  {
    category: "race",
    original: "spirit animal",
    replacement: "kindred spirit / personal mascot / favorite animal",
    explanation: "Spirit animals have specific cultural significance in Indigenous traditions.",
  },
  {
    category: "race",
    original: "tribe",
    replacement: "team / group / community / squad",
    explanation: "Using 'tribe' casually can trivialize Indigenous cultures.",
  },
  {
    category: "race",
    original: "pow-wow",
    replacement: "meeting / discussion / huddle",
    explanation: "Pow-wows are sacred gatherings in Indigenous cultures.",
  },

  // Age-inclusive templates
  {
    category: "age",
    original: "elderly",
    replacement: "older adults / seniors",
    explanation: "'Elderly' can sound clinical or patronizing.",
  },
  {
    category: "age",
    original: "young lady / young man",
    replacement: "person / individual / [their name]",
    explanation: "These terms can be condescending, especially in professional settings.",
  },
  {
    category: "age",
    original: "ok boomer",
    replacement: "[Address the specific disagreement]",
    explanation: "Generational stereotypes oversimplify and can be dismissive.",
  },
  {
    category: "age",
    original: "senior moment",
    replacement: "forgot / memory lapse",
    explanation: "This phrase reinforces negative stereotypes about aging.",
  },

  // Socioeconomic templates
  {
    category: "socioeconomic",
    original: "ghetto",
    replacement: "low-income area / underserved community",
    explanation: "The term has racist origins and is often used pejoratively.",
  },
  {
    category: "socioeconomic",
    original: "white trash",
    replacement: "[Avoid this term entirely]",
    explanation: "This term is classist and dehumanizing.",
  },
  {
    category: "socioeconomic",
    original: "the homeless",
    replacement: "people experiencing homelessness / unhoused individuals",
    explanation: "Person-first language recognizes that housing status doesn't define a person.",
  },

  // General inclusive templates
  {
    category: "general",
    original: "normal",
    replacement: "typical / common / standard",
    explanation: "Calling something 'normal' implies other things are abnormal or wrong.",
  },
  {
    category: "general",
    original: "exotic",
    replacement: "unique / distinctive / unfamiliar",
    explanation: "When used to describe people, 'exotic' can be othering.",
  },
  {
    category: "general",
    original: "you guys",
    replacement: "you all / y'all / everyone / folks",
    explanation: "Gender-neutral alternatives include everyone in the conversation.",
  },
  {
    category: "general",
    original: "ladies and gentlemen",
    replacement: "everyone / distinguished guests / folks",
    explanation: "Non-binary individuals may not identify with either term.",
  },
];

// Seed neo-pronouns
export const seedNeoPronouns = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if pronouns already exist
    const existing = await ctx.db.query("pronouns").first();
    if (existing) {
      return { message: "Neo-pronouns already seeded", count: 0 };
    }

    let count = 0;
    for (const pronoun of NEO_PRONOUNS) {
      await ctx.db.insert("pronouns", {
        ...pronoun,
        createdAt: Date.now(),
      });
      count++;
    }

    return { message: "Neo-pronouns seeded successfully", count };
  },
});

// Seed inclusive language templates
export const seedInclusiveTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if templates already exist
    const existing = await ctx.db.query("inclusiveTemplates").first();
    if (existing) {
      return { message: "Inclusive templates already seeded", count: 0 };
    }

    let count = 0;
    for (const template of TEMPLATES) {
      await ctx.db.insert("inclusiveTemplates", {
        category: template.category as "gender" | "disability" | "race" | "age" | "socioeconomic" | "general",
        original: template.original,
        replacement: template.replacement,
        explanation: template.explanation,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      count++;
    }

    return { message: "Inclusive templates seeded successfully", count };
  },
});

// Seed all data
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      pronouns: { message: "", count: 0 },
      inclusiveTemplates: { message: "", count: 0 },
    };

    // Seed pronouns
    const existingPronouns = await ctx.db.query("pronouns").first();
    if (!existingPronouns) {
      let count = 0;
      for (const pronoun of NEO_PRONOUNS) {
        await ctx.db.insert("pronouns", {
          ...pronoun,
          createdAt: Date.now(),
        });
        count++;
      }
      results.pronouns = { message: "Seeded", count };
    } else {
      results.pronouns = { message: "Already exists", count: 0 };
    }

    // Seed inclusive templates
    const existingTemplates = await ctx.db.query("inclusiveTemplates").first();
    if (!existingTemplates) {
      let count = 0;
      for (const template of TEMPLATES) {
        await ctx.db.insert("inclusiveTemplates", {
          category: template.category as "gender" | "disability" | "race" | "age" | "socioeconomic" | "general",
          original: template.original,
          replacement: template.replacement,
          explanation: template.explanation,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        count++;
      }
      results.inclusiveTemplates = { message: "Seeded", count };
    } else {
      results.inclusiveTemplates = { message: "Already exists", count: 0 };
    }

    return results;
  },
});
