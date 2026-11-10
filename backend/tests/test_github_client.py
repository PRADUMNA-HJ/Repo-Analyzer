import pytest
import httpx
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.github_client import (
    GitHubClient,
    GitHubNotFoundError,
    GitHubRateLimitError,
    GitHubAPIError,
)


@pytest.mark.asyncio
async def test_github_client_get_user_success():
    client = GitHubClient(token="mock-token")
    mock_user_data = {
        "login": "octocat",
        "name": "The Octocat",
        "public_repos": 8,
        "avatar_url": "https://avatars.githubusercontent.com/u/583231",
        "html_url": "https://github.com/octocat"
    }

    with patch("httpx.AsyncClient.request") as mock_req:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_user_data
        mock_resp.headers = {"x-ratelimit-remaining": "4999"}
        mock_req.return_value = mock_resp

        user = await client.get_user("octocat")
        assert user["login"] == "octocat"
        assert user["public_repos"] == 8


@pytest.mark.asyncio
async def test_github_client_not_found():
    client = GitHubClient()

    with patch("httpx.AsyncClient.request") as mock_req:
        mock_resp = MagicMock()
        mock_resp.status_code = 404
        mock_resp.headers = {"x-ratelimit-remaining": "59"}
        mock_req.return_value = mock_resp

        with pytest.raises(GitHubNotFoundError):
            await client.get_user("non-existent-user-1234567")


@pytest.mark.asyncio
async def test_github_client_rate_limit():
    client = GitHubClient()

    with patch("httpx.AsyncClient.request") as mock_req:
        mock_resp = MagicMock()
        mock_resp.status_code = 403
        mock_resp.headers = {"x-ratelimit-remaining": "0", "x-ratelimit-reset": "1800000000"}
        mock_req.return_value = mock_resp

        with pytest.raises(GitHubRateLimitError) as exc_info:
            await client.get_user("octocat")
        assert "rate limit reached" in exc_info.value.message.lower()


@pytest.mark.asyncio
async def test_github_client_unauthorized():
    client = GitHubClient(token="bad-token")

    with patch("httpx.AsyncClient.request") as mock_req:
        mock_resp = MagicMock()
        mock_resp.status_code = 401
        mock_resp.headers = {}
        mock_req.return_value = mock_resp

        with pytest.raises(GitHubAPIError) as exc_info:
            await client.get_user("octocat")
        assert "Invalid or expired GITHUB_TOKEN" in exc_info.value.message


@pytest.mark.asyncio
async def test_github_client_timeout():
    client = GitHubClient()

    with patch("httpx.AsyncClient.request", side_effect=httpx.TimeoutException("Connection timed out")):
        with pytest.raises(GitHubAPIError) as exc_info:
            await client.get_user("octocat")
        assert "timed out" in exc_info.value.message.lower()

