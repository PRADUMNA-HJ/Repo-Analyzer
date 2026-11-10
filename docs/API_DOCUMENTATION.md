# RepoScope REST API Documentation (v1)

Base URL: `http://localhost:8000/api/v1` (Production: `https://reposcope-api.onrender.com/api/v1`)  
Interactive OpenAPI / Swagger Docs: `http://localhost:8000/docs`  
ReDoc: `http://localhost:8000/redoc`

---

## 1. System Endpoints

### `GET /`
Returns service status, environment, version, methodology version, and API documentation links.

#### Response `200 OK`
```json
{
  "product": "RepoScope — GitHub Project Intelligence & Evaluation Platform",
  "version": "3.0.0",
  "environment": "development",
  "methodology_version": "2.1.0",
  "status": "operational",
  "documentation": "/docs",
  "api_v1": {
    "health": "/api/v1/health",
    "auth": "/api/v1/auth",
    "analysis": "/api/v1/analysis",
    "evaluations": "/api/v1/evaluations"
  }
}
```

---

### `GET /api/v1/health`
Verifies backend connectivity, configuration status, demo mode flag, and GitHub token configuration.

#### Response `200 OK`
```json
{
  "status": "healthy",
  "application": "RepoScope API",
  "version": "3.0.0",
  "environment": "development",
  "demo_mode": false,
  "github_auth_configured": true
}
```

---

## 2. Authentication & RBAC Endpoints

### `POST /api/v1/auth/register`
Registers a new faculty member, reviewer, or administrator account.

#### Request Body
```json
{
  "email": "faculty@university.edu",
  "password": "StrongPassword123",
  "full_name": "Dr. Alistair Vance, Ph.D.",
  "department": "Department of Computer Science & Engineering",
  "role": "FACULTY"
}
```

#### Response `201 Created`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user": {
    "id": "e8a931bf-1049-43c2-b778-95ef92b0a340",
    "email": "faculty@university.edu",
    "full_name": "Dr. Alistair Vance, Ph.D.",
    "department": "Department of Computer Science & Engineering",
    "role": "FACULTY",
    "is_active": true,
    "created_at": "2026-11-10T12:00:00Z"
  }
}
```

---

### `POST /api/v1/auth/login`
Authenticates user credentials and issues a signed JWT access token.

#### Request Body
```json
{
  "email": "faculty@university.edu",
  "password": "StrongPassword123"
}
```

#### Response `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user": {
    "id": "e8a931bf-1049-43c2-b778-95ef92b0a340",
    "email": "faculty@university.edu",
    "full_name": "Dr. Alistair Vance, Ph.D.",
    "department": "Department of Computer Science & Engineering",
    "role": "FACULTY",
    "is_active": true,
    "created_at": "2026-11-10T12:00:00Z"
  }
}
```

---

### `GET /api/v1/auth/me`
Retrieves the profile of the authenticated user. Requires Bearer Token.

#### Request Headers
```http
Authorization: Bearer <token>
```

#### Response `200 OK`
Returns the `UserResponse` object.

---

### `GET /api/v1/auth/users`
Lists all registered users. Restricted to `ADMIN` role.

---

## 3. Analysis & Evaluation Ingestion Endpoints

### `POST /api/v1/analysis`
Submits a public GitHub profile URL (e.g. `https://github.com/username`) or repository URL (e.g. `https://github.com/username/repository`) for intelligence analysis.

#### Query Parameters
- `sync` (boolean, optional, default: `false`): When `false`, returns `200 OK` with an `analysis_id` and runs the analysis asynchronously in the background. When `true`, waits for synchronous execution.

#### Request Body
```json
{
  "github_url": "https://github.com/octocat",
  "demo_mode": false
}
```

#### Response `200 OK` (Asynchronous Mode)
Returns initial `AnalysisResponse` containing `analysis_id` and status `INITIALIZING`.

---

### `GET /api/v1/analysis/{analysis_id}/status`
Polls the execution stage and progress percent of an asynchronous analysis job.

Stage sequence:
`INITIALIZING` (10%) → `FETCHING_REPOSITORIES` (20%) → `FILTERING_REPOSITORIES` (35%) → `INSPECTING_SOURCE` (50%) → `ANALYZING_CODE` (65%) → `EVALUATING_PROJECTS` (80%) → `RANKING_PROJECTS` (90%) → `GENERATING_REPORT` (95%) → `COMPLETED` (100%).

---

### `GET /api/v1/analysis/{analysis_id}`
Retrieves the complete `AnalysisResponse` once processing is complete.

---

### `GET /api/v1/analysis/{analysis_id}/pdf`
Directly generates and downloads the official academic evaluation dossier as a PDF for a completed analysis run.

---

## 4. Evaluation History & Dossier Endpoints

### `GET /api/v1/evaluations`
Retrieves paginated evaluation history with filtering and search.

#### Query Parameters
- `q`: Search target identifier or project name.
- `target_type`: Filter by `profile` or `repository`.
- `methodology_version`: Filter by methodology version (`2.1.0`).
- `min_score`, `max_score`: Filter by overall score range.
- `page`: Page number (default: 1).
- `page_size`: Results per page (default: 15).

#### Response `200 OK`
```json
{
  "items": [
    {
      "id": "e8a931bf-1049-43c2-b778-95ef92b0a340",
      "target_type": "profile",
      "target_identifier": "octocat",
      "is_demo": false,
      "methodology_version": "2.1.0",
      "total_repositories_found": 8,
      "overall_score": 8.5,
      "evaluation_date": "2026-11-10T12:00:00Z",
      "created_by_name": "Dr. Alistair Vance, Ph.D.",
      "top_projects": [
        {
          "id": "p1",
          "name": "git-consortium",
          "display_name": "Git Consortium",
          "rank": 1,
          "overall_score": 8.7,
          "primary_language": "Python",
          "confidence_label": "High"
        }
      ],
      "review_count": 1,
      "latest_verdict": "APPROVED_EXEMPLARY"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 15,
  "total_pages": 1
}
```

---

### `GET /api/v1/evaluations/stats/summary`
Returns aggregate statistics across all archived evaluations: total evaluations, average score, high confidence count, top languages, and review count.

---

### `GET /api/v1/evaluations/{id}`
Returns full evaluation details, including all projects, criteria breakdowns, security findings, and faculty review notes.

---

### `GET /api/v1/evaluations/{id}/pdf`
Generates and downloads the official academic evaluation dossier as a PDF (`Content-Disposition: attachment; filename="RepoScope-Dossier-{target}.pdf"`).

---

### `POST /api/v1/evaluations/{id}/reviews`
Submits a faculty human review note, accreditation verdict, and optional manual score override. Requires `FACULTY` or `ADMIN` role.

#### Request Headers
```http
Authorization: Bearer <token>
```

#### Request Body
```json
{
  "overall_comment": "Exemplary student portfolio adhering to clean software modularity and comprehensive test suite.",
  "accreditation_verdict": "APPROVED_EXEMPLARY",
  "manual_score_override": 9.0
}
```

---

### `GET /api/v1/evaluations/audit/records`
Retrieves audit records capturing report generation, PDF downloads, and human review actions with client IP addresses. Requires `FACULTY` or `ADMIN` role.
