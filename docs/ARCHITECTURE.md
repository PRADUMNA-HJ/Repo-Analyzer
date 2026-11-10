# RepoScope System Architecture Documentation

## 1. Complete System Architecture

RepoScope is engineered as a decoupled, multi-tier enterprise platform separating client presentation, API gateway routing, static code intelligence, relational database persistence, and document compilation.

```mermaid
flowchart TD
    User["Faculty / Evaluator / Student"] -->|Browser HTTPS| Client["React 18 + Vite SPA"]

    subgraph "Frontend Architecture"
        Client --> AuthCtx["Auth Context (JWT / localStorage)"]
        Client --> Pages["Pages: LandingPage, AnalyzerPage, HistoryPage"]
        Pages --> Comp["Components: Matrix, ProfileHeader, Modal, ReviewModal"]
        Pages --> AxiosService["Axios API Client (Token Interceptor, Polling Helper)"]
    end

    AxiosService -->|REST API (HTTPS)| Gateway["FastAPI API Gateway (v1)"]

    subgraph "Backend Infrastructure"
        Gateway --> SecHeaders["Security Headers Middleware (CSP, HSTS)"]
        SecHeaders --> CORS["CORS Middleware"]
        CORS --> Router["API Router (/api/v1)"]

        Router --> AuthRoutes["Auth Endpoints: /register, /login, /me"]
        Router --> AnalysisRoutes["Analysis Endpoints: /analysis, /status, /pdf"]
        Router --> EvalRoutes["Evaluation Archives: /evaluations, /stats, /reviews, /pdf"]
        Router --> HealthRoutes["Health Endpoint: /health"]

        AnalysisRoutes --> AnalysisOrchestrator["AnalysisService Orchestrator"]

        subgraph "GitHub Intelligence Engine"
            AnalysisOrchestrator --> GHClient["GitHubClient (Async HTTPX, Rate Limit Monitor)"]
            AnalysisOrchestrator --> RepoDiscovery["RepositoryDiscoveryService (Fork/Archive/Trivial Filter)"]
            AnalysisOrchestrator --> SourceInspector["SourceInspectionService (Git Tree Scanner)"]
            AnalysisOrchestrator --> TechDetector["TechnologyDetector (Languages & Manifests)"]
            AnalysisOrchestrator --> StaticAnalyzers["AST Analyzers (Python AST, JS/TS, Generic)"]
            AnalysisOrchestrator --> SecretRedactor["Secret Detection & Mandatory Redaction Engine"]
            AnalysisOrchestrator --> ScoringEngine["Deterministic 8-Pillar Scoring Engine"]
            AnalysisOrchestrator --> RankingService["Top 3 Candidate Project Ranker"]
        end

        subgraph "Document & Document Compilation"
            EvalRoutes --> PdfGen["AcademicPdfGenerator (ReportLab Custom Canvas)"]
            AnalysisRoutes --> PdfGen
        end

        subgraph "Relational Persistence Tier (SQLAlchemy 2.0 & Alembic)"
            AuthRoutes --> DBEngine["AsyncSession (SQLAlchemy 2.0)"]
            AnalysisOrchestrator --> DBEngine
            EvalRoutes --> DBEngine
            DBEngine --> PostgresDB[("Managed PostgreSQL Database")]
            AlembicMigrations["Alembic Migrations"] --> PostgresDB
        end
    end
```

---

## 2. Layer Responsibilities

### 2.1 Frontend Presentation Tier (`frontend/src`)
- **Pages:**
  - `LandingPage`: Developer SaaS landing page communicating product vision, 8-pillar rubric, and platform workflow.
  - `AnalyzerPage`: Interactive evaluation workspace with real-time stage progress polling, verified profile header, Top 3 comparative matrix, and 6-tab deep-dive modal.
  - `HistoryPage`: Faculty archive dashboard with live search, target type filters, pagination, summary metrics, and review management.
- **State & Context:** `AuthContext.tsx` manages authenticated JWT tokens, faculty roles, and session persistence in `localStorage`.
- **Validation:** Dual-layer validation; client-side validation using Zod (`analysisSchema.ts`) intercepts malformed inputs prior to network transmission.
- **HTTP Client:** Centralized Axios instance (`services/api.ts`) with request interceptors injecting `Authorization: Bearer <token>`, status polling, and error normalization.

### 2.2 Backend Gateway & Application Core (`backend/app`)
- **API Router (`api/v1`):** RESTful endpoints organized into `auth`, `analysis`, `evaluations`, and `health`.
- **Security Primitives:**
  - `SecurityHeadersMiddleware`: Injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1`, and `Strict-Transport-Security`.
  - Password hashing with salt using `bcrypt`.
  - Signed JSON Web Tokens with HS256 (`PyJWT`).
  - Role-Based Access Control (`require_role`) distinguishing `FACULTY`, `ADMIN`, `REVIEWER`, and `STUDENT`.

### 2.3 GitHub Intelligence & Static Code Analysis Engine
- **GitHub Ingestion:** `GitHubClient` performs non-cloning inspection using the GitHub REST API. Inspects git trees, decodes manifests, reads READMEs, and monitors API quotas.
- **Repository Discovery & Filtering:** `RepositoryDiscoveryService` removes noise (forks, archives, trivial scratchpads) and identifies candidate showcase projects.
- **Static AST Analyzers:** `PythonSourceAnalyzer`, `JavaScriptSourceAnalyzer`, and `GenericSourceAnalyzer` safely compute cyclomatic complexity, typing density, and modular structure without remote code execution.
- **Secret Redaction:** `secret_redactor.py` identifies tokens and replaces raw strings with safe masks (`[REDACTED_SECRET]`).
- **Scoring Engine:** Deterministically computes weighted scores out of 10 across 8 calibrated pillars totaling 100%.

### 2.4 Persistence Layer (SQLAlchemy 2.0 & PostgreSQL)
- **Asynchronous ORM:** `create_async_engine` using `asyncpg` in production and `aiosqlite` in development.
- **Relational Tables:**
  - `users`: Registered faculty, reviewers, and administrators.
  - `evaluations`: Evaluated GitHub targets, composite scores, and methodology versions.
  - `evaluated_projects`: Individual showcase projects, complexity metrics, tech stacks, and findings.
  - `review_notes`: Formal faculty qualitative remarks, accreditation verdicts, and manual score overrides.
  - `audit_records`: Compliance trail tracking report creation, PDF exports, and human reviews.
- **Database Migrations:** Managed via Alembic (`backend/migrations/`) supporting zero-downtime schema evolution.

### 2.5 Academic PDF Dossier Generation Engine
- **ReportLab Generator (`AcademicPdfGenerator`):** Generates publication-grade evaluation dossiers with two-pass page numbering, institutional headers, Executive Scorecard, 8-Pillar Scoring Table, candidate project breakdowns, faculty signature blocks, and SHA-256 digital verification hashes.
