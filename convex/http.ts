import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Clerk webhook endpoint
http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Get the webhook payload
    const payload = await request.json();

    // Verify webhook signature (in production, you should verify with Clerk's signing secret)
    // For now, we'll trust the payload

    const eventType = payload.type;
    const userData = payload.data;

    console.log("Clerk webhook received:", eventType);

    try {
      if (eventType === "user.created" || eventType === "user.updated") {
        // Extract user data from Clerk payload
        const clerkId = userData.id;
        const email = userData.email_addresses?.[0]?.email_address;
        const name = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || undefined;
        const picture = userData.image_url;

        if (!email) {
          return new Response("No email found in user data", { status: 400 });
        }

        // Sync user to Convex
        await ctx.runMutation(internal.auth.internalSyncClerkUser, {
          clerkId,
          email,
          name,
          picture,
        });

        return new Response("User synced successfully", { status: 200 });
      }

      if (eventType === "user.deleted") {
        const clerkId = userData.id;

        await ctx.runMutation(internal.auth.internalSyncClerkUser, {
          clerkId,
          email: "", // Not needed for deletion
          deleted: true,
        });

        return new Response("User deletion processed", { status: 200 });
      }

      // Unknown event type - just acknowledge
      return new Response("Event received", { status: 200 });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return new Response("Internal error", { status: 500 });
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
