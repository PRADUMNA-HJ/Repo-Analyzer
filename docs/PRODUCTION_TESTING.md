# RepoScope Production Verification & Testing Protocol

This document outlines the testing methodology, automated test suites, end-to-end verification workflows, and production validation procedures for the **RepoScope** platform.

---

## 1. Test Suite Architecture & Summary

The RepoScope testing matrix covers both backend API services and frontend React components:

| Layer | Framework / Runner | Total Tests | Status | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | Pytest 9.2 + AnyIO + Pytest-Asyncio | **26** | **26 / 26 Passing (100%)** | URL validation, GitHub API mocking, AST inspection, scoring rubric, auth/RBAC, PostgreSQL persistence, async jobs, PDF generation |
| **Frontend UI** | Vitest 2.1 + Testing Library + JSDOM | **10** | **10 / 10 Passing (100%)** | Navigation, landing page CTA, URL analyzer form, async polling progress, project details modal, comparison table, 8-pillar rubric visualizer |
| **Database DDL** | Alembic 1.14 + SQLAlchemy 2.0 | **Idempotent** | **Verified** | PostgreSQL table creation, indexes, foreign keys, cascade deletes, schema reflection |
| **TypeScript Build** | Vite 6 + TypeScript 5.6 (`tsc -b`) | **Clean** | **0 Errors** | Static type checking, strict null checks, production minification |

---

## 2. Automated Test Execution

### 2.1 Backend Pytest Execution
To execute all backend unit, integration, and security tests:
```powershell
# From backend directory with active virtual environment:
cd backend
.\.venv\Scripts\pytest.exe -c pytest.ini tests -v
```

**Verified Test Modules:**
1. `backend/tests/test_analysis.py`: Valid profile URLs, repository URLs, git suffixes, invalid domains, empty URLs, malformed URLs, reserved paths.
2. `backend/tests/test_auth.py`: Registration, login, JWT token issuance, password verification, RBAC admin access.
3. `backend/tests/test_discovery.py`: Repository filtering (forks, archived, empty repositories) and preservation of zero-star quality projects.
4. `backend/tests/test_evaluations_api.py`: Evaluation persistence, pagination, search, PDF generation, faculty review notes, audit logging.
5. `backend/tests/test_github_client.py`: User retrieval, repo fetching, 404 not found, 403 rate limit handling, 401 unauthorized handling, network timeouts.
6. `backend/tests/test_health.py`: Root metadata endpoint, database ping, health status reporting.
7. `backend/tests/test_jobs_api.py`: Asynchronous job creation, lifecycle transitions, progress polling, 404 error handling.
8. `backend/tests/test_scoring.py`: 8-pillar deterministic scoring rubric, weight normalization, tie-breaking algorithms.
9. `backend/tests/test_static_analysis.py`: Python AST visitor (cyclomatic complexity, docstrings, typing), JavaScript regex security inspection, Java structural parsing.

### 2.2 Frontend Vitest Execution
To execute all frontend component and visualizer tests:
```powershell
# From frontend directory:
cd frontend
npx vitest run
```

**Verified Test Suites:**
1. `App.test.tsx`: Route rendering (`/`, `/analyze`, `/history`), navigation transitions.
2. `Navbar.test.tsx`: Navigation bar links, active state indicators, faculty auth modal toggle.
3. `Analyzer.test.tsx`: Input form submission, URL validation, live stage progress indicators, executive overview banner, project comparison table, 6-tab inspection modal.

### 2.3 TypeScript Production Build Verification
To ensure zero type errors or bundle issues:
```powershell
cd frontend
npm run build
```
Produces an optimized static bundle in `frontend/dist/` ready for Vercel Edge deployment.

---

## 3. End-to-End Live Production Verification Scenarios

### Scenario 1: Health Check & Database Ping
- **Target Endpoint:** `GET /api/v1/health`
- **Expected Status:** `HTTP 200 OK`
- **Verification Criteria:**
  ```json
  {
    "status": "healthy",
    "application": "RepoScope API",
    "version": "3.0.0",
    "environment": "production",
    "database": "connected",
    "database_type": "postgresql"
  }
  ```

### Scenario 2: Public GitHub Profile Evaluation
1. Navigate to `https://reposcope.vercel.app/analyze`.
2. Input target URL: `https://github.com/octocat`.
3. Submit analysis.
4. Observe real-time progress bar transitioning through stages:
   - `INITIALIZING` → `FETCHING_REPOSITORIES` → `FILTERING_REPOSITORIES` → `INSPECTING_SOURCE` → `ANALYZING_CODE` → `EVALUATING_PROJECTS` → `RANKING_PROJECTS` → `GENERATING_REPORT` → `COMPLETED`.
5. Verify candidate projects are ranked 1 to 3 with deterministic scores out of 10.0.

### Scenario 3: Single Repository Static Code Inspection
1. Input target URL: `https://github.com/octocat/Spoon-Knife`.
2. Submit analysis.
3. Open the project detail modal. Verify all 6 tabs load:
   - **Executive Summary:** Problem solved, architecture notes, confidence score.
   - **Technology Stack:** Primary language, detected frameworks, categorized badges.
   - **8-Pillar Scoring:** Radar visualization and criteria breakdown cards.
   - **Strengths & Improvements:** Evidence-based engineering commendations and actionable guidance.
   - **Complexity & Metrics:** AST cyclomatic score, lines of code, test coverage ratio.
   - **Security Audit:** Vulnerability scan findings, secret redaction checks.

### Scenario 4: Academic PDF Dossier Generation
1. In the completed evaluation view, click **Download Academic PDF Dossier**.
2. Verify browser initiates a download for `RepoScope-Dossier-<id>.pdf`.
3. Open the PDF and verify:
   - Formal institutional header with university and department credentials.
   - Candidate portfolio summary with overall calculated score.
   - Detailed project-by-project breakdowns with 8-pillar evaluations.
   - Tamper-evident evaluation hash and timestamp audit seal.

### Scenario 5: Faculty Authentication & Review Workflow
1. Click **Faculty Portal** in the navigation bar.
2. Sign in with faculty credentials.
3. Access `/history` page.
4. Verify paginated table of previous student repository evaluations.
5. Search by target username or project name.
6. Open an evaluation record, add an accreditation verdict (e.g. "Distinction") and faculty comments.
7. Verify note is persisted in PostgreSQL and timestamped with the faculty member's identity.

---

## 4. Mobile & Responsive Viewport Verification

The UI was verified against standard device breakpoints:
- **Mobile (375px & 414px):** Navigation collapses to accessible mobile menu; comparison table scrolls horizontally with sticky rank headers; radar charts scale to 100% viewport width.
- **Tablet (768px):** 2-column grid layout for metric badges; modal window fits within comfortable margins with native touch-scroll.
- **Desktop (1280px+):** Full 3-card showcase layout, interactive radar visualizer, split-screen code evidence drawers.
