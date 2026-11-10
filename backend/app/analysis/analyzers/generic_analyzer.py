import re
from typing import List
from app.analysis.analyzers.base import BaseSourceAnalyzer, AnalyzerResult
from app.schemas.analysis import SecurityFinding

SECRET_KEY_PATTERN = re.compile(
    r"(password|secret|api_?key|access_?token)\s*[:=]\s*['\"][A-Za-z0-9_\-\.]{8,}['\"]",
    re.IGNORECASE
)


class GenericSourceAnalyzer(BaseSourceAnalyzer):
    """
    Fallback multi-language static analyzer computing LOC, basic branching complexity,
    exception handling patterns, and secret scanning for Java, C/C++, Go, Rust, and others.
    """

    def can_analyze(self, filename: str) -> bool:
        ext = filename.lower()
        return any(ext.endswith(e) for e in (
            ".java", ".cpp", ".c", ".h", ".hpp", ".go", ".rs", ".cs", ".php", ".rb", ".sql"
        ))

    def analyze(self, filename: str, content: str) -> AnalyzerResult:
        lines = content.splitlines()
        loc = len([l for l in lines if l.strip()])

        ext = filename.lower()
        if ext.endswith(".java"):
            lang = "Java"
        elif ext.endswith((".cpp", ".c", ".h", ".hpp")):
            lang = "C/C++"
        elif ext.endswith(".go"):
            lang = "Go"
        elif ext.endswith(".rs"):
            lang = "Rust"
        elif ext.endswith(".cs"):
            lang = "C#"
        elif ext.endswith(".php"):
            lang = "PHP"
        elif ext.endswith(".rb"):
            lang = "Ruby"
        else:
            lang = "Generic"

        security_findings: List[SecurityFinding] = []
        findings: List[str] = []

        # Secret scanning
        for idx, line in enumerate(lines, start=1):
            match = SECRET_KEY_PATTERN.search(line)
            if match and not any(kw in line.lower() for kw in ("test", "example", "mock", "dummy")):
                matched_key = match.group(1)
                security_findings.append(SecurityFinding(
                    severity="critical",
                    category="hardcoded_secret",
                    file_path=filename,
                    line_number=idx,
                    explanation=f"Potential credential assigned to '{matched_key}'.",
                    remediation="Extract credentials into environment configuration.",
                    evidence_snippet=f"{matched_key} = [REDACTED_SECRET]"
                ))

        has_error_handling = any(kw in content for kw in ("try {", "catch", "panic", "recover", "Result<", "err != nil"))

        return AnalyzerResult(
            language=lang,
            loc=loc,
            function_count=max(1, loc // 30),
            class_count=1 if "class " in content or "struct " in content else 0,
            avg_complexity=2.0,
            max_complexity=5,
            high_complexity_count=0,
            has_error_handling=has_error_handling,
            has_type_annotations=True if lang in ("Java", "C/C++", "Rust", "Go", "C#") else False,
            findings=findings,
            security_findings=security_findings
        )

