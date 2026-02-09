# Inklude

AI-powered inclusive language and pronoun intelligence API.

Inklude detects gendered language, identifies pronouns, resolves coreference chains, and flags potential misgendering — all through a simple REST API. It's designed to make correct pronoun use and inclusive language effortless across enterprise communication tools.

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 16+ (or Docker)

### Local Development

```bash
# Create a virtual environment and install dependencies
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

# Download the spaCy language model
python -m spacy download en_core_web_md

# Copy environment config
cp .env.example .env

# Run the API server
uvicorn app.main:app --reload
```

### Docker

```bash
docker compose up --build
```

The API will be available at `http://localhost:8000`.

## API Endpoints

All endpoints except `/health` require an `X-API-Key` header.

### Health

| Method | Path                   | Description              |
|--------|------------------------|--------------------------|
| GET    | `/api/v1/health`       | Liveness probe           |
| GET    | `/api/v1/health/ready` | Readiness (NLP loaded?)  |

### Identity Management

| Method | Path                                    | Description                  |
|--------|-----------------------------------------|------------------------------|
| POST   | `/api/v1/identities/`                   | Create identity profile      |
| GET    | `/api/v1/identities/`                   | List identities (paginated)  |
| GET    | `/api/v1/identities/{id}`               | Get identity by ID           |
| PUT    | `/api/v1/identities/{id}`               | Update identity              |
| DELETE | `/api/v1/identities/{id}`               | Delete identity              |
| GET    | `/api/v1/identities/{id}/pronouns`      | Get pronoun sets             |
| PUT    | `/api/v1/identities/{id}/pronouns`      | Replace pronoun sets         |
| PUT    | `/api/v1/identities/{id}/preferences`   | Update preferences           |

### Text Analysis

| Method | Path                            | Description                                    |
|--------|---------------------------------|------------------------------------------------|
| POST   | `/api/v1/analyze/text`          | Analyze text for gendered language and pronouns |
| POST   | `/api/v1/analyze/batch`         | Analyze multiple texts                         |
| POST   | `/api/v1/analyze/check-pronouns`| Check pronoun usage against known identities   |

## Example Usage

### Analyze Text

```bash
curl -X POST http://localhost:8000/api/v1/analyze/text \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-me-to-a-secure-key" \
  -d '{"text": "The chairman told the fireman to man the fort.", "tone": "gentle"}'
```

### Create an Identity

```bash
curl -X POST http://localhost:8000/api/v1/identities/ \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-me-to-a-secure-key" \
  -d '{
    "email": "alex@example.com",
    "display_name": "Alex Rivera",
    "pronoun_sets": [{"subject": "they", "object": "them", "possessive": "their", "possessive_pronoun": "theirs", "reflexive": "themself"}],
    "preference": {"title": "Mx.", "visibility": "internal"}
  }'
```

## Testing

```bash
pip install -e ".[dev]"
python -m pytest tests/ -v
```

## Project Structure

```
app/
├── api/           # FastAPI route handlers
├── middleware/     # Authentication
├── models/        # SQLAlchemy ORM models
├── nlp/           # NLP engine (pronoun detection, gendered language, coreference)
├── schemas/       # Pydantic request/response schemas
├── services/      # Business logic layer
├── config.py      # Settings
├── database.py    # Async SQLAlchemy setup
└── main.py        # FastAPI application entry point
```

## License

MIT
