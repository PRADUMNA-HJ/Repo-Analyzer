import re
from typing import Tuple, Optional
from urllib.parse import urlparse

# Reserved path segments on github.com that are not usernames or repositories
RESERVED_GITHUB_PATHS = {
    "login", "join", "explore", "trending", "pricing", "features", "enterprise",
    "marketplace", "topics", "collections", "security", "customer-stories",
    "settings", "notifications", "about", "contact", "site", "dashboard",
    "pulls", "issues", "codespaces", "sponsors", "search"
}

# GitHub username: alphanumeric and single hyphens, 1-39 chars, cannot begin or end with hyphen
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$")

# GitHub repository name: alphanumeric, periods, hyphens, underscores, 1-100 chars
REPO_REGEX = re.compile(r"^[a-zA-Z0-9_.-]{1,100}$")


def validate_and_parse_github_url(raw_url: str) -> Tuple[bool, Optional[str], Optional[str], Optional[str]]:
    """
    Validates a GitHub URL and extracts type (profile vs repository), username, and repository name.
    
    Returns:
        (is_valid, target_type, username, repo_name)
        target_type is either "profile" or "repository"
    """
    if not raw_url or not isinstance(raw_url, str):
        return False, None, None, None

    trimmed = raw_url.strip()
    if not trimmed:
        return False, None, None, None

    # Handle protocol prepend if user omitted https://
    if not (trimmed.startswith("http://") or trimmed.startswith("https://")):
        trimmed = "https://" + trimmed

    try:
        parsed = urlparse(trimmed)
    except Exception:
        return False, None, None, None

    # Check hostname
    hostname = (parsed.hostname or "").lower()
    if hostname != "github.com" and hostname != "www.github.com":
        return False, None, None, None

    # Parse path segments
    path = parsed.path.strip("/")
    if not path:
        return False, None, None, None

    segments = [s for s in path.split("/") if s]

    if len(segments) == 1:
        username = segments[0]
        if username.lower() in RESERVED_GITHUB_PATHS:
            return False, None, None, None
        if not USERNAME_REGEX.match(username):
            return False, None, None, None
        return True, "profile", username, None

    elif len(segments) == 2:
        username = segments[0]
        repo_name = segments[1]

        # Strip .git extension if provided
        if repo_name.endswith(".git"):
            repo_name = repo_name[:-4]

        if username.lower() in RESERVED_GITHUB_PATHS:
            return False, None, None, None
        if not USERNAME_REGEX.match(username):
            return False, None, None, None
        if not REPO_REGEX.match(repo_name):
            return False, None, None, None

        return True, "repository", username, repo_name

    return False, None, None, None

