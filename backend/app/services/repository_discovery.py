import re
from typing import Any, Dict, List, Tuple
from app.schemas.analysis import ExcludedRepositoryInfo

TRIVIAL_NAME_PATTERNS = re.compile(
    r"^(hello-?world|learn-?git|test|my-?first|practice|sandbox|scratchpad|assignment-?0?[1-9]|lab-?0?[1-9])$",
    re.IGNORECASE
)


class RepositoryDiscoveryService:
    """
    Filters and prioritizes candidate software engineering repositories.
    Excludes forks, empty repos, and trivial assignments while preserving
    original high-impact projects regardless of star count.
    """

    def filter_and_rank_candidates(
        self,
        repositories: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[ExcludedRepositoryInfo]]:
        candidates: List[Dict[str, Any]] = []
        excluded: List[ExcludedRepositoryInfo] = []

        for repo in repositories:
            name = repo.get("name", "unknown")
            is_fork = repo.get("fork", False)
            is_archived = repo.get("archived", False)
            size = repo.get("size", 0)

            # Rule 1: Exclude forks
            if is_fork:
                excluded.append(ExcludedRepositoryInfo(name=name, reason="Fork of an upstream repository"))
                continue

            # Rule 2: Exclude archived repos
            if is_archived:
                excluded.append(ExcludedRepositoryInfo(name=name, reason="Archived or deprecated repository"))
                continue

            # Rule 3: Exclude empty repos
            if size == 0:
                excluded.append(ExcludedRepositoryInfo(name=name, reason="Empty repository with 0 KB source"))
                continue

            # Rule 4: Identify trivial assignments
            if TRIVIAL_NAME_PATTERNS.match(name):
                excluded.append(ExcludedRepositoryInfo(name=name, reason="Heuristically identified as trivial practice or scratchpad"))
                continue

            candidates.append(repo)

        # Fallback: if all repos were forks, allow original contributions
        if not candidates and repositories:
            for repo in repositories:
                if repo.get("size", 0) > 0 and not repo.get("archived", False):
                    candidates.append(repo)

        # Sort candidate projects by preliminary architectural significance:
        # Balanced score considering size, description presence, issues, updates, not stars alone!
        def preliminary_score(r: Dict[str, Any]) -> float:
            score = 0.0
            # Source volume indicator (capped so giant repos don't overpower clean code)
            size_kb = r.get("size", 0)
            if size_kb > 50:
                score += min(30.0, size_kb / 100.0)

            # Metadata indicators
            if r.get("description"):
                score += 15.0
            if r.get("topics"):
                score += 10.0
            if r.get("has_issues", False):
                score += 5.0
            if r.get("language"):
                score += 10.0
            # Open source license
            if r.get("license"):
                score += 5.0

            return score

        candidates.sort(key=preliminary_score, reverse=True)
        return candidates, excluded

