# Deployment Guide

This guide walks you through deploying Inklude to production using Vercel and Convex.

---

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** — Your code should be pushed to a GitHub repository
2. **Vercel Account** — [Sign up at vercel.com](https://vercel.com)
3. **Convex Account** — [Sign up at convex.dev](https://convex.dev)
4. **Clerk Account** — [Sign up at clerk.com](https://clerk.com)
5. **Google AI Studio Account** — For Gemini API key

---

## Step 1: Set Up Convex

### Create a Convex Project

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Click "New Project"
3. Name your project (e.g., "inklude-prod")
4. Note your deployment URL (e.g., `https://your-project-123.convex.cloud`)

### Configure Environment Variables

In the Convex Dashboard, go to Settings → Environment Variables and add:

| Variable | Description |
|----------|-------------|
| `CLERK_SECRET_KEY` | Your Clerk secret key (starts with `sk_live_` for production) |
| `GEMINI_API_KEY` | Your Google Gemini API key |

### Deploy Convex Functions

```bash
# From the project root
npx convex deploy --prod
```

This pushes your schema and functions to the production deployment.

### Seed Initial Data

After deploying, seed the database:

```bash
npx convex run seed:seedAll --prod
```

---

## Step 2: Set Up Clerk

### Create a Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Configure sign-in options (Google, email, etc.)
4. Note your keys:
   - **Publishable Key** (starts with `pk_live_`)
   - **Secret Key** (starts with `sk_live_`)

### Configure Webhooks

1. In Clerk Dashboard, go to Webhooks
2. Add a new endpoint:
   - **URL**: `https://your-convex-deployment.convex.site/clerk`
   - **Events**: Select `user.created`, `user.updated`, `user.deleted`
3. Save the webhook

### Configure Allowed Origins

In Clerk Dashboard → Settings → Paths:
- Add your Vercel domain to allowed origins

---

## Step 3: Deploy to Vercel

### Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Add Environment Variables

In Vercel project settings, add these environment variables:

| Variable | Value |
|----------|-------|
| `VITE_CONVEX_URL` | Your Convex production URL |
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key |

### Deploy

Click "Deploy" and wait for the build to complete.

---

## Step 4: Verify Deployment

### Test Authentication

1. Visit your Vercel URL
2. Click "Sign In"
3. Complete the authentication flow
4. Verify you're redirected to the dashboard

### Test Analysis

1. Go to the Analyze page
2. Enter some test text
3. Verify the analysis completes successfully

### Test Webhooks

1. Create a new user in Clerk
2. Check Convex Dashboard → Data → accounts
3. Verify the user was synced

---

## Custom Domain (Optional)

### Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed

### Update Clerk

1. In Clerk Dashboard, add your custom domain to allowed origins
2. Update any redirect URLs

---

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | Yes | Convex deployment URL |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |

### Backend (Convex)

| Variable | Required | Description |
|----------|----------|-------------|
| `CLERK_SECRET_KEY` | Yes | Clerk secret key for webhook verification |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI analysis |

---

## Troubleshooting

### "Unauthorized" Errors

- Verify `VITE_CLERK_PUBLISHABLE_KEY` is correct
- Check that Clerk application is configured for your domain
- Ensure webhooks are properly configured

### Analysis Not Working

- Verify `GEMINI_API_KEY` is set in Convex environment variables
- Check Convex logs for errors
- Ensure the API key has sufficient quota

### Users Not Syncing

- Verify webhook URL is correct: `https://your-deployment.convex.site/clerk`
- Check webhook events are selected
- Review Convex logs for webhook errors

### Build Failures

- Ensure all dependencies are installed
- Check for TypeScript errors
- Verify environment variables are set

---

## Monitoring

### Convex Dashboard

- View function logs
- Monitor database usage
- Track function invocations

### Vercel Analytics

- Enable Web Analytics in Vercel
- Monitor page views and performance

### Clerk Dashboard

- Monitor user signups
- Track authentication events
- Review security logs

---

## Scaling

Inklude is built on serverless infrastructure that scales automatically:

- **Convex**: Auto-scales based on usage
- **Vercel**: Edge network with automatic scaling
- **Clerk**: Enterprise-grade auth infrastructure

For high-traffic deployments, consider:
- Enabling Vercel Edge Functions
- Upgrading Convex plan for higher limits
- Implementing rate limiting at the edge

---

## Security Checklist

- [ ] Use production API keys (not test keys)
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up webhook signature verification
- [ ] Enable Clerk's security features
- [ ] Review Convex access controls
- [ ] Set up monitoring and alerts
