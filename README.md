# RepoScope — GitHub Project Intelligence & Evaluation Platform

> **Understand the code. Evaluate the engineering. Discover the best projects.**

RepoScope is an automated GitHub repository intelligence and project evaluation platform designed for academic evaluators, computer science faculty, technical reviewers, and engineering hiring panels. It inspects public GitHub profiles and individual repositories, extracts core software artifacts, analyzes source code architecture via static AST inspection, persists evaluation records to PostgreSQL, generates official academic PDF evaluation dossiers, and provides role-based faculty review workflows.

---

## 1. Problem Statement & Motivation

In collegiate Computer Science programs and technical assessments, evaluators frequently review dozens of student GitHub profiles. Traditional reviews suffer from key challenges:
- **Superficial Vanity Metrics:** Star counts, commit graphs, and repo counts often reflect trivial forks, empty repos, or copy-pasted tutorial assignments rather than authentic engineering capability.
- **Time-Consuming Manual Code Inspection:** Reviewing directory trees, commit histories, manifest dependencies, test coverage, and code styling across multiple repositories for each student is tedious, inconsistent, and error-prone.
- **Subjective Grading & Lack of Records:** Different faculty members evaluate code using disparate standards, without centralized archives, standardized rubrics, or official verification dossiers.

**RepoScope** solves this problem by automating repository discovery, filtering out irrelevant noise (forks, archives, trivial scratchpads), selecting a developer's strongest software projects, grading them against a deterministic 8-pillar rubric (100% total weight), archiving evaluations in PostgreSQL, and producing university-ready PDF dossiers.

---

## 2. Core Capabilities Across All 3 Phases

### Phase 1 — Foundation & Modern SaaS Interface
- **Dark Developer Visual Design System:** Built with Tailwind CSS, custom dark palette (`#0B0F19`, `#0F172A`), purple/blue ambient glows, and responsive components.
- **Landing Page Suite:** Hero with simulated live evaluation dashboard, Planned Features grid, 3-step interactive timeline, 8-pillar rubric visualizer, and FAQ disclosures.
- **Instant Client-Side URL Validation:** Powered by Zod schemas validating GitHub profile and repository patterns before network dispatch.
- **Offline High-Fidelity Demo Mode:** Transparent demonstration dataset with clear visual disclaimers for testing and demonstrations.

### Phase 2 — GitHub Intelligence & AST Static Analysis
- **Live GitHub API Ingestion:** Asynchronous HTTPX client with automated pagination, git tree scanning, rate limit tracking (`X-RateLimit-Remaining`), exponential backoff, and optional `GITHUB_TOKEN` support (5,000 req/hr).
- **Intelligent Filtering & Top 3 Ranking:** Automatically filters out forks, archives, empty repos, and trivial single-file scratchpads. Ranks original candidate projects using multi-pillar quality metrics (not stars).
- **Static AST Code Analysis (Zero Remote Code Execution):**
  - Python AST parsing (`ast.parse`) measuring cyclomatic complexity, function metrics, type annotation coverage, docstring density, and error handling.
  - Regex AST heuristics for JavaScript/TypeScript (ES6 classes, JSX/TSX components, async/await, DOM injection risks).
  - Cross-language structural analyzer for Java, C/C++, Go, and Rust.
  - Comprehensive secret detection engine identifying AWS keys, GitHub tokens, and connection strings with **mandatory redaction** (`[REDACTED_SECRET]`).
- **Asynchronous Background Processing & Polling:** Job lifecycle with real-time stage tracking (`INITIALIZING` → `FETCHING_REPOSITORIES` → `FILTERING_REPOSITORIES` → `INSPECTING_SOURCE` → `ANALYZING_CODE` → `EVALUATING_PROJECTS` → `RANKING_PROJECTS` → `GENERATING_REPORT` → `COMPLETED`).
- **Deep-Dive 6-Tab Project Modal:** Overview, 8 Pillars Breakdown, Architecture & Tech Stack, Code Metrics, Security & Findings, and Inspected File Evidence.

### Phase 3 — Database, PDF Dossiers, Authentication & Production
- **PostgreSQL Integration with SQLAlchemy 2.0 & Alembic:**
  - Production-grade relational schema: `users`, `evaluations`, `evaluated_projects`, `review_notes`, `audit_records`.
  - Asynchronous database engine (`asyncpg` for PostgreSQL, `aiosqlite` for local dev/testing).
  - Version-controlled Alembic migrations (`alembic upgrade head`).
- **Academic PDF Evaluation Dossier Generation (ReportLab):**
  - Official, publication-quality, university-ready evaluation dossier PDF.
  - Institutional header, Executive Scorecard, 8-Pillar Scoring Table (with weights totaling 100%), Top 3 Projects deep-dives with complexity tables, Faculty Accreditation signature block, and SHA-256 integrity verification checksum.
  - Instant one-click download from both the Analyzer results and the History dashboard.
- **Faculty Authentication & Role-Based Access Control (RBAC):**
  - Secure bcrypt password hashing and signed JWT bearer tokens (`PyJWT`).
  - Strict role enforcement (`FACULTY`, `ADMIN`, `REVIEWER`, `STUDENT`).
  - Pre-seeded default faculty demo account: `faculty@university.edu` / `faculty123`.
- **Faculty History Dashboard & Search Archive:**
  - Dedicated `/history` route with real-time search (by candidate or project name), target type filters, and pagination.
  - High-level academic analytics: Total Evaluations, Average Score, High Confidence Count, Top Evaluated Tech Stack.
  - Interactive Faculty Review Modal enabling qualitative feedback, accreditation verdicts, and manual score overrides.
