# Inklude

AI-powered inclusive language and pronoun intelligence platform with a warm, cozy design.

---

## What Is Inklude?

Inklude is a modern platform that uses AI and natural language processing to make inclusive communication effortless. Featuring a warm, inviting interface designed for inclusion, Inklude detects gendered language, identifies pronouns (including neo-pronouns), and provides smart suggestions — all accessible through an intuitive web interface.

### The Problem

Gendered language is deeply embedded in everyday workplace communication. Terms like "chairman," "fireman," "hey guys," and "dear sir" appear constantly in emails, documents, and chat. Meanwhile, as people increasingly share their pronouns, software tools have no awareness of pronoun preferences. Misgendering — using the wrong pronouns for someone — is harmful, but it happens accidentally because existing tools can't help.

### Core Features

1. **AI-Powered Analysis** — Gemini AI integration for advanced language understanding with contextual analysis.

2. **Gendered Language Detection** — Scans text against 200+ gendered terms with inclusive alternatives and educational explanations. Supports three tone modes: Gentle, Direct, and Research-Backed.

3. **Neo-Pronoun Registry** — Browse and use 17+ neo-pronoun sets (ze/hir, xe/xem, ey/em, fae/faer, and more) with full conjugation, usage notes, and examples.

4. **Mix & Match Pronouns** — Users can add multiple pronoun sets to their profile (e.g., she/they, he/ze) with primary designation and visibility controls.

5. **Pronoun Detection & Resolution** — Identifies all pronouns in text, classifies by type, and resolves coreferences to understand who each pronoun refers to.

6. **Analytics Dashboard** — Track inclusivity metrics over time with visualizations of analyses, issues detected, and category breakdowns.

7. **Warm & Cozy Design** — A welcoming interface with 3D effects, smooth animations, and a carefully crafted color palette.

### Who Is It For?

- **Enterprises** wanting measurable inclusivity metrics and compliance benefits
- **HR and DEI teams** tracking gendered language reduction across the organization
- **Communication platform builders** integrating inclusive language checks into their tools
- **Individual employees** who want to ensure their writing respects everyone's pronouns

---

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Convex (serverless)
- **Authentication**: Clerk
- **AI**: Google Gemini API
- **Animations**: Framer Motion
- **Hosting**: Vercel

---

## Quick Start

### Prerequisites

- **Node.js 20+** — [Download Node.js](https://nodejs.org/)
- **Convex Account** — [Sign up free at convex.dev](https://convex.dev)
- **Clerk Account** — [Sign up at clerk.com](https://clerk.com)
- **Gemini API Key** — [Get from Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Inklude.git
cd Inklude

# Install frontend dependencies
cd frontend
npm install
```

### Environment Setup

Create a `.env` file in the `frontend` directory:

```env
# Convex
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-key
```

Set Convex environment variables (in [Convex Dashboard](https://dashboard.convex.dev) → your project → Settings → Environment Variables):

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk JWT issuer URL for token validation | Clerk Dashboard → JWT Templates → create "convex" template → copy Issuer URL (e.g. `https://joint-gull-20.clerk.accounts.dev`) |
| `GEMINI_API_KEY` | For AI text analysis | [Google AI Studio](https://makersuite.google.com/app/apikey) |

**Important**: Without `CLERK_JWT_ISSUER_DOMAIN`, Convex cannot validate Clerk tokens and auth will fail (blank screen after login).

### Development

```bash
# Start Convex dev server (in one terminal)
npx convex dev

# Start frontend dev server (in another terminal)
npm run dev
```

Your app will be running at `http://localhost:5173`!

### Seed Data

After starting the Convex dev server, seed the database with pronouns and inclusive language templates:

```bash
# In the Convex dashboard or via CLI
npx convex run seed:seedAll
```

---

## Deploy to Vercel

### One-Click Deploy

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel:
   - `VITE_CONVEX_URL`
   - `VITE_CLERK_PUBLISHABLE_KEY`
4. Deploy!

### Clerk Webhook Setup

For user sync to work in production:

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-deployment.convex.site/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret to Convex environment variables (optional, for verification)

---

## Project Structure

```
Inklude/
├── convex/                         # Convex backend
│   ├── _generated/                 # Auto-generated types
│   ├── analysis.ts                 # Text analysis actions
│   ├── analytics.ts                # Analytics queries/mutations
│   ├── auth.ts                     # Authentication logic
│   ├── http.ts                     # HTTP endpoints (webhooks)
│   ├── identities.ts               # Identity CRUD
│   ├── schema.ts                   # Database schema
│   ├── seed.ts                     # Seed data functions
│   └── templates.ts                # Template CRUD
├── frontend/                       # React + Vite frontend
│   ├── src/
│   │   ├── animations/             # Framer Motion variants
│   │   ├── components/
│   │   │   ├── 3D/                 # FloatingCard, GlassCard
│   │   │   └── Background/         # BlobBackground, WarmGradient
│   │   ├── contexts/               # React contexts
│   │   ├── hooks/                  # Custom hooks (useCurrentUser)
│   │   ├── lib/                    # Convex client, types
│   │   ├── pages/                  # All page components
│   │   ├── App.tsx                 # Root component with routing
│   │   ├── index.css               # Global styles
│   │   └── main.tsx                # Entry point
│   └── package.json                # Node dependencies
├── vercel.json                     # Vercel configuration
└── README.md                       # This file
```

---

## Design Philosophy

Inklude's design focuses on three core principles:

1. **Warmth** — A cozy, inviting interface that makes users feel welcome
2. **Inclusivity** — Thoughtful design that celebrates diversity
3. **Delight** — Smooth animations, 3D effects, and micro-interactions

### Color Palette

The color scheme was carefully chosen to evoke warmth and inclusion:

- **Deep Warm Brown (#1a1612)** — Background
- **Warm Coral (#ff9966)** — Primary accent
- **Soft Apricot (#ffcc99)** — Secondary accent
- **Soft Sky Blue (#99ccff)** — Tertiary accent
- **Sage Green (#88c070)** — Success states
- **Warm White (#fef5ed)** — Text

### Typography

- **Comfortaa/Quicksand** — Rounded, friendly headings
- **Inter** — Clean UI font for body text
- **Fira Code** — Monospace for code and technical content

---

## API Reference

Inklude uses Convex for the backend. All functions are type-safe and reactive.

### Analysis

```typescript
// Analyze text for inclusive language
const result = await analyzeText({ text: "...", tone: "gentle" });

// Batch analyze multiple texts
const results = await analyzeBatch({ texts: [...], tone: "direct" });

// Check pronouns against identities
const result = await checkPronouns({ text: "...", identityIds: [...] });
```

### Identities

```typescript
// List identities
const identities = useQuery(api.identities.listIdentities, { limit: 50 });

// Create identity
await createIdentity({ displayName: "Alex", email: "alex@example.com" });

// Update identity
await updateIdentity({ id: "...", displayName: "New Name" });
```

### Analytics

```typescript
// Get overview stats
const overview = useQuery(api.analytics.getOverview);

// Get trends over time
const trends = useQuery(api.analytics.getTrends, { days: 30 });
```

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

---

## License

MIT
