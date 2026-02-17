import { AuthConfig } from "convex/server";

/**
 * Convex + Clerk auth configuration.
 * Convex uses this to validate JWT tokens from Clerk.
 *
 * Required: Set CLERK_JWT_ISSUER_DOMAIN in your Convex Dashboard:
 * 1. Go to https://dashboard.convex.dev → your project → Settings → Environment Variables
 * 2. Add: CLERK_JWT_ISSUER_DOMAIN = https://joint-gull-20.clerk.accounts.dev
 *
 * To get the exact issuer URL:
 * 1. Go to https://dashboard.clerk.com → your app → JWT Templates
 * 2. Create a template named "convex" (or use existing)
 * 3. Copy the Issuer URL
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
