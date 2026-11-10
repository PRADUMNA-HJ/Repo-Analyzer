from typing import List, Tuple


class ArchitectureScanner:
    """
    Evaluates repository structure, modularity, and architectural decoupling
    by inspecting directory hierarchies and component placements.
    """

    def analyze_architecture(self, file_paths: List[str]) -> Tuple[str, List[str]]:
        normalized = [p.replace("\\", "/").lower() for p in file_paths]
        findings: List[str] = []

        has_frontend = any("frontend/" in p or "client/" in p or "src/components/" in p for p in normalized)
        has_backend = any("backend/" in p or "server/" in p or "app/api/" in p or "api/" in p for p in normalized)
        has_docker = any("dockerfile" in p or "docker-compose" in p for p in normalized)
        has_tests = any("test" in p for p in normalized)
        has_ci = any(".github/workflows" in p for p in normalized)

        # Check for layered structure
        has_controllers = any(any(k in p for k in ("/controllers", "/routes", "/endpoints", "/views")) for p in normalized)
        has_services = any("/services" in p or "/usecases" in p for p in normalized)
        has_models = any(any(k in p for k in ("/models", "/entities", "/schemas", "/db")) for p in normalized)

        arch_summary_parts = []

        if has_frontend and has_backend:
            arch_summary_parts.append("Full-stack decoupled architecture isolating client presentation from backend services.")
            findings.append("Clean separation of concerns between frontend and backend tiers.")
        elif has_backend:
            arch_summary_parts.append("Backend service architecture focused on API endpoints and domain business logic.")
        elif has_frontend:
            arch_summary_parts.append("Client-side single page application (SPA) architecture.")
        else:
            arch_summary_parts.append("Modular software application repository layout.")

        if has_controllers and has_models:
            findings.append("Adopted layered design pattern separating API controllers from data schemas/models.")
            if has_services:
                findings.append("Domain business logic decoupled via specialized service layer modules.")

        if has_docker:
            findings.append("Containerized deployment configuration managed via Docker.")

        if has_ci:
            findings.append("Continuous integration (CI) automation workflows configured via GitHub Actions.")

        if has_tests:
            findings.append("Dedicated automated test suite directories established.")

        notes = " ".join(arch_summary_parts)
        if findings:
            notes += " " + " ".join(findings)

        return notes, findings

