# Inklude Deployment Guide

This guide walks you through deploying Inklude to production using Vercel for the frontend and a separate host for the FastAPI backend.

## Architecture Overview

Inklude has two components that need to be deployed separately:

1. **Frontend** (React + Vite) → Deploy to **Vercel**
2. **Backend** (FastAPI + Python) → Deploy to **Render**, **Railway**, **Fly.io**, or similar

## Prerequisites

Before deploying, you'll need:

- [ ] A Vercel account (free tier works fine)
- [ ] A backend hosting account (Render, Railway, or Fly.io recommended)
- [ ] A PostgreSQL database (Neon, Supabase, or provided by your host)
- [ ] Google OAuth credentials (you already have these)
- [ ] Gemini API key (optional, for text analysis features)

---

## Part 1: Get Required Credentials

### 1.1 Gemini API Key (for AI text analysis)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select or create a Google Cloud project
5. Copy the generated API key
6. Save it - you'll add it to your backend environment variables

### 1.2 Production Database (PostgreSQL)

**Option A: Neon (Recommended - Free tier)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string (looks like: `postgresql://user:pass@host/dbname`)

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the connection string

**Option C: Railway/Render Database**
- Most hosting platforms offer PostgreSQL add-ons
- Follow your host's documentation to provision a database

### 1.3 Update Google OAuth for Production

You already have OAuth credentials, but need to add production URLs:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, add:
   - `https://YOUR-APP-NAME.vercel.app`
   - Your custom domain (if you have one)
4. Under **Authorized redirect URIs**, add:
   - `https://YOUR-BACKEND-URL/api/v1/auth/callback/google`
   - Replace `YOUR-BACKEND-URL` with your actual backend URL after deployment
5. Click **Save**

**Note:** You'll need to update step 4 after you deploy your backend and know its URL.

---

## Part 2: Deploy the Backend

Choose one of these platforms to host your FastAPI backend:

### Option A: Render (Recommended for beginners)

