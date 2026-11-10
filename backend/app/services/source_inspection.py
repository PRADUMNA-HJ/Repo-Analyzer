import os
import re
from typing import Any, Dict, List, Optional, Set
from app.core.config import settings

EXCLUDED_DIR_PARTS = {
    "node_modules", ".git", "dist", "build", "target", "vendor",
    "__pycache__", ".venv", "venv", "env", ".idea", ".vscode",
    ".pytest_cache", ".next", ".nuxt", "coverage", ".turbo", "out"
}

BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp",
    ".mp3", ".mp4", ".mov", ".wav", ".avi",
    ".pdf", ".zip", ".tar", ".gz", ".7z", ".rar",
    ".exe", ".dll", ".so", ".dylib", ".bin",
    ".class", ".pyc", ".pyo", ".o", ".a", ".wasm",
    ".jar", ".war", ".ear", ".iso", ".dmg", ".woff", ".woff2", ".ttf", ".eot"
}

MANIFEST_FILENAMES = {
    "package.json", "requirements.txt", "pyproject.toml", "pipfile",
    "pom.xml", "build.gradle", "build.gradle.kts", "go.mod", "cargo.toml",
    "composer.json", "gemfile", "mix.exs", "podfile"
}

ENTRYPOINT_PATTERNS = re.compile(
    r"^(main|app|index|server|manage|wsgi|asgi|entrypoint)\.(py|ts|tsx|js|jsx|go|rs|java)$",
    re.IGNORECASE
)


class FileCategory:
    MANIFEST = "manifest"
    ENTRYPOINT = "entrypoint"
    ROUTE = "route"
    MODEL = "model"
    TEST = "test"
    CONFIG = "config"
    DOCUMENTATION = "documentation"
    SOURCE = "source"
    OTHER = "other"


class InspectedFile:
    def __init__(self, path: str, category: str, size: int, content: Optional[str] = None):
        self.path = path
        self.category = category
        self.size = size
        self.content = content


class SourceInspectionService:
    """
    Intelligently catalogs and selects high-value repository source files
    for static analysis, manifest inspection, and architectural grading.
    """

    def is_excluded_path(self, path: str) -> bool:
        normalized = path.replace("\\", "/").lower()
        parts = normalized.split("/")

        # Check directory exclusions
        for part in parts[:-1]:
            if part in EXCLUDED_DIR_PARTS:
                return True

        # Check binary extensions
        _, ext = os.path.splitext(parts[-1])
        if ext in BINARY_EXTENSIONS:
            return True

        # Exclude minified bundles and lockfiles
        filename = parts[-1]
        if ".min." in filename or filename in ("package-lock.json", "yarn.lock", "pnpm-lock.yaml", "cargo.lock"):
            return True

        return False

    def categorize_file(self, path: str) -> str:
        normalized = path.replace("\\", "/").lower()
        filename = os.path.basename(normalized)

        if filename in MANIFEST_FILENAMES:
            return FileCategory.MANIFEST

        if filename.startswith("readme") or filename.startswith("contributing") or filename.startswith("license"):
            return FileCategory.DOCUMENTATION

        if "docker" in filename or filename.endswith(".yml") or filename.endswith(".yaml") or filename.endswith(".toml"):
            return FileCategory.CONFIG

        if "/test" in normalized or "/tests" in normalized or "__tests__" in normalized or "test_" in filename or "_test." in filename or ".spec." in filename:
            return FileCategory.TEST

        if ENTRYPOINT_PATTERNS.match(filename):
            return FileCategory.ENTRYPOINT

        if any(seg in normalized for seg in ("/routes", "/controllers", "/endpoints", "/api", "/views")):
            return FileCategory.ROUTE

        if any(seg in normalized for seg in ("/models", "/schemas", "/entities", "/migrations", "/db")):
            return FileCategory.MODEL

        return FileCategory.SOURCE

    def filter_tree_and_select_files(
        self,
        tree: List[Dict[str, Any]],
        max_files: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        limit = max_files or settings.MAX_FILES_PER_REPOSITORY
        selected: List[Dict[str, Any]] = []

        manifests: List[Dict[str, Any]] = []
        entrypoints: List[Dict[str, Any]] = []
        routes_and_models: List[Dict[str, Any]] = []
        tests: List[Dict[str, Any]] = []
        configs_and_docs: List[Dict[str, Any]] = []
        general_sources: List[Dict[str, Any]] = []

        for item in tree:
            if item.get("type") != "blob":
                continue
            path = item.get("path", "")
            size = item.get("size", 0)

            if self.is_excluded_path(path):
                continue
            if size > settings.MAX_SOURCE_FILE_SIZE:
                continue

            category = self.categorize_file(path)
            item_with_cat = {**item, "category": category}

            if category == FileCategory.MANIFEST:
                manifests.append(item_with_cat)
            elif category == FileCategory.ENTRYPOINT:
                entrypoints.append(item_with_cat)
            elif category in (FileCategory.ROUTE, FileCategory.MODEL):
                routes_and_models.append(item_with_cat)
            elif category == FileCategory.TEST:
                tests.append(item_with_cat)
            elif category in (FileCategory.CONFIG, FileCategory.DOCUMENTATION):
                configs_and_docs.append(item_with_cat)
            else:
                general_sources.append(item_with_cat)

        # Prioritize key files: manifests first, then entrypoints, routes, models, tests, configs, sources
        selected.extend(manifests)
        selected.extend(entrypoints)
        selected.extend(routes_and_models[:25])
        selected.extend(tests[:15])
        selected.extend(configs_and_docs[:10])
        remaining = limit - len(selected)
        if remaining > 0:
            selected.extend(general_sources[:remaining])

        return selected[:limit]

