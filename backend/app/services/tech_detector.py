import json
import re
from typing import Any, Dict, List, Set, Tuple
from app.schemas.analysis import LanguageBreakdown, TechnologyCategory

GITHUB_LANGUAGE_COLORS: Dict[str, str] = {
    "TypeScript": "#3178C6",
    "JavaScript": "#F1E05A",
    "Python": "#3572A5",
    "Java": "#B07219",
    "C++": "#F34B7D",
    "C": "#555555",
    "C#": "#178600",
    "Go": "#00ADD8",
    "Rust": "#DEA584",
    "PHP": "#4F5D95",
    "Ruby": "#701516",
    "HTML": "#E34C26",
    "CSS": "#563D7C",
    "SCSS": "#C6538C",
    "Shell": "#89E051",
    "Kotlin": "#A97BFF",
    "Swift": "#F05138",
    "Dart": "#00B4AB",
    "SQL": "#E38C00",
    "Dockerfile": "#384D54",
    "Vue": "#41B883",
    "Svelte": "#FF3E00",
}


class TechnologyDetector:
    """
    Detects programming language distributions from GitHub metrics
    and extracts frameworks, databases, and libraries from manifests.
    """

    def calculate_language_breakdown(
        self,
        language_bytes: Dict[str, int],
        inspected_extensions: Optional[List[str]] = None
    ) -> List[LanguageBreakdown]:
        total_bytes = sum(language_bytes.values()) if language_bytes else 0

        if total_bytes > 0:
            results: List[LanguageBreakdown] = []
            for lang, count in sorted(language_bytes.items(), key=lambda x: x[1], reverse=True):
                pct = round((count / total_bytes) * 100.0, 1)
                if pct >= 0.5:  # Filter out trivial <0.5% traces
                    color = GITHUB_LANGUAGE_COLORS.get(lang, "#8B5CF6")
                    results.append(LanguageBreakdown(
                        name=lang,
                        percentage=pct,
                        color=color,
                        bytes_count=count
                    ))
            return results

        # Fallback heuristic if GitHub languages API returned 0 bytes (e.g. unindexed repo)
        if inspected_extensions:
            ext_counts: Dict[str, int] = {}
            ext_map = {
                ".py": "Python", ".ts": "TypeScript", ".tsx": "TypeScript",
                ".js": "JavaScript", ".jsx": "JavaScript", ".java": "Java",
                ".go": "Go", ".rs": "Rust", ".cpp": "C++", ".c": "C",
                ".html": "HTML", ".css": "CSS", ".php": "PHP"
            }
            for ext in inspected_extensions:
                lang = ext_map.get(ext.lower())
                if lang:
                    ext_counts[lang] = ext_counts.get(lang, 0) + 1
            tot = sum(ext_counts.values())
            if tot > 0:
                return [
                    LanguageBreakdown(
                        name=l,
                        percentage=round((cnt / tot) * 100.0, 1),
                        color=GITHUB_LANGUAGE_COLORS.get(l, "#8B5CF6"),
                        bytes_count=None
                    )
                    for l, cnt in sorted(ext_counts.items(), key=lambda x: x[1], reverse=True)
                ]

        return [LanguageBreakdown(name="Codebase", percentage=100.0, color="#8B5CF6", bytes_count=0)]

    def detect_technologies_from_manifests(
        self,
        manifest_files: Dict[str, str],
        all_file_paths: List[str]
    ) -> Tuple[List[TechnologyCategory], Dict[str, List[str]]]:
        """
        Scans manifest contents (package.json, requirements.txt, pyproject.toml, etc.)
        and file trees to categorize detected frameworks and tools.
        Returns (categorized_stack, evidence_map).
        """
        frontend_tools: Set[str] = set()
        backend_tools: Set[str] = set()
        database_tools: Set[str] = set()
        testing_tools: Set[str] = set()
        devops_tools: Set[str] = set()

        evidence: Dict[str, List[str]] = {}

        def record(category: str, tool: str, file_path: str):
            if category == "Frontend":
                frontend_tools.add(tool)
            elif category == "Backend":
                backend_tools.add(tool)
            elif category == "Database":
                database_tools.add(tool)
            elif category == "Testing":
                testing_tools.add(tool)
            elif category == "DevOps":
                devops_tools.add(tool)

            evidence.setdefault(tool, []).append(file_path)

        # 1. Inspect package.json (Node/JS/TS)
        for path, content in manifest_files.items():
            if path.lower().endswith("package.json"):
                try:
                    data = json.loads(content)
                    deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}

                    # Frontend frameworks
                    if "next" in deps:
                        record("Frontend", "Next.js", path)
                    elif "react" in deps:
                        record("Frontend", "React", path)
                    if "vue" in deps or "nuxt" in deps:
                        record("Frontend", "Vue.js", path)
                    if "svelte" in deps:
                        record("Frontend", "Svelte", path)
                    if "@angular/core" in deps:
                        record("Frontend", "Angular", path)
                    if "tailwindcss" in deps:
                        record("Frontend", "Tailwind CSS", path)
                    if "vite" in deps:
                        record("Frontend", "Vite", path)
                    if "redux" in deps or "@reduxjs/toolkit" in deps:
                        record("Frontend", "Redux", path)
                    if "recharts" in deps:
                        record("Frontend", "Recharts", path)

                    # Backend Node frameworks
                    if "express" in deps:
                        record("Backend", "Express.js", path)
                    if "@nestjs/core" in deps:
                        record("Backend", "NestJS", path)
                    if "fastify" in deps:
                        record("Backend", "Fastify", path)

                    # Databases
                    if "pg" in deps or "pg-promise" in deps:
                        record("Database", "PostgreSQL", path)
                    if "prisma" in deps or "@prisma/client" in deps:
                        record("Database", "Prisma ORM", path)
                    if "mongoose" in deps or "mongodb" in deps:
                        record("Database", "MongoDB", path)
                    if "redis" in deps or "ioredis" in deps:
                        record("Database", "Redis", path)

                    # Testing
                    if "jest" in deps:
                        record("Testing", "Jest", path)
                    if "vitest" in deps:
                        record("Testing", "Vitest", path)
                    if "cypress" in deps:
                        record("Testing", "Cypress", path)
                    if "playwright" in deps or "@playwright/test" in deps:
                        record("Testing", "Playwright", path)
                except Exception:
                    pass

            # 2. Inspect Python requirements / pyproject.toml
            if path.lower().endswith("requirements.txt") or path.lower().endswith("pyproject.toml") or path.lower().endswith("pipfile"):
                text_lower = content.lower()

                # Backend frameworks
                if "fastapi" in text_lower:
                    record("Backend", "FastAPI", path)
                if "django" in text_lower:
                    record("Backend", "Django", path)
                if "flask" in text_lower:
                    record("Backend", "Flask", path)
                if "tornado" in text_lower:
                    record("Backend", "Tornado", path)
                if "uvicorn" in text_lower:
                    record("Backend", "Uvicorn", path)

                # Databases & ORMs
                if "psycopg" in text_lower or "asyncpg" in text_lower:
                    record("Database", "PostgreSQL", path)
                if "sqlalchemy" in text_lower:
                    record("Database", "SQLAlchemy", path)
                if "pymongo" in text_lower or "motor" in text_lower:
                    record("Database", "MongoDB", path)
                if "redis" in text_lower:
                    record("Database", "Redis", path)

                # Testing
                if "pytest" in text_lower:
                    record("Testing", "Pytest", path)
                if "unittest" in text_lower:
                    record("Testing", "Unittest", path)

            # 3. Inspect Java / Go / Rust
            if path.lower().endswith("pom.xml") or path.lower().endswith("build.gradle"):
                if "spring-boot" in content.lower():
                    record("Backend", "Spring Boot", path)
                if "junit" in content.lower():
                    record("Testing", "JUnit", path)
                if "postgresql" in content.lower():
                    record("Database", "PostgreSQL", path)

            if path.lower().endswith("go.mod"):
                if "gin-gonic" in content:
                    record("Backend", "Gin", path)
                if "gorm" in content:
                    record("Database", "GORM", path)

            if path.lower().endswith("cargo.toml"):
                if "actix-web" in content:
                    record("Backend", "Actix Web", path)
                if "axum" in content:
                    record("Backend", "Axum", path)
                if "tokio" in content:
                    record("Backend", "Tokio Async", path)

        # 4. Inspect file tree for DevOps & CI
        for p in all_file_paths:
            p_lower = p.lower()
            if "dockerfile" in p_lower:
                record("DevOps", "Docker", p)
            if "docker-compose" in p_lower:
                record("DevOps", "Docker Compose", p)
            if ".github/workflows" in p_lower:
                record("DevOps", "GitHub Actions CI", p)
            if "k8s" in p_lower or "kubernetes" in p_lower:
                record("DevOps", "Kubernetes", p)
            if p_lower.endswith(".tf"):
                record("DevOps", "Terraform", p)

        categories: List[TechnologyCategory] = []
        if frontend_tools:
            categories.append(TechnologyCategory(category="Frontend", items=sorted(list(frontend_tools))))
        if backend_tools:
            categories.append(TechnologyCategory(category="Backend API", items=sorted(list(backend_tools))))
        if database_tools:
            categories.append(TechnologyCategory(category="Database & Cache", items=sorted(list(database_tools))))
        if testing_tools:
            categories.append(TechnologyCategory(category="Testing & QA", items=sorted(list(testing_tools))))
        if devops_tools:
            categories.append(TechnologyCategory(category="DevOps & CI/CD", items=sorted(list(devops_tools))))

        return categories, evidence