1. **Create account** at [render.com](https://render.com)

2. **Create a new Web Service**:
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Configure:
     - **Name**: `inklude-backend` (or your choice)
     - **Region**: Choose closest to your users
     - **Branch**: `main`
     - **Root Directory**: Leave empty (uses project root)
     - **Runtime**: `Python 3`
     - **Build Command**: `pip install -e .`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables** (in Render dashboard):
   ```
   DATABASE_URL=postgresql://your-neon-connection-string
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=https://YOUR-RENDER-APP.onrender.com/api/v1/auth/callback/google
   FRONTEND_URL=https://YOUR-APP.vercel.app
   JWT_SECRET_KEY=generate-a-long-random-string-here
   API_KEY=generate-another-secure-key
   GEMINI_API_KEY=your-gemini-api-key
   LOG_LEVEL=INFO
   ```

4. **Generate secure keys** (in your terminal):
   ```bash
   # For JWT_SECRET_KEY
   python -c "import secrets; print(secrets.token_hex(32))"
   
   # For API_KEY
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

5. **Deploy**: Render will automatically build and deploy your app

6. **Run database migrations** (in Render Shell or locally):
   ```bash
   alembic upgrade head
   ```

7. **Copy your backend URL**: It will be something like `https://inklude-backend.onrender.com`

### Option B: Railway

1. **Create account** at [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. Select your repository
4. Add a **PostgreSQL** database (Railway provides one-click provisioning)
5. Set environment variables (same as Render above, but `DATABASE_URL` is auto-set)
6. Railway auto-detects Python and deploys

### Option C: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` in your project directory
3. Follow the prompts to create your app
4. Set secrets: `fly secrets set KEY=VALUE` for each env var
5. Deploy: `fly deploy`

---

## Part 3: Update OAuth Redirect URI

Now that your backend is deployed:

1. Go back to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Update the **Authorized redirect URI** to your actual backend URL:
   - `https://inklude-backend.onrender.com/api/v1/auth/callback/google`
4. Save

---

## Part 4: Deploy the Frontend to Vercel

### 4.1 Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`

### 4.2 Configure Project Settings

Vercel should auto-detect settings from your `vercel.json`, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `frontend` (important!)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4.3 Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `VITE_API_BASE` | `https://YOUR-BACKEND-URL` | Production, Preview |

Replace `YOUR-BACKEND-URL` with your actual backend URL from Part 2 (e.g., `https://inklude-backend.onrender.com`)

### 4.4 Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. You'll get a URL like `https://inklude-xyz123.vercel.app`

---

## Part 5: Final Configuration

### 5.1 Update Backend FRONTEND_URL

Go back to your backend hosting platform (Render/Railway/Fly.io):

1. Update the `FRONTEND_URL` environment variable to your Vercel URL:
   ```
   FRONTEND_URL=https://inklude-xyz123.vercel.app
   ```
2. Restart your backend service

### 5.2 Seed Templates (Optional)

SSH into your backend or run locally with production DATABASE_URL:

```bash
python scripts/seed_templates.py
```

This adds the 8 inclusive templates to your database.

---

## Part 6: Verify Deployment

1. Visit your Vercel URL: `https://inklude-xyz123.vercel.app`
2. Click **"Sign in with Google"**
3. Complete the OAuth flow
4. You should be redirected back and logged in
5. Test creating an identity, analyzing text, and using templates

---

## Troubleshooting

### "Network Error" or "Failed to fetch"

**Cause**: Frontend can't reach the backend.

**Fix**: 
- Verify `VITE_API_BASE` is set correctly in Vercel
- Make sure your backend is running and accessible
- Check CORS settings in your backend (FastAPI should allow your Vercel URL)

### OAuth redirect not working

**Cause**: Redirect URI mismatch.

**Fix**:
- Double-check Google Cloud Console has the exact callback URL
- Verify `GOOGLE_REDIRECT_URI` in backend env matches Google Console
- Ensure `FRONTEND_URL` in backend env is your Vercel URL

### Database connection errors

**Cause**: Invalid connection string or database not accessible.

**Fix**:
- Test the connection string locally first
- Ensure the format is: `postgresql+asyncpg://user:pass@host:5432/dbname`
- Run `alembic upgrade head` to create tables

### "Missing GEMINI_API_KEY"

**Cause**: Text analysis tries to use Gemini but key isn't set.

**Fix**:
- Add `GEMINI_API_KEY` to backend environment variables
- Or set `DEFAULT_ANALYSIS_PROVIDER=spacy` if you want local NLP only

---

## Environment Variables Reference

### Backend (Render/Railway/Fly.io)

Required:
```bash
DATABASE_URL=postgresql+asyncpg://...
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/v1/auth/callback/google
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET_KEY=long-random-hex-string
API_KEY=another-secure-key
```

Optional:
```bash
GEMINI_API_KEY=your-gemini-key
DEFAULT_ANALYSIS_PROVIDER=gemini
LOG_LEVEL=INFO
SPACY_MODEL=en_core_web_md
```

### Frontend (Vercel)

Required:
```bash
VITE_API_BASE=https://your-backend.onrender.com
```

---

## Custom Domain (Optional)

### For Vercel (Frontend):
1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `app.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions
4. Update `FRONTEND_URL` in backend to use custom domain

### For Backend:
- Most platforms (Render, Railway, Fly.io) support custom domains
- Follow your host's documentation
- Update all OAuth URIs to use the custom domain

---

## Monitoring & Logs

### Vercel Logs:
- Dashboard → Your Project → Deployments → Click deployment → Function Logs

### Backend Logs:
- **Render**: Dashboard → Your Service → Logs tab
- **Railway**: Dashboard → Your Service → View Logs
- **Fly.io**: `fly logs` command

---

## Scaling Considerations

### Free Tier Limitations:
- **Vercel**: 100 GB bandwidth, unlimited requests
- **Render**: Free tier sleeps after 15 min inactivity (cold starts ~30s)
- **Railway**: $5 free credit/month, then pay-as-you-go

### For Production:
- Upgrade to paid tiers for 24/7 uptime
- Add database connection pooling (PgBouncer)
- Consider CDN for static assets
- Set up monitoring (Sentry, LogRocket)

---

## Security Checklist

Before going to production:

- [ ] Use strong, unique `JWT_SECRET_KEY` (not the example from .env)
- [ ] Use strong `API_KEY` for programmatic access
- [ ] Enable HTTPS only (both frontend and backend)
- [ ] Set secure CORS origins (not wildcard `*`)
- [ ] Regularly rotate API keys and secrets
- [ ] Enable database backups
- [ ] Set up error monitoring (Sentry)
- [ ] Review Google OAuth scopes (minimal necessary)

---

## Next Steps

Once deployed:

1. **Set up a custom domain** for a professional look
2. **Enable analytics** to track usage
3. **Add monitoring** (Sentry for errors, PostHog for analytics)
4. **Create backup strategy** for your database
5. **Document your API** for team members

---

## Need Help?

- Backend issues: Check logs in your hosting platform
- Frontend issues: Check Vercel function logs
- OAuth issues: Verify all URLs match exactly in Google Console
- Database issues: Test connection string with a local client

For specific errors, include:
- The full error message
- Which service (frontend or backend)
- Steps to reproduce
