# Inklude

AI-powered inclusive language and pronoun intelligence platform.

---

## What Is Inklude?

Inklude is an enterprise-grade platform that uses natural language processing (NLP) to make inclusive communication effortless. It detects gendered language, identifies pronouns (including neo-pronouns), resolves who pronouns refer to, and flags potential misgendering — all through a beautiful web interface and a REST API that integrates with existing tools.

### The Problem

Gendered language is deeply embedded in everyday workplace communication. Terms like "chairman," "fireman," "hey guys," and "dear sir" appear constantly in emails, documents, and chat. Meanwhile, as people increasingly share their pronouns, software tools have no awareness of pronoun preferences. Misgendering — using the wrong pronouns for someone — is harmful, but it happens accidentally because existing tools can't help.

### What Inklude Does

Inklude provides a language intelligence layer that any organization can deploy. It offers:

1. **Gendered Language Detection** — Scans text against a curated lexicon of 200+ gendered terms across job titles, salutations, colloquialisms, honorifics, familial terms, and institutional language. Each flagged term comes with inclusive alternatives and an educational explanation.

2. **Pronoun Detection** — Identifies all pronouns in text, including traditional pronouns (he/she/they) and 17+ neo-pronoun sets (ze/hir, xe/xem, ey/em, fae/faer, and more). Each pronoun is classified by type (subject, object, possessive, reflexive).

3. **Coreference Resolution** — Determines who each pronoun refers to by linking pronouns to the people mentioned in the text.

4. **Misgendering Detection** — Cross-references the pronouns used in text against stored identity profiles to flag cases where someone is referred to with the wrong pronouns.

5. **Custom Pronoun Support** — Users can submit their own pronoun sets if they aren't in the registry. Admin approval adds them to the global registry.

6. **Tone-Aware Suggestions** — Every suggestion comes with a tone-aware explanation in one of three modes: Gentle (educational), Direct (concise corrections), or Research-Backed (linguistic context).

7. **Identity Preference Center** — Users set their own display name, pronouns, title, and visibility preferences from a dedicated profile page.

8. **Analytics Dashboard** — Track inclusivity metrics: analyses over time, issues detected, gendered language trends, and category breakdowns.

9. **Inclusive Templates** — A library of pre-built inclusive templates for offer letters, performance reviews, job descriptions, and announcements.

10. **Admin Console** — User management, role-based access control, policy configuration, custom pronoun approval queue, and audit logging.

### Who Is It For?

