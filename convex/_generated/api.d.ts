/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as analysis from "../analysis.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as customPronouns from "../customPronouns.js";
import type * as http from "../http.js";
import type * as identities from "../identities.js";
import type * as neoPronouns from "../neoPronouns.js";
import type * as templates from "../templates.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  analysis: typeof analysis;
  analytics: typeof analytics;
  auth: typeof auth;
  customPronouns: typeof customPronouns;
  http: typeof http;
  identities: typeof identities;
  neoPronouns: typeof neoPronouns;
  templates: typeof templates;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
