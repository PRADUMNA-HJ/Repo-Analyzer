from app.services.repository_discovery import RepositoryDiscoveryService


def test_discovery_filtering_forks_and_archived():
    discovery = RepositoryDiscoveryService()
    repos = [
        {"name": "original-saas", "fork": False, "archived": False, "size": 1200, "description": "Full-stack SaaS"},
        {"name": "react-fork", "fork": True, "archived": False, "size": 50000, "description": "Fork of React"},
        {"name": "old-project", "fork": False, "archived": True, "size": 300, "description": "Deprecated"},
        {"name": "empty-repo", "fork": False, "archived": False, "size": 0, "description": "Empty"},
        {"name": "hello-world", "fork": False, "archived": False, "size": 20, "description": "Hello world practice"},
    ]

    candidates, excluded = discovery.filter_and_rank_candidates(repos)

    assert len(candidates) == 1
    assert candidates[0]["name"] == "original-saas"
    assert len(excluded) == 4

    excluded_names = {e.name for e in excluded}
    assert "react-fork" in excluded_names
    assert "old-project" in excluded_names
    assert "empty-repo" in excluded_names
    assert "hello-world" in excluded_names


def test_discovery_preserves_zero_star_quality_project():
    discovery = RepositoryDiscoveryService()
    repos = [
        {"name": "high-star-fork", "fork": True, "archived": False, "size": 8000, "stargazers_count": 1500},
        {"name": "innovative-project", "fork": False, "archived": False, "size": 450, "stargazers_count": 0, "description": "Clean architecture system"},
    ]

    candidates, _ = discovery.filter_and_rank_candidates(repos)
    assert len(candidates) == 1
    assert candidates[0]["name"] == "innovative-project"