- **Enterprises** wanting measurable inclusivity metrics and compliance benefits
- **HR and DEI teams** tracking gendered language reduction across the organization
- **Communication platform builders** integrating inclusive language checks into their tools
- **Individual employees** who want to ensure their writing respects everyone's pronouns

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Local Development Setup](#local-development-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Google OAuth Configuration](#google-oauth-configuration)
- [Environment Variables](#environment-variables)
- [Using the Web Application](#using-the-web-application)
  - [Logging In](#logging-in)
  - [Dashboard](#dashboard)
  - [Analyzing Text](#analyzing-text)
  - [Managing Identities](#managing-identities)
  - [Setting Your Pronouns](#setting-your-pronouns)
  - [Browsing Neo-Pronouns](#browsing-neo-pronouns)
  - [Submitting Custom Pronouns](#submitting-custom-pronouns)
  - [Using Inclusive Templates](#using-inclusive-templates)
  - [Viewing Analytics](#viewing-analytics)
  - [Admin Console](#admin-console)
- [Using the REST API](#using-the-rest-api)
  - [Authentication](#authentication)
  - [Text Analysis Endpoints](#text-analysis-endpoints)
  - [Identity Endpoints](#identity-endpoints)
  - [Neo-Pronoun Endpoints](#neo-pronoun-endpoints)
  - [Custom Pronoun Endpoints](#custom-pronoun-endpoints)
  - [Template Endpoints](#template-endpoints)
  - [Analytics Endpoints](#analytics-endpoints)
  - [Admin Endpoints](#admin-endpoints)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [License](#license)

---

## Prerequisites

- **Python 3.11+** — [Download Python](https://www.python.org/downloads/)
- **Node.js 20+** — [Download Node.js](https://nodejs.org/) (for the frontend)
- **PostgreSQL 16+** — [Download PostgreSQL](https://www.postgresql.org/download/), or use Docker
- **Docker and Docker Compose** (optional but recommended) — [Install Docker](https://docs.docker.com/get-docker/)

---

## Quick Start with Docker

The fastest way to get Inklude running with all services:

```bash
# Clone the repository
git clone https://github.com/your-username/Inklude.git
cd Inklude

# Copy environment config
cp .env.example .env

# Edit .env and add your Google OAuth credentials (see Google OAuth Configuration section)

# Build and start everything
docker compose up --build
```

This starts three containers:
- **Backend API** at `http://localhost:8000` (FastAPI + NLP engine)
- **Frontend** at `http://localhost:5173` (React web application)
- **PostgreSQL** at `localhost:5432`

To run in the background: `docker compose up --build -d`

To stop: `docker compose down`

To stop and remove all data: `docker compose down -v`

---

## Local Development Setup

### Backend Setup

**1. Create and activate a virtual environment:**

```bash
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows
```

**2. Install dependencies:**

```bash
pip install -e ".[dev]"
```

**3. Download the spaCy language model (~40 MB):**

```bash
python -m spacy download en_core_web_md
```

**4. Configure environment:**

```bash
cp .env.example .env
# Edit .env with your settings (see Environment Variables section)
```

**5. Set up the database:**

If using PostgreSQL locally:

```bash
createdb inklude
alembic upgrade head
```

For SQLite (local dev convenience — tables auto-create on startup):

```bash
# Set DATABASE_URL=sqlite+aiosqlite:///./dev.db in your .env
```

**6. Start the API server:**

```bash
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend Setup

**1. Navigate to the frontend directory:**

```bash
cd frontend
```

**2. Install dependencies:**

```bash
npm install
```

**3. Start the development server:**

```bash
npm run dev
```

The frontend is available at `http://localhost:5173`. It proxies API requests to `localhost:8000` automatically.

---

## Google OAuth Configuration

Inklude uses Google OAuth for user authentication. To set it up:

**1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)**

**2. Create a new OAuth 2.0 Client ID:**
- Application type: **Web application**
- Authorized redirect URIs: `http://localhost:8000/api/v1/auth/callback/google`

**3. Copy the Client ID and Client Secret to your `.env` file:**

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

**4. The first user to log in is automatically granted `super_admin` role.**

> **Note:** If Google OAuth is not configured, users can still access the API using the `X-API-Key` header for programmatic access.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://inklude:inklude@localhost:5432/inklude` | Database connection string |
| `TEST_DATABASE_URL` | `sqlite+aiosqlite:///./test.db` | Test database (SQLite) |
| `API_KEY` | `change-me-to-a-secure-key` | API key for programmatic access |
| `GOOGLE_CLIENT_ID` | *(empty)* | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | *(empty)* | Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | `http://localhost:8000/api/v1/auth/callback/google` | OAuth callback URL |
| `JWT_SECRET_KEY` | `change-me-to-a-random-secret...` | Secret for signing JWT tokens |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `JWT_EXPIRE_MINUTES` | `1440` | Token expiration (24 hours) |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL for CORS/redirects |
| `LOG_LEVEL` | `INFO` | Logging level |
| `SPACY_MODEL` | `en_core_web_md` | spaCy model for NLP |

---

## Using the Web Application

### Logging In

1. Open `http://localhost:5173` in your browser
2. Click **"Sign in with Google"** on the login page
3. Complete the Google OAuth flow
4. You'll be redirected to the Dashboard

The first user to sign in is automatically a **Super Admin** with full access.

### Dashboard

The dashboard shows:
- **Overview cards** with total analyses, issues found, identities managed, accounts, and templates
- **Quick Analyze** box where you can paste text and get instant analysis with a tone selector

### Analyzing Text

1. Navigate to **Analyze Text** from the sidebar
2. Paste or type text in the large text area
3. Select a tone mode:
   - **Gentle** — Educational and considerate suggestions
   - **Direct** — Concise, actionable corrections
   - **Research-backed** — Includes linguistic research context
4. Click **Analyze**
5. Review the results:
   - **Summary** of issues found
   - **Issues list** with flagged text highlighted, severity badges, explanations, and inclusive alternatives
   - **Pronouns found** with type classification and resolved entity

For multiple texts, switch to the **Batch** tab, enter texts separated by double newlines, and click **Batch Analyze**.

### Managing Identities

1. Navigate to **Identities** from the sidebar
2. Click **Create Identity** to add a new person's pronoun profile
3. Fill in: email, display name, pronoun sets (subject/object/possessive/possessive_pronoun/reflexive), and preferences (title, visibility)
4. Click on any identity to expand it and see full details, edit the display name, or delete it
5. Use pagination at the bottom to browse through identities

### Setting Your Pronouns

1. Navigate to **My Pronouns** from the sidebar
2. If you haven't set up a profile yet, you'll see a setup form
3. Configure:
   - **Display Name** — how you want to be referred to
   - **Title** — Mr., Mrs., Ms., Mx., Dr., Prof., or None
   - **Visibility** — who can see your pronoun data (Private, Team, Internal, Public)
   - **Pronoun Sets** — use quick-pick presets (he/him, she/her, they/them, ze/hir, xe/xem) or enter custom pronouns
   - Add multiple pronoun sets if you use more than one
4. Click **Save Changes**
5. Preview how your pronouns appear in example sentences

### Browsing Neo-Pronouns

1. Navigate to **Neo-Pronouns** from the sidebar
2. Browse the card grid of 17+ recognized neo-pronoun sets
3. Filter by popularity: Common, Moderate, Emerging, Historical
4. Search by any pronoun form
5. Each card shows the full conjugation, origin, usage notes, and example sentences

### Submitting Custom Pronouns

1. On the Neo-Pronouns page, scroll to **"Submit Your Pronouns"**
2. Expand the submission form
3. Fill in all pronoun forms: subject, object, possessive, possessive pronoun, reflexive
4. Add a label (e.g., "xe/xem"), optional usage note, and example sentence
5. Click **Submit**
6. Your custom set is immediately usable in your own analyses
7. An admin can approve it to add it to the global registry for everyone

### Using Inclusive Templates

1. Navigate to **Templates** from the sidebar
2. Browse templates by category: Offer Letters, Performance Reviews, Job Descriptions, Announcements
3. Click a template to expand and see its full content
4. Click the **Copy** button to copy the template to your clipboard
5. Admins can create, edit, and delete templates

### Viewing Analytics

1. Navigate to **Analytics** from the sidebar
2. View overview stats: Total Analyses, Issues Found, Identities, Accounts, Templates
3. See trends over time as a line chart (select 7, 30, 90, or 365 day ranges)
4. View the category breakdown as a bar chart

### Admin Console

Admins and Super Admins have access to additional features:

**User Management** (`/admin/users`):
- View all registered accounts
- Change user roles (User, Admin, Super Admin)

**Policy Configuration** (`/admin/policies`):
- Set enforcement mode: suggest-only, auto-correct, or block
- Enable/disable checks for job posts, emails
- Set default tone

**Custom Pronoun Approvals** (`/admin/custom-pronouns`):
- Review pending custom pronoun submissions
- Approve to add to the global registry
- Delete inappropriate submissions

**Audit Log**:
- View a trail of all admin actions

---

## Using the REST API

All endpoints are at `/api/v1/`. Interactive documentation is at `/docs` (Swagger) or `/redoc`.

### Authentication

The API supports two authentication methods:

**1. JWT Bearer Token** (for web UI, obtained via Google OAuth):

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8000/api/v1/auth/me
```

**2. API Key** (for programmatic/machine access):

```bash
curl -H "X-API-Key: your-api-key" http://localhost:8000/api/v1/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"text": "The chairman called the meeting."}'
```

### Text Analysis Endpoints

**Analyze single text:**

```bash
curl -X POST http://localhost:8000/api/v1/analyze/text \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-me-to-a-secure-key" \
  -d '{
    "text": "The chairman told the fireman to man the fort.",
    "tone": "gentle"
  }'
```

**Batch analyze (up to 50 texts):**

```bash
curl -X POST http://localhost:8000/api/v1/analyze/batch \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-me-to-a-secure-key" \
  -d '{
    "texts": [
      "Hey guys, review the manpower report.",
      "Dear Sir, please find attached."
    ],
    "tone": "direct"
  }'
```

**Check pronouns against known identities:**

```bash
curl -X POST http://localhost:8000/api/v1/analyze/check-pronouns \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-me-to-a-secure-key" \
  -d '{
    "text": "Alex submitted his report. He did a great job.",
    "person_ids": ["ALEX_IDENTITY_UUID"],
    "tone": "gentle"
  }'
```

### Identity Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/identities/` | Create identity profile |
| GET | `/api/v1/identities/` | List identities (paginated) |
| GET | `/api/v1/identities/{id}` | Get identity by ID |
| PUT | `/api/v1/identities/{id}` | Update identity |
| DELETE | `/api/v1/identities/{id}` | Delete identity |
| GET | `/api/v1/identities/{id}/pronouns` | Get pronoun sets |
| PUT | `/api/v1/identities/{id}/pronouns` | Replace pronoun sets |
| PUT | `/api/v1/identities/{id}/preferences` | Update preferences |

### Neo-Pronoun Endpoints

These are public (no auth required):

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/neo-pronouns/` | List all neo-pronoun sets |
| GET | `/api/v1/neo-pronouns/check?token=hir` | Check if a word is a neo-pronoun |
| GET | `/api/v1/neo-pronouns/{label}` | Get a specific set by label |

### Custom Pronoun Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/custom-pronouns/` | User | Submit a custom pronoun set |
| GET | `/api/v1/custom-pronouns/` | User | List custom sets (own + approved) |
| PUT | `/api/v1/custom-pronouns/{id}/approve` | Admin | Approve for global registry |
| DELETE | `/api/v1/custom-pronouns/{id}` | User | Delete a custom set |

### Template Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/templates/` | User | List templates |
| GET | `/api/v1/templates/{id}` | User | Get template content |
| POST | `/api/v1/templates/` | Admin | Create template |
| PUT | `/api/v1/templates/{id}` | Admin | Update template |
| DELETE | `/api/v1/templates/{id}` | Admin | Delete template |

### Analytics Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/analytics/overview` | Summary stats |
| GET | `/api/v1/analytics/trends?days=30` | Time-series data |
| GET | `/api/v1/analytics/categories` | Breakdown by category |

### Admin Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/admin/users` | List all accounts |
| PUT | `/api/v1/admin/users/{id}/role` | Change user role |
| GET | `/api/v1/admin/policies` | Get policy settings |
| PUT | `/api/v1/admin/policies` | Create/update policy |
| GET | `/api/v1/admin/audit-log` | View audit trail |

---

## Running Tests

Tests use an in-memory SQLite database — no PostgreSQL required.

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run all tests
python -m pytest tests/ -v

# Run only API tests
python -m pytest tests/test_api/ -v

# Run only NLP tests
python -m pytest tests/test_nlp/ -v
```

---

## Project Structure

```
Inklude/
├── app/                            # FastAPI backend
│   ├── api/                        # Route handlers
│   │   ├── admin.py                # Admin endpoints (users, policies, audit)
│   │   ├── analysis.py             # Text analysis endpoints
│   │   ├── analytics.py            # Analytics/metrics endpoints
│   │   ├── auth.py                 # Google OAuth + JWT endpoints
│   │   ├── custom_pronouns.py      # Custom pronoun submission
│   │   ├── health.py               # Health checks
│   │   ├── identity.py             # Identity CRUD
│   │   ├── neo_pronouns.py         # Neo-pronoun registry
│   │   ├── router.py               # Aggregates all routers
│   │   └── templates.py            # Inclusive templates CRUD
│   ├── middleware/
│   │   └── auth.py                 # API key + JWT + RBAC auth
│   ├── models/
│   │   └── identity.py             # All SQLAlchemy models
│   ├── nlp/                        # NLP engine
│   │   ├── engine.py               # Main pipeline orchestrator
│   │   ├── pronoun_detector.py     # Pronoun detection
│   │   ├── gendered_language.py    # Gendered language detection
│   │   ├── coreference.py          # Coreference resolution
│   │   ├── suggestion.py           # Tone-aware suggestions
│   │   ├── lexicon.py              # 200+ gendered terms
│   │   └── neo_pronouns.py         # Neo-pronoun registry
│   ├── schemas/                    # Pydantic models
│   │   ├── admin.py                # Admin/analytics schemas
│   │   ├── analysis.py             # Analysis schemas
│   │   ├── custom_pronouns.py      # Custom pronoun schemas
│   │   ├── identity.py             # Identity schemas
│   │   └── templates.py            # Template schemas
│   ├── services/                   # Business logic
│   │   ├── analysis_service.py     # Analysis orchestration
│   │   ├── analytics_service.py    # Metrics aggregation
│   │   ├── auth_service.py         # OAuth/JWT logic
│   │   └── identity_service.py     # Identity CRUD
│   ├── config.py                   # Settings
│   ├── database.py                 # Async SQLAlchemy setup
│   └── main.py                     # FastAPI entry point
├── frontend/                       # React + Vite frontend
│   ├── src/
│   │   ├── components/             # Shared UI components
│   │   ├── contexts/               # React contexts (auth)
│   │   ├── lib/                    # API client, types
│   │   ├── pages/                  # All page components
│   │   ├── App.tsx                 # Root component with routing
│   │   └── main.tsx                # Entry point
│   ├── Dockerfile                  # Frontend container
│   ├── nginx.conf                  # Nginx config for production
│   └── package.json                # Node dependencies
├── alembic/                        # Database migrations
├── scripts/
│   └── seed_lexicon.py             # Lexicon inventory report
├── tests/                          # Test suite (31 tests)
├── .env.example                    # Environment template
├── docker-compose.yml              # Full-stack Docker setup
├── Dockerfile                      # Backend container
└── pyproject.toml                  # Python dependencies
```

---

## License

MIT
