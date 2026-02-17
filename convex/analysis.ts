import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Analysis result types
export interface AnalysisIssue {
  text: string;
  category: string;
  severity: "low" | "medium" | "high";
  startIndex: number;
  endIndex: number;
  suggestion: string;
  explanation: string;
  confidence: number;
}

export interface PronounOccurrence {
  pronoun: string;
  type: string;
  startIndex: number;
  endIndex: number;
  resolvedTo?: string;
  isNeo: boolean;
}

export interface AnalysisResult {
  text: string;
  summary: string;
  issues: AnalysisIssue[];
  pronouns: PronounOccurrence[];
  metadata: {
    totalIssues: number;
    categories: string[];
    processingTime: number;
    provider: "gemini" | "spacy";
  };
}

// Analyze text with Gemini
async function analyzeWithGemini(
  text: string,
  tone: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `You are an inclusive language analyzer. Analyze the following text for:
1. Gendered language (job titles, salutations, colloquialisms, etc.)
2. Pronoun usage (including neo-pronouns like ze/hir, xe/xem, etc.)
3. Any language that could be more inclusive

Text to analyze:
"""
${text}
"""

Tone: ${tone}

Please respond with a JSON object in this exact format:
{
  "summary": "Brief summary of analysis findings",
  "issues": [
    {
      "text": "exact problematic text from input",
      "category": "job_title | salutation | colloquialism | pronoun | other",
      "severity": "low | medium | high",
      "startIndex": 0,
      "endIndex": 10,
      "suggestion": "inclusive alternative",
      "explanation": "why this is problematic and how to improve (tone: ${tone})",
      "confidence": 0.95
    }
  ],
  "pronouns": [
    {
      "pronoun": "they",
      "type": "subject | object | possessive | possessive_pronoun | reflexive",
      "startIndex": 0,
      "endIndex": 4,
      "isNeo": false
    }
  ]
}

Important notes:
- Set "isNeo": true for neo-pronouns like ze, hir, xe, xem, ey, em, fae, faer, ve, ver, etc.
- For "startIndex" and "endIndex", provide approximate positions
- Use tone "${tone}" in explanations: ${tone === "gentle"
      ? "be educational and considerate"
      : tone === "direct"
        ? "be concise and actionable"
        : "include linguistic research context"
    }`;

  const startTime = Date.now();

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Extract JSON from response (might be wrapped in markdown code blocks)
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const parsed = JSON.parse(jsonText);

    const processingTime = Date.now() - startTime;
    const categories = Array.from(
      new Set(parsed.issues.map((i: AnalysisIssue) => i.category))
    );

    return {
      text,
      summary: parsed.summary || "Analysis complete",
      issues: parsed.issues || [],
      pronouns: parsed.pronouns || [],
      metadata: {
        totalIssues: parsed.issues.length,
        categories,
        processingTime,
        provider: "gemini",
      },
    };
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(`Gemini analysis failed: ${error.message}`);
  }
}

