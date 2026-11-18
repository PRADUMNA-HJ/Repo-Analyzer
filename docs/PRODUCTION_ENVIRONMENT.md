# RepoScope Production Environment Specification

This document details the production environment architecture, configuration parameters, secrets management, security controls, and resource sizing for the **RepoScope — GitHub Project Intelligence & Evaluation Platform**.

---

## 1. System Architecture

```
                          ┌────────────────────────┐
                          │     Client Browser     │
                          └───────────┬────────────┘
                                      │
                        HTTPS (TLS 1.3) / Port 443
                                      │
                                      ▼
                        ┌────────────────────────┐
                        │    Vercel Edge CDN     │
                        │   React 18 + Vite SPA  │
                        │ (reposcope.vercel.app) │
                        └───────────┬────────────┘
                                      │
                        REST API / JWT Authorization
                                      │
                                      ▼
                        ┌────────────────────────┐
                        │   Render Web Service   │
                        │ FastAPI (Python 3.12)  │
                        │    Uvicorn 2 Workers   │
                        └───────────┬────────────┘
                                    │
                    PostgreSQL Connection Pool (asyncpg)
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │ Render Managed Postgres│
                        │    PostgreSQL 16       │
                        │  Alembic Idempotent DDL│
                        └────────────────────────┘
```

---

## 2. Environment Variables Matrix

### 2.1 Backend Service (`reposcope-api` on Render)

| Variable Name | Type | Required | Default / Example | Security Classification | Purpose & Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `APP_ENV` | `string` | **Yes** | `production` | Public Configuration | Sets runtime mode. Disables dev routes, enforces strict security headers, and enables HSTS. |
| `DEMO_MODE` | `boolean` | **Yes** | `false` | Public Configuration | When `false`, executes live GitHub API queries and real static AST code analysis. |
| `DATABASE_URL` | `string` | **Yes** | *(Render Managed DB)* | **Critical Secret** | PostgreSQL connection URL. Automatically supplied by Render Blueprint from `reposcope-db`. |
| `JWT_SECRET_KEY` | `string` | **Yes** | *(Auto-generated 64+ char)* | **Critical Secret** | Cryptographic secret for signing HMAC-SHA256 JWT access tokens for faculty authentication. |
| `JWT_ALGORITHM` | `string` | No | `HS256` | Configuration | Hashing algorithm for faculty authentication tokens. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `integer` | No | `1440` | Configuration | Token validity duration in minutes (1440 = 24 hours). |
| `ADMIN_BOOTSTRAP_EMAIL` | `string` | No | `faculty@university.edu` | Sensitive | Initial faculty evaluator administrator email address for university accreditation. |
| `ADMIN_BOOTSTRAP_PASSWORD` | `string` | **Yes (Prod)** | *(Auto-generated on Render)* | **Critical Secret** | Initial password for the bootstrap evaluator. Render generates a high-entropy string on deployment. |
| `FRONTEND_ORIGIN` | `string` | **Yes** | `https://reposcope.vercel.app` | Configuration | Primary frontend client URL permitted by CORS policy. |
| `ALLOWED_ORIGINS` | `string` | **Yes** | `https://reposcope.vercel.app` | Configuration | Comma-separated list of permitted CORS client origins. Wildcard `*` is strictly disallowed with credentials. |
| `GITHUB_TOKEN` | `string` | Recommended | `ghp_...` | **Secret** | GitHub Personal Access Token (PAT). Increases rate limit from 60 req/hr to 5,000 req/hr. |
| `GEMINI_API_KEY` | `string` | Optional | `AIza...` | **Secret** | Google Gemini API key for supplementary qualitative evaluation summaries. |
| `METHODOLOGY_VERSION` | `string` | No | `2.1.0` | Configuration | Semantic version of the 8-pillar academic scoring rubric. |
| `PYTHON_VERSION` | `string` | No | `3.12.7` | Runtime Configuration | Python interpreter version pinned in Render environment. |
| `PORT` | `integer` | Set by Render | `10000` | Platform | Port number bound by Uvicorn server in production container. |

### 2.2 Frontend Application (`reposcope-web` on Vercel)

| Variable Name | Type | Required | Example | Security Classification | Purpose & Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `string` | **Yes** | `https://reposcope-api.onrender.com` | Public Configuration | Public base URL of the FastAPI backend on Render. Trailing slashes are automatically sanitized. |

---

## 3. Database & Migration Architecture

### 3.1 PostgreSQL Engine
- **Engine:** Managed PostgreSQL 16 on Render (`reposcope-db`)
- **Driver:** Asynchronous `asyncpg` via SQLAlchemy 2.0 (`postgresql+asyncpg://...`)
- **SSL Configuration:** SSL mode (`ssl=require`) is enforced for all database connections. The connection URL automatically normalizes Render's `postgres://` and `sslmode=require` query parameters into asyncpg-compatible formats.

### 3.2 Connection Pooling
- **Pool Size:** `10` persistent connections.
- **Max Overflow:** `20` burst connections.
- **Recycle Timeout:** `300` seconds (5 minutes) to prevent stale connections across cloud NAT boundaries.
- **Pool Pre-Ping:** `True` (verifies connection liveness before dispatching transactions).

### 3.3 Database Migrations (Alembic)
- Migration revision `83fb8acd81bc_initial_phase3_schema.py` provides idempotent DDL definitions using SQLAlchemy schema reflection (`sa.inspect`).
- Tables managed:
  1. `users`: Faculty, reviewer, and administrator credentials with bcrypt hashing and RBAC.
  2. `evaluations`: Comprehensive evaluation runs, target GitHub identifiers, metadata, and 8-pillar scores.
  3. `evaluated_projects`: Individual repository inspection details, AST metrics, dependencies, and evidence files.
  4. `review_notes`: Faculty qualitative commentary, accreditation verdicts, and grade overrides.
  5. `audit_records`: Tamper-evident evaluation history, auth events, IP addresses, and timestamps.
- **Execution Command:** Executed automatically during Render build phase via `alembic upgrade head`.

---

## 4. Multi-Worker & Async Job Synchronization

When Uvicorn runs with multiple workers (`--workers 2` on Render):
- In-flight evaluation jobs are dispatched via FastAPI `BackgroundTasks`.
- Completed evaluations are immediately committed to PostgreSQL via `EvaluationPersistenceService`.
- Subsequent status checks (`/api/v1/analysis/{id}/status`) and report fetches (`/api/v1/analysis/{id}`) fall back to PostgreSQL if the in-memory cache belongs to a different worker process. This guarantees zero 404 errors during multi-worker operation or container restarts.

---

## 5. Security & Hardening Controls

1. **Zero Untrusted Execution (RCE Prevention):** RepoScope never executes, runs, or imports target source code. All code evaluation is performed strictly through:
   - Python Standard Library `ast.parse()`
   - Abstract syntax tree node visitors (inspecting classes, methods, docstrings, decorators)
   - Static regex pattern matching for secrets, vulnerabilities, and technology fingerprints
2. **CORS Hardening:** `setup_cors()` rejects wildcard `*` when credentials are enabled and sanitizes trailing slashes on all allowed origins.
3. **HTTP Security Headers:**
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (in production)
4. **Credential Seeding Protection:** The development endpoint `/api/v1/auth/seed-default-faculty` returns `HTTP 403 Forbidden` whenever `APP_ENV=production`. In production, admin credentials must be provisioned via `ADMIN_BOOTSTRAP_PASSWORD`.
5. **Secret Redaction:** Static code analysis redacts high-entropy API tokens, private keys, and passwords before storing evidence files or generating PDF dossiers.
