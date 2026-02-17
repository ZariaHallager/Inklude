# Quick Start: Deploy to Vercel

This is a quick reference for deploying Inklude to production. For detailed instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## What Was Changed

✅ **Code changes:**
- Modified [`frontend/src/lib/api.ts`](frontend/src/lib/api.ts) to support `VITE_API_BASE` environment variable
- Created [`vercel.json`](vercel.json) with Vercel configuration
- Created [`frontend/.env.example`](frontend/.env.example) to document frontend environment variables
- Updated [`.gitignore`](.gitignore) to exclude environment files

## Your Next Steps

### 1. Get a Gemini API Key (Optional - for AI analysis)

```bash
# Visit: https://makersuite.google.com/app/apikey
# Create an API key and save it
```

### 2. Deploy Backend First

Choose a platform:
- **Render** (recommended): https://render.com
- **Railway**: https://railway.app  
- **Fly.io**: https://fly.io

Required environment variables for backend:
```bash
DATABASE_URL=postgresql+asyncpg://...
GOOGLE_CLIENT_ID=495296484901-hnhilsbqgpe846rfg5qclln09hk52s06.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://YOUR-BACKEND-URL/api/v1/auth/callback/google
FRONTEND_URL=https://YOUR-VERCEL-URL.vercel.app
JWT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
API_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
GEMINI_API_KEY=your-gemini-api-key
```

After deployment, copy your backend URL (e.g., `https://inklude-backend.onrender.com`)

### 3. Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel auto-detects settings from `vercel.json`
4. Add environment variable:
   - **Key**: `VITE_API_BASE`
   - **Value**: `https://YOUR-BACKEND-URL` (from step 2)
5. Deploy!

### 4. Update Google OAuth

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Edit your OAuth 2.0 Client ID
2. Add to **Authorized redirect URIs**:
   - `https://YOUR-BACKEND-URL/api/v1/auth/callback/google`
3. Add to **Authorized JavaScript origins**:
   - `https://YOUR-VERCEL-URL.vercel.app`
4. Save

### 5. Update Backend Environment

In your backend hosting dashboard:
- Set `FRONTEND_URL` to your Vercel URL
- Restart the backend

### 6. Test!

Visit your Vercel URL and try logging in with Google.

---

## Local Development (unchanged)

```bash
# Backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -e ".[dev]"
uvicorn app.main:app --reload

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` to `localhost:8000` automatically in development.

---

## Environment Variables Summary

### Frontend (Vercel)
- `VITE_API_BASE` - Your backend URL (production only)

### Backend (Render/Railway/Fly.io)
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID (already have)
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth secret (already have)
- `GOOGLE_REDIRECT_URI` - `https://YOUR-BACKEND-URL/api/v1/auth/callback/google`
- `FRONTEND_URL` - Your Vercel URL
- `JWT_SECRET_KEY` - Generate with `python -c "import secrets; print(secrets.token_hex(32))"`
- `API_KEY` - Generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `GEMINI_API_KEY` - From Google AI Studio (optional)

---

## Troubleshooting

**Frontend can't reach backend?**
- Check `VITE_API_BASE` is set in Vercel
- Verify backend is running and accessible

**OAuth redirect fails?**
- Ensure redirect URIs match exactly in Google Console
- Check `GOOGLE_REDIRECT_URI` and `FRONTEND_URL` in backend

**Database errors?**
- Run `alembic upgrade head` to create tables
- Test connection string locally first

---

For detailed deployment instructions, security checklist, and production considerations, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).
