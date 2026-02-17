import { query } from "./_generated/server";
import { v } from "convex/values";

// Neo-pronoun registry - comprehensive catalogue
export type PopularityTier = "common" | "moderate" | "emerging" | "historical";

export interface NeoPronounSet {
  subject: string;
  object: string;
  possessive: string;
  possessivePronoun: string;
  reflexive: string;
  label: string;
  popularity: PopularityTier;
  origin: string;
  usageNote: string;
  example: string;
}

const NEO_PRONOUN_SETS: NeoPronounSet[] = [
  {
    subject: "ze",
    object: "hir",
    possessive: "hir",
    possessivePronoun: "hirs",
    reflexive: "hirself",
    label: "ze/hir",
    popularity: "common",
    origin: "Coined in the 1990s; widely adopted in LGBTQ+ communities.",
    usageNote: "One of the most widely recognized neo-pronoun sets.",
    example: "Ze went to the store. I saw hir there. That book is hirs.",
  },
  {
    subject: "ze",
    object: "zir",
    possessive: "zir",
    possessivePronoun: "zirs",
    reflexive: "zirself",
    label: "ze/zir",
    popularity: "common",
    origin: "Variant of ze/hir using 'z' throughout for consistency.",
    usageNote: "Popular alternative to ze/hir with a more consistent spelling.",
    example: "Ze laughed. I called zir. That is zir jacket. The idea was zirs.",
  },
  {
    subject: "xe",
    object: "xem",
    possessive: "xyr",
    possessivePronoun: "xyrs",
    reflexive: "xemself",
    label: "xe/xem",
    popularity: "common",
    origin: "Emerged in online communities in the early 2000s.",
    usageNote: "Uses the distinctive 'x' prefix. Pronounced 'zee/zem'.",
    example: "Xe smiled. I told xem the news. Xyr coat is here. This is xyrs.",
  },
  {
    subject: "ey",
    object: "em",
    possessive: "eir",
    possessivePronoun: "eirs",
    reflexive: "emself",
    label: "ey/em",
    popularity: "common",
    origin: "Based on the Spivak pronoun system; 'they' with the 'th' removed.",
    usageNote: "Sometimes called Spivak pronouns. Simple and easy to learn.",
    example: "Ey went home. I saw em leave. Eir bag was heavy. That seat is eirs.",
  },
  {
    subject: "fae",
    object: "faer",
    possessive: "faer",
    possessivePronoun: "faers",
    reflexive: "faerself",
    label: "fae/faer",
    popularity: "moderate",
    origin: "Inspired by the word 'fairy/fae' from folklore traditions.",
    usageNote: "Popular in some online and creative communities.",
    example: "Fae is an artist. I admire faer work. Faer studio is beautiful.",
  },
  {
    subject: "ve",
    object: "ver",
    possessive: "vis",
    possessivePronoun: "vis",
    reflexive: "verself",
    label: "ve/ver",
    popularity: "moderate",
    origin: "Created as a simple, phonetically intuitive set.",
    usageNote: "Easy to pronounce and integrate into everyday speech.",
    example: "Ve is coming. I will meet ver there. Vis phone is ringing.",
  },
  {
    subject: "ne",
    object: "nem",
    possessive: "nir",
    possessivePronoun: "nirs",
    reflexive: "nemself",
    label: "ne/nem",
    popularity: "moderate",
    origin: "Part of a family of minimalist neo-pronoun sets.",
    usageNote: "Short and unobtrusive in text.",
    example: "Ne arrived early. I greeted nem. Nir smile was warm.",
  },
  {
    subject: "per",
    object: "per",
    possessive: "pers",
    possessivePronoun: "pers",
    reflexive: "perself",
    label: "per/per",
    popularity: "moderate",
    origin: "Derived from 'person'; used since the 1970s in feminist writing.",
    usageNote: "Based on 'person'. Same form for subject and object.",
    example: "Per is a great writer. I work with per. Pers ideas are brilliant.",
  },
  {
    subject: "e",
    object: "em",
    possessive: "eir",
    possessivePronoun: "eirs",
    reflexive: "emself",
    label: "e/em",
    popularity: "moderate",
    origin: "Simplified variant of the Spivak system using just 'e'.",
    usageNote: "Very minimal. Context helps distinguish from other uses of 'e'.",
    example: "E is talented. I spoke with em about eir project.",
  },
  {
    subject: "thon",
    object: "thon",
    possessive: "thons",
    possessivePronoun: "thons",
    reflexive: "thonself",
    label: "thon/thon",
    popularity: "historical",
    origin: "Coined by Charles Crozat Converse in 1858; appeared in dictionaries.",
    usageNote: "One of the earliest documented neo-pronouns in English.",
    example: "Thon left already. I will call thon later. Thons work is thorough.",
  },
  {
    subject: "ae",
    object: "aer",
    possessive: "aer",
    possessivePronoun: "aers",
    reflexive: "aerself",
    label: "ae/aer",
    popularity: "emerging",
    origin: "Emerged in online communities as an alternative to fae/faer.",
    usageNote: "Phonetically similar to 'ay/air'. Used in some fantasy and creative spaces.",
    example: "Ae is here. I met aer yesterday. Aer smile was bright.",
  },
  {
    subject: "co",
    object: "co",
    possessive: "cos",
    possessivePronoun: "cos",
    reflexive: "coself",
    label: "co/co",
    popularity: "emerging",
    origin: "Proposed by Mary Orovan in 1970 as a truly neutral pronoun.",
    usageNote: "Same form for subject and object. Simple to use.",
    example: "Co is ready. I asked co about cos schedule.",
  },
  {
    subject: "hu",
    object: "hum",
    possessive: "hus",
    possessivePronoun: "hus",
    reflexive: "humself",
    label: "hu/hum",
    popularity: "emerging",
    origin: "Derived from 'human'; proposed as a universal neutral pronoun.",
    usageNote: "Based on 'human' — intuitive for new users.",
    example: "Hu is talented. I work with hum. Hus project won an award.",
  },
  {
    subject: "it",
    object: "it",
    possessive: "its",
    possessivePronoun: "its",
    reflexive: "itself",
    label: "it/its",
    popularity: "moderate",
    origin: "Standard English pronoun reclaimed by some nonbinary individuals.",
    usageNote:
      "Only use if a person has explicitly stated it/its as their pronouns. Never assume. Using it/its without consent is dehumanizing.",
    example: "It went to the park. I saw it there. Its jacket is red.",
  },
  {
    subject: "sie",
    object: "hir",
    possessive: "hir",
    possessivePronoun: "hirs",
    reflexive: "hirself",
    label: "sie/hir",
    popularity: "moderate",
    origin: "Influenced by the German 'sie' (she/they); adopted in English contexts.",
    usageNote: "Pronounced 'see/here'. Same object forms as ze/hir.",
    example: "Sie is talented. I asked hir about the project. Hir ideas are great.",
  },
  {
    subject: "tey",
    object: "tem",
    possessive: "ter",
    possessivePronoun: "ters",
    reflexive: "temself",
    label: "tey/tem",
    popularity: "emerging",
    origin: "A variation on they/them with distinct forms for clarity.",
    usageNote: "Avoids ambiguity of singular 'they' while staying close phonetically.",
    example: "Tey is coming. I will meet tem at the cafe. Ter order is ready.",
  },
];

