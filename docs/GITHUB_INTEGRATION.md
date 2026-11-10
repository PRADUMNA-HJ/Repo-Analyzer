# GitHub Integration & Ingestion Architecture

This document outlines the technical design, protocols, and resilience mechanisms implemented in RepoScope's GitHub integration layer (`app.services.github_client.GitHubClient`).

---

## 1. Design Principles

1. **Pure Static Inspection:** RepoScope never clones full repositories with `git clone` or downloads untrusted zipballs directly onto the host execution filesystem. All operations utilize the official GitHub REST API over TLS.
2. **Asynchronous I/O:** Built entirely on Python's `httpx.AsyncClient` with pooled HTTP connections and configurable timeouts.
3. **Resilience & Rate-Limit Awareness:** Proactively reads rate limit headers, implements backoff and jitter, and handles API quotas gracefully.
4. **Security by Default:** Zero raw secret storage. When `GITHUB_TOKEN` is present, it is securely injected as an Authorization header on the backend and is never returned to the client browser.

---

## 2. API Endpoints Utilized

| Endpoint | Purpose | Method | Notes |
| :--- | :--- | :--- | :--- |
| `/users/{username}` | Profile metadata discovery | `GET` | Verifies existence, avatar, bio, follower count, and public repo count |
| `/users/{username}/repos` | Repository portfolio retrieval | `GET` | Automatically paginated (`per_page=100`, `sort=updated`) |
| `/repos/{owner}/{repo}` | Individual repository metadata | `GET` | Fallback branch, stars, forks, default branch, language |
| `/repos/{owner}/{repo}/languages` | Language byte breakdown | `GET` | Accurate byte-count ratios across all languages |
| `/repos/{owner}/{repo}/git/trees/{branch}?recursive=1` | Recursive tree scan | `GET` | Inspects directory architecture without downloading full repo |
| `/repos/{owner}/{repo}/contents/{path}` | Targeted file content retrieval | `GET` | Retrieves manifests, entrypoints, and test files with base64 decoding |
| `/repos/{owner}/{repo}/readme` | README documentation | `GET` | Decodes project documentation for structural scoring |
| `/repos/{owner}/{repo}/commits` | Recent commit history | `GET` | Evaluates commit cadence, message quality, and activity longevity |

---

## 3. Rate Limit Management & Token Pooling

GitHub applies strict rate limiting:
- **Unauthenticated Requests:** 60 requests per hour per IP.
- **Authenticated Requests (with `GITHUB_TOKEN`):** 5,000 requests per hour.

### Tracking Mechanism
On every API response, `GitHubClient` extracts:
- `X-RateLimit-Limit`: Maximum requests permitted per window.
- `X-RateLimit-Remaining`: Remaining requests.
- `X-RateLimit-Reset`: Unix timestamp when quota resets.

```python
self.rate_limit_remaining = int(resp.headers.get("X-RateLimit-Remaining", 60))
self.rate_limit_reset = int(resp.headers.get("X-RateLimit-Reset", 0))
```

If `rate_limit_remaining < 5`, requests are proactively throttled, and if 0, a clean `GitHubRateLimitError` is raised with the exact UTC reset timestamp, informing the evaluator without crashing the application.

---

## 4. Tree Inspection & Filtering Strategy

Rather than downloading hundreds of megabytes of binary assets or third-party packages, `GitHubClient` queries the Git Tree API:

```
GET /repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1
```

The resulting file tree is filtered to discard noise:
- Excludes `.git`, `node_modules`, `venv`, `.venv`, `__pycache__`, `dist`, `build`, `.next`.
- Excludes lockfiles: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`.
- Excludes media & binary assets (`.png`, `.jpg`, `.mp4`, `.zip`, `.pdf`, `.exe`, `.pyc`).
- Preserves configuration files, manifests (`package.json`, `requirements.txt`, `pyproject.toml`, `Dockerfile`), test suites, and core source files.

Only high-priority files (manifests, main entrypoints, routes, models, tests) are retrieved via `/contents/{path}`, bounded by a strict size limit (`MAX_FILE_BYTES = 50,000 bytes`).

---

## 5. Error Classification & Handling

| GitHub HTTP Status | RepoScope Exception | Evaluator Feedback |
| :--- | :--- | :--- |
| `404 Not Found` | `GitHubNotFoundError` | Clear notice: "GitHub profile/repository does not exist or is private." |
| `403 / 429` (Rate limit) | `GitHubRateLimitError` | "GitHub rate limit exceeded. Please configure GITHUB_TOKEN or wait until reset at [Time]." |
| `401 Unauthorized` | `GitHubAPIError` | "Invalid GITHUB_TOKEN configured in backend." |
| `Timeout / Connection` | `GitHubAPIError` | "Network timeout connecting to api.github.com. Please retry." |

