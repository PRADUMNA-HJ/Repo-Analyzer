# RepoScope Multi-Phase Engineering Roadmap

## Phase 1 — Foundation, Premium Frontend & Backend Architecture (COMPLETED)
- [x] Complete monorepo architecture (`frontend/`, `backend/`, `docs/`)
- [x] High-conversion dark SaaS landing page (Hero, Features, How It Works, 8-Pillar Criteria, CTA, Footer)
- [x] Interactive Analyzer workspace with real-time feedback
- [x] GitHub profile and repository URL validation (frontend Zod + backend Pydantic & regex)
- [x] Centralized Axios API service with timeouts and error handling
- [x] FastAPI REST backend (`/`, `/api/v1/health`, `/api/v1/analysis`)
- [x] High-fidelity demonstration data service with clear `DEMO DATA` disclaimers
- [x] 3 fictional student showcase projects with 8-pillar scores, tech stacks, and language distributions
- [x] Detailed project inspection modal
- [x] Responsive layout across desktop, tablet, and mobile
- [x] 18 automated tests passing
- [x] Frontend production build verified (`tsc -b && vite build`)

---

## Phase 2 — GitHub Intelligence Engine & AST Static Analysis (COMPLETED)
- [x] **Asynchronous GitHub Client (`GitHubClient`):**
  - Full REST client with HTTPX.
  - Endpoints: profile discovery, paginated repository list, repo details, languages, git trees, raw contents, commits.
  - Rate-limit tracking (`X-RateLimit-Remaining`, `X-RateLimit-Reset`), backoff retry, and optional `GITHUB_TOKEN` support.
  - Comprehensive exception handling (`GitHubNotFoundError`, `GitHubRateLimitError`, `GitHubAPIError`).
- [x] **Repository Filtering & Top 3 Project Selection:**
  - Forks, archived, empty, and trivial scratchpad repositories filtered out.
  - Objective multi-criteria ranking algorithm prioritizing genuine engineering quality over vanity stars.
- [x] **Static Code Analysis (Zero Remote Code Execution):**
  - Python AST parsing (`ast.parse`) measuring cyclomatic complexity, function/class metrics, type hints, docstrings, and error handling.
  - Detection of dangerous patterns (`eval()`, `exec()`, `shell=True`).
  - Regex AST heuristics for JavaScript/TypeScript (ES6 classes, JSX/TSX components, async/await, DOM risks).
  - Cross-language generic analyzer covering Java, C/C++, Go, and Rust.
  - Secret detection engine identifying AWS keys, GitHub tokens, and connection strings, with **mandatory redaction** (`[REDACTED_SECRET]`).
- [x] **Architecture & Documentation Scanners:**
  - Multi-tier layer detection (presentation, domain, data layers, monorepos).
  - Containerization (`Dockerfile`, `docker-compose.yml`) and CI workflow detection.
  - README structural scoring (problem statement, quickstart setup, architecture overview, API docs).
- [x] **Deterministic 8-Pillar Scoring Engine:**
  - Calibrated percentage weights totaling 100%: Quality 20%, Architecture 15%, Functionality 15%, Tech 10%, Testing 10%, Security 10%, Docs 10%, Activity 10%.
  - Normalized scores scaled 0.0 to 10.0 with explainable qualitative labels.
  - Confidence rating calculation based on inspected file volume and tree depth.
- [x] **Asynchronous Job Lifecycle & Job Store:**
  - Background task execution via FastAPI `BackgroundTasks`.
  - In-memory thread-safe job store with status updates and TTL expiration.
- [x] **Enhanced Frontend Intelligence UI:**
  - Live GitHub vs Demo Mode toggle.
  - Real-time animated stage progress bar reflecting backend job phases.
  - Verified user profile header with avatar, bio, follower counts, and public repo counts.
  - Side-by-side Top 3 Projects Comparative Matrix comparing all 8 criteria.
  - Deep-dive 6-tab modal detailing 20 evaluation dimensions, complexity indicators, redacted security findings, and file evidence references.

---

## Phase 3 — Database, PDF Dossiers, Authentication & Production (COMPLETED)
- [x] **PostgreSQL Integration using SQLAlchemy 2.0 & Alembic:**
  - Production-grade relational schema: `users`, `evaluations`, `evaluated_projects`, `review_notes`, `audit_records`.
  - Fully asynchronous engine (`asyncpg` for PostgreSQL, `aiosqlite` for local dev/testing).
  - Version-controlled Alembic migrations applied via `alembic upgrade head`.
- [x] **Professional Academic PDF Evaluation Dossier Generation (`AcademicPdfGenerator`):**
  - Publication-grade PDF dossier engine built on ReportLab.
  - Features university header, Executive Scorecard, complete 8-Pillar Scoring Table (with weights totaling 100%), Top 3 Candidate Projects deep-dives with complexity tables, Faculty Accreditation signature block, and SHA-256 digital verification checksum.
  - Instant one-click download directly from Analyzer results and the History dashboard (`Content-Disposition: attachment`).
- [x] **Faculty Authentication & Role-Based Access Control (RBAC):**
  - Secure bcrypt password hashing and signed JWT bearer tokens (`PyJWT`).
  - Strict role enforcement (`FACULTY`, `ADMIN`, `REVIEWER`, `STUDENT`).
  - Pre-seeded default faculty demo account: `faculty@university.edu` / `faculty123`.
- [x] **Faculty History Dashboard & Evaluation Archives (`/history`):**
  - Search by candidate target (`octocat`, `user/repo`) or project name.
  - Filter by target type (profile vs repository) and methodology version.
  - High-level academic statistics: Total Evaluations, Average Score, High Confidence Count, Top Evaluated Stack.
  - Interactive Faculty Review Modal allowing qualitative remarks, accreditation verdicts (`APPROVED_EXEMPLARY`, `APPROVED_SATISFACTORY`, `CONDITIONAL_REVISION`, `REJECTED`), and manual score overrides.
- [x] **Evaluation Methodology Versioning & Audit Records:**
  - Tracks methodology version (`v2.1.0`) across all stored evaluations.
  - Audit record logging capturing evaluation creation, report generation, PDF downloads, and human review actions with client IP addresses.
- [x] **Production Security Hardening:**
  - HTTP security headers middleware (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).
  - Render Blueprint (`render.yaml`) for backend web service and Render Managed PostgreSQL.
  - Vercel configuration (`frontend/vercel.json`) with SPA routing and Edge CDN headers.
- [x] **36 Automated Tests Passing (26 Backend + 10 Frontend)**
- [x] **Production Build Cleanly Generated (`tsc -b && vite build`)**

---

## Future Enhancements Beyond Minor Project Scope
1. **GitHub OAuth 2.0 Integration:** Single sign-on with academic GitHub accounts.
2. **Interactive Dependency Graph:** WebGL Canvas visualizer showing file-level import topographies.
3. **Cross-Cohort Similarity Detection:** Comparing AST syntax fingerprints across student submissions to detect uncredited code reuse.