// Build lookup tables
const NEO_PRONOUN_MAP = new Map<string, NeoPronounSet>();
const NEO_TOKEN_MAP = new Map<string, Array<{ set: NeoPronounSet; type: string }>>();

function buildLookups() {
  for (const set of NEO_PRONOUN_SETS) {
    NEO_PRONOUN_MAP.set(set.label, set);

    const forms = [
      { token: set.subject, type: "subject" },
      { token: set.object, type: "object" },
      { token: set.possessive, type: "possessive" },
      { token: set.possessivePronoun, type: "possessive_pronoun" },
      { token: set.reflexive, type: "reflexive" },
    ];

    for (const { token, type } of forms) {
      const lower = token.toLowerCase();
      if (!NEO_TOKEN_MAP.has(lower)) {
        NEO_TOKEN_MAP.set(lower, []);
      }
      NEO_TOKEN_MAP.get(lower)!.push({ set, type });
    }
  }
}

buildLookups();

// Query functions
export const listNeoPronouns = query({
  args: {
    popularity: v.optional(v.union(
      v.literal("common"),
      v.literal("moderate"),
      v.literal("emerging"),
      v.literal("historical")
    )),
  },
  handler: async (ctx, args) => {
    if (args.popularity) {
      return NEO_PRONOUN_SETS.filter(set => set.popularity === args.popularity);
    }
    return NEO_PRONOUN_SETS;
  },
});

export const getNeoPronounByLabel = query({
  args: { label: v.string() },
  handler: async (ctx, args) => {
    return NEO_PRONOUN_MAP.get(args.label) || null;
  },
});

export const checkNeoPronoun = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const matches = NEO_TOKEN_MAP.get(args.token.toLowerCase());
    if (!matches || matches.length === 0) {
      return { isNeoPronoun: false, matches: [] };
    }

    return {
      isNeoPronoun: true,
      matches: matches.map(m => ({
        label: m.set.label,
        type: m.type,
      })),
    };
  },
});

export const searchNeoPronouns = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const q = args.query.toLowerCase();
    return NEO_PRONOUN_SETS.filter(set =>
      set.label.toLowerCase().includes(q) ||
      set.subject.toLowerCase().includes(q) ||
      set.object.toLowerCase().includes(q) ||
      set.usageNote.toLowerCase().includes(q)
    );
  },
});
