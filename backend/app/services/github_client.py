import base64
import logging
import time
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("reposcope.github")


class GitHubAPIError(Exception):
    """Base exception for GitHub API failures."""
    def __init__(self, message: str, status_code: Optional[int] = None, hint: Optional[str] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.hint = hint


class GitHubNotFoundError(GitHubAPIError):
    """Target user or repository does not exist on GitHub."""
    pass


class GitHubRateLimitError(GitHubAPIError):
    """GitHub API rate limit exhausted."""
    def __init__(self, reset_time: Optional[int] = None):
        msg = "GitHub API rate limit reached. "
        if reset_time:
            secs_remaining = max(0, int(reset_time - time.time()))
            mins = secs_remaining // 60
            msg += f"Rate limit resets in approximately {mins} minutes. "
        msg += "Configuring a GITHUB_TOKEN in your backend environment increases rate limits to 5,000 requests/hr."
        super().__init__(
            message=msg,
            status_code=429,
            hint="Add a personal access token (GITHUB_TOKEN) to backend/.env to evaluate high-volume profiles."
        )


class GitHubClient:
    """
    Asynchronous GitHub REST API client.
    Handles rate-limits, pagination, tree scanning, and content extraction.
    """

    def __init__(
        self,
        token: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: Optional[float] = None
    ) -> None:
        self.token = token if token is not None else settings.GITHUB_TOKEN
        self.base_url = (base_url or settings.GITHUB_API_BASE_URL).rstrip("/")
        self.timeout = timeout or float(settings.ANALYSIS_TIMEOUT_SECONDS)

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "RepoScope-Engine/2.0 (Academic Project Evaluation)",
        }
        if self.token and self.token.strip():
            headers["Authorization"] = f"Bearer {self.token.strip()}"
        return headers

    async def _request(
        self,
        client: httpx.AsyncClient,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Any:
        url = f"{self.base_url}/{path.lstrip('/')}"
        headers = self._get_headers()

        try:
            response = await client.request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                timeout=self.timeout
            )
        except httpx.TimeoutException:
            logger.warning("GitHub request timed out: %s", url)
            raise GitHubAPIError("Connection to GitHub API timed out. Please try again.", status_code=504)
        except httpx.RequestError as exc:
            logger.error("GitHub network request error: %s", exc)
            raise GitHubAPIError(f"Network error communicating with GitHub: {exc}", status_code=502)

        # Inspect rate limits
        remaining = response.headers.get("x-ratelimit-remaining")
        reset_time = response.headers.get("x-ratelimit-reset")
        if remaining is not None and int(remaining) <= 0 and response.status_code in (403, 429):
            reset_ts = int(reset_time) if reset_time and reset_time.isdigit() else None
            raise GitHubRateLimitError(reset_time=reset_ts)

        if response.status_code == 404:
            raise GitHubNotFoundError(f"Requested resource was not found on GitHub: {path}", status_code=404)

        if response.status_code == 401:
            raise GitHubAPIError("Invalid or expired GITHUB_TOKEN supplied.", status_code=401)

        if response.status_code == 409:
            # Empty Git repository
            return []

        if response.status_code >= 400:
            error_data = response.json() if "application/json" in response.headers.get("content-type", "") else {}
            msg = error_data.get("message", response.text)
            raise GitHubAPIError(f"GitHub API returned error ({response.status_code}): {msg}", status_code=response.status_code)

        return response.json()

    async def get_user(self, username: str) -> Dict[str, Any]:
        """Fetch public profile metadata for a GitHub user."""
        async with httpx.AsyncClient() as client:
            return await self._request(client, "GET", f"/users/{username}")

    async def get_user_repos(self, username: str, page: int = 1, per_page: int = 100) -> List[Dict[str, Any]]:
        """Fetch a page of public repositories for a given user."""
        async with httpx.AsyncClient() as client:
            params = {
                "type": "public",
                "sort": "updated",
                "direction": "desc",
                "page": page,
                "per_page": min(per_page, 100),
            }
            res = await self._request(client, "GET", f"/users/{username}/repos", params=params)
            return res if isinstance(res, list) else []

    async def get_all_user_repos(self, username: str, max_repos: Optional[int] = None) -> List[Dict[str, Any]]:
        """Retrieve repositories up to max_repos with pagination handling."""
        limit = max_repos or settings.MAX_REPOSITORIES_PER_PROFILE
        all_repos: List[Dict[str, Any]] = []
        page = 1

        async with httpx.AsyncClient() as client:
            while len(all_repos) < limit:
                params = {
                    "type": "public",
                    "sort": "updated",
                    "direction": "desc",
                    "page": page,
                    "per_page": min(100, limit - len(all_repos)),
                }
                repos = await self._request(client, "GET", f"/users/{username}/repos", params=params)
                if not repos or not isinstance(repos, list):
                    break
                all_repos.extend(repos)
                if len(repos) < params["per_page"]:
                    break
                page += 1

        return all_repos[:limit]

    async def get_repo(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetch detailed repository metadata."""
        async with httpx.AsyncClient() as client:
            return await self._request(client, "GET", f"/repos/{owner}/{repo}")

    async def get_repo_languages(self, owner: str, repo: str) -> Dict[str, int]:
        """Retrieve byte counts per programming language."""
        async with httpx.AsyncClient() as client:
            try:
                res = await self._request(client, "GET", f"/repos/{owner}/{repo}/languages")
                return res if isinstance(res, dict) else {}
            except GitHubNotFoundError:
                return {}

    async def get_repo_tree(self, owner: str, repo: str, branch: Optional[str] = None) -> List[Dict[str, Any]]:
        """Recursively fetch the repository file tree."""
        target_branch = branch or "HEAD"
        async with httpx.AsyncClient() as client:
            try:
                res = await self._request(
                    client,
                    "GET",
                    f"/repos/{owner}/{repo}/git/trees/{target_branch}",
                    params={"recursive": "1"}
                )
                tree = res.get("tree", []) if isinstance(res, dict) else []
                return tree if isinstance(tree, list) else []
            except GitHubAPIError:
                return []

    async def get_raw_file_content(
        self,
        owner: str,
        repo: str,
        path: str,
        branch: Optional[str] = None
    ) -> Optional[str]:
        """Fetch raw content for a single file, decoding base64 if required."""
        async with httpx.AsyncClient() as client:
            try:
                params = {"ref": branch} if branch else {}
                res = await self._request(client, "GET", f"/repos/{owner}/{repo}/contents/{path}", params=params)
                if isinstance(res, dict) and "content" in res and res.get("encoding") == "base64":
                    raw_b64 = res["content"].replace("\n", "")
                    return base64.b64decode(raw_b64).decode("utf-8", errors="replace")
                elif isinstance(res, dict) and "download_url" in res and res["download_url"]:
                    raw_res = await client.get(res["download_url"], headers=self._get_headers(), timeout=self.timeout)
                    if raw_res.status_code == 200:
                        return raw_res.text
            except Exception as exc:
                logger.debug("Could not retrieve file content %s/%s:%s - %s", owner, repo, path, exc)
                return None
        return None

    async def get_repo_readme(self, owner: str, repo: str) -> Optional[str]:
        """Retrieve the decoded README content for a repository."""
        async with httpx.AsyncClient() as client:
            try:
                res = await self._request(client, "GET", f"/repos/{owner}/{repo}/readme")
                if isinstance(res, dict) and "content" in res and res.get("encoding") == "base64":
                    raw_b64 = res["content"].replace("\n", "")
                    return base64.b64decode(raw_b64).decode("utf-8", errors="replace")
            except GitHubNotFoundError:
                return None
            except Exception as exc:
                logger.debug("Failed to fetch README for %s/%s: %s", owner, repo, exc)
                return None
        return None

    async def get_repo_commits(self, owner: str, repo: str, per_page: int = 30) -> List[Dict[str, Any]]:
        """Fetch recent commits to assess development cadence."""
        async with httpx.AsyncClient() as client:
            try:
                res = await self._request(
                    client,
                    "GET",
                    f"/repos/{owner}/{repo}/commits",
                    params={"per_page": min(per_page, 50)}
                )
                return res if isinstance(res, list) else []
            except GitHubAPIError:
                return []