- **Evaluation Methodology Versioning & Audit Records:**
  - Tracks methodology version (`v2.1.0`) across all stored evaluations.
  - Tamper-evident audit trail capturing report generation, PDF downloads, and human review actions with client IP addresses.
- **Production Hardening & Deployment Targets:**
  - HTTP security headers middleware (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).
  - Render Blueprint (`render.yaml`) for backend web service and Render Managed PostgreSQL.
  - Vercel configuration (`frontend/vercel.json`) with SPA routing and Edge CDN headers.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript (Strict Mode)
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS with custom dark SaaS palette
- **Routing:** React Router v6
- **State & Form Management:** React Hook Form + Zod
- **Authentication Context:** Custom React Context with JWT bearer token management
- **Icons:** Lucide React
- **HTTP Client:** Axios with centralized interceptors, token injection, and polling helpers
- **Animations:** Framer Motion
- **Testing:** Vitest, React Testing Library, `@testing-library/jest-dom`, jsdom

### Backend
- **Framework:** Python 3.12+ / 3.14 compatible, FastAPI, Uvicorn
- **ORM & Database:** SQLAlchemy 2.0 (AsyncIO), Alembic migrations, PostgreSQL (`asyncpg`), SQLite fallback (`aiosqlite`)
- **PDF Generation Engine:** ReportLab with custom canvas and two-pass page numbering
- **Authentication:** `bcrypt` password hashing, `PyJWT` signed JSON Web Tokens
- **Static AST Analyzers:** Python AST (`ast`), regex pattern extractors, secret detectors
- **HTTP Client:** HTTPX (asynchronous requests with timeouts and GitHub API rate-limit tracking)
- **Data Validation & Schemas:** Pydantic v2, Pydantic-Settings
- **Testing:** Pytest, Pytest-Asyncio

---

## 4. Deterministic 8-Pillar Scoring Rubric

Scores are computed out of 10.0 using strict percentage weights totaling 100%:

| Pillar ID | Dimension Name | Calibrated Weight | Core Focus |
| :--- | :--- | :---: | :--- |
| `code-quality` | **Code Quality & Maintainability** | **20%** | Cyclomatic complexity, typing density, docstring coverage, modular separation |
| `architecture` | **Architecture & Design** | **15%** | Layered separation (MVC, domain layers), full-stack monorepo, Docker, CI automation |
| `functionality` | **Functionality & Engineering Depth** | **15%** | Business logic depth, API design, data processing, routing complexity |
| `tech-stack` | **Technology Stack & Modern Practices** | **10%** | Modern frameworks, package manager hygiene, ecosystem fit |
| `testing` | **Testing & Quality Assurance** | **10%** | Automated test presence (pytest, jest, vitest), test coverage, CI testing |
| `security` | **Security & Best Practices** | **10%** | Zero hardcoded secrets, input sanitization, safe subprocessing |
| `documentation` | **Documentation & Presentation** | **10%** | README structure (problem statement, quickstart setup, architecture, API specs) |
| `activity` | **Project Activity & Longevity** | **10%** | Commit cadence, branch hygiene, release tags, maintenance longevity |

$$\text{Overall Score} = \sum_{i=1}^{8} \left( \text{Score}_i \times \frac{\text{Weight}_i}{100} \right)$$

---

## 5. Quick Start & Local Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+ (or 3.14)
- (Optional) GitHub Personal Access Token (PAT) for 5,000 req/hr rate limits

### Backend Setup
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment and activate
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env

# 5. Apply database migrations
alembic upgrade head

# 6. Run test suite
pytest -c pytest.ini tests -v

# 7. Start backend development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend URLs:
- Root API: `http://localhost:8000/`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/v1/health`

### Frontend Setup
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Configure environment
cp .env.example .env

# 4. Run frontend tests
npm run test

# 5. Build for production
npm run build

# 6. Start development server
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 6. Testing & Quality Assurance

Both test suites execute independently with 100% green status:
- **Backend (Pytest):** **26 tests** covering API routes, authentication flow, RBAC permissions, evaluation persistence, PDF generation, audit logs, GitHub rate-limit handling, repo filtering, AST static analysis, and scoring engine tie-breakers.
- **Frontend (Vitest):** **10 tests** covering landing page hero, navigation, Zod validation, API submission, asynchronous job polling, detailed modal tabs, and error alerts.
- **Total Automated Tests:** **36 passing tests**.

```bash
# Run backend tests
cd backend && pytest -c pytest.ini tests -v

# Run frontend tests
cd frontend && npm run test
```

---

## 7. Documentation Index

- [Production Deployment Guide](docs/DEPLOYMENT.md)
- [REST API Documentation (v1)](docs/API_DOCUMENTATION.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [GitHub API Ingestion & Rate Limits](docs/GITHUB_INTEGRATION.md)
- [Static Code Analysis Engine](docs/ANALYSIS_ENGINE.md)
- [8-Pillar Scoring Methodology](docs/SCORING_METHODOLOGY.md)
- [Security & Remote Execution Policy](docs/SECURITY.md)
- [Multi-Phase Engineering Roadmap](docs/PHASE_ROADMAP.md)

---

## 8. Academic Project Disclosure

This software product was developed as a Computer Science Engineering minor project. It is engineered to enterprise-level standards with zero external code execution risks, deterministic scoring transparency, PostgreSQL relational persistence, professional academic PDF generation, and scalable architecture.