// Analyze text with spaCy (via HTTP service)
async function analyzeWithSpacy(
  text: string,
  tone: string
): Promise<AnalysisResult> {
  const spacyUrl = process.env.SPACY_SERVICE_URL || "http://localhost:8001";

  const startTime = Date.now();

  try {
    const response = await fetch(`${spacyUrl}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, tone }),
    });

    if (!response.ok) {
      throw new Error(`spaCy service error: ${response.statusText}`);
    }

    const result = await response.json();
    const processingTime = Date.now() - startTime;

    return {
      ...result,
      metadata: {
        ...result.metadata,
        processingTime,
        provider: "spacy",
      },
    };
  } catch (error: any) {
    console.error("spaCy service error:", error);
    throw new Error(`spaCy analysis failed: ${error.message}`);
  }
}

// Main analysis action
export const analyzeText = action({
  args: {
    text: v.string(),
    tone: v.optional(v.string()),
    provider: v.optional(v.union(v.literal("gemini"), v.literal("spacy"))),
  },
  handler: async (ctx, args): Promise<AnalysisResult> => {
    const tone = args.tone || "gentle";
    const provider = args.provider || "gemini";

    if (provider === "gemini") {
      try {
        return await analyzeWithGemini(args.text, tone);
      } catch (error: any) {
        console.warn("Gemini failed, falling back to spaCy:", error.message);
        // Try spaCy as fallback
        try {
          return await analyzeWithSpacy(args.text, tone);
        } catch (spacyError) {
          // Return basic analysis if both fail
          return {
            text: args.text,
            summary: "Analysis unavailable - both providers failed",
            issues: [],
            pronouns: [],
            metadata: {
              totalIssues: 0,
              categories: [],
              processingTime: 0,
              provider: "gemini",
            },
          };
        }
      }
    } else {
      return await analyzeWithSpacy(args.text, tone);
    }
  },
});

// Batch analysis
export const analyzeBatch = action({
  args: {
    texts: v.array(v.string()),
    tone: v.optional(v.string()),
    provider: v.optional(v.union(v.literal("gemini"), v.literal("spacy"))),
  },
  handler: async (ctx, args): Promise<AnalysisResult[]> => {
    const results: AnalysisResult[] = [];

    for (const text of args.texts) {
      const result = await analyzeText(ctx, {
        text,
        tone: args.tone,
        provider: args.provider,
      });
      results.push(result);
    }

    return results;
  },
});

// Misgendering issue type
export interface MisgenderingIssue {
  text: string;
  expectedPronouns: string[];
  foundPronoun: string;
  identityName: string;
  startIndex: number;
  endIndex: number;
  suggestion: string;
}

// Extended analysis result with misgendering
export interface AnalysisResultWithMisgendering extends AnalysisResult {
  misgenderingIssues: MisgenderingIssue[];
}

// Check pronouns against identities
export const checkPronouns = action({
  args: {
    text: v.string(),
    identityIds: v.array(v.id("identities")),
    tone: v.optional(v.string()),
    provider: v.optional(v.union(v.literal("gemini"), v.literal("spacy"))),
  },
  handler: async (ctx, args): Promise<AnalysisResultWithMisgendering> => {
    // First, do regular analysis
    const analysis = await analyzeText(ctx, {
      text: args.text,
      tone: args.tone,
      provider: args.provider,
    });

    // Fetch identities with their pronoun sets
    const identitiesWithPronouns = await Promise.all(
      args.identityIds.map(async (id) => {
        const identity = await ctx.runQuery(
          // @ts-ignore - internal API
          { path: "identities:getIdentity", args: { identityId: id } }
        );
        return identity;
      })
    );

    // Build a map of names to expected pronouns
    const nameToPronouns = new Map<string, { name: string; pronouns: Set<string> }>();

    for (const identity of identitiesWithPronouns) {
      if (!identity) continue;

      const allPronouns = new Set<string>();
      for (const ps of identity.pronounSets || []) {
        allPronouns.add(ps.subject.toLowerCase());
        allPronouns.add(ps.object.toLowerCase());
        allPronouns.add(ps.possessive.toLowerCase());
        allPronouns.add(ps.possessivePronoun.toLowerCase());
        allPronouns.add(ps.reflexive.toLowerCase());
      }

      // Map by display name (and variations)
      const name = identity.displayName.toLowerCase();
      nameToPronouns.set(name, { name: identity.displayName, pronouns: allPronouns });

      // Also map first name
      const firstName = name.split(' ')[0];
      if (firstName !== name) {
        nameToPronouns.set(firstName, { name: identity.displayName, pronouns: allPronouns });
      }
    }

    // Check for misgendering in the text
    const misgenderingIssues: MisgenderingIssue[] = [];
    const textLower = args.text.toLowerCase();

    // Common pronouns that could indicate misgendering
    const genderedPronouns = {
      masculine: ['he', 'him', 'his', 'himself'],
      feminine: ['she', 'her', 'hers', 'herself'],
      neutral: ['they', 'them', 'their', 'theirs', 'themself', 'themselves'],
    };

    // For each identity mentioned in the text, check if pronouns match
    for (const [nameLower, { name, pronouns }] of nameToPronouns) {
      const nameIndex = textLower.indexOf(nameLower);
      if (nameIndex === -1) continue;

      // Look for pronouns near the name (within ~100 characters after)
      const searchStart = nameIndex + nameLower.length;
      const searchEnd = Math.min(searchStart + 150, args.text.length);
      const nearbyText = textLower.slice(searchStart, searchEnd);

      // Check each gendered pronoun
      for (const [gender, pronounList] of Object.entries(genderedPronouns)) {
        for (const pronoun of pronounList) {
          const pronounIndex = nearbyText.indexOf(pronoun);
          if (pronounIndex === -1) continue;

          // Check if this pronoun is NOT in the person's expected pronouns
          if (!pronouns.has(pronoun)) {
            // This might be misgendering!
            const absoluteIndex = searchStart + pronounIndex;

            // Get expected pronouns for suggestion
            const expectedList = Array.from(pronouns).filter(p =>
              genderedPronouns.masculine.includes(p) ||
              genderedPronouns.feminine.includes(p) ||
              genderedPronouns.neutral.includes(p)
            );

            misgenderingIssues.push({
              text: args.text.slice(absoluteIndex, absoluteIndex + pronoun.length),
              expectedPronouns: expectedList,
              foundPronoun: pronoun,
              identityName: name,
              startIndex: absoluteIndex,
              endIndex: absoluteIndex + pronoun.length,
              suggestion: `${name} uses ${expectedList.slice(0, 3).join('/')} pronouns`,
            });
          }
        }
      }
    }

    return {
      ...analysis,
      misgenderingIssues,
    };
  },
});
