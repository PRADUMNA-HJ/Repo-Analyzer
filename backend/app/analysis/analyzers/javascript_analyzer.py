import re
from typing import List
from app.analysis.analyzers.base import BaseSourceAnalyzer, AnalyzerResult
from app.schemas.analysis import SecurityFinding

SECRET_KEY_PATTERN = re.compile(
    r"(const|let|var)\s+(password|secret|api_?key|access_?token|token)\s*=\s*['\"][A-Za-z0-9_\-\.]{8,}['\"]",
    re.IGNORECASE
)

DECISION_PATTERN = re.compile(r"\b(if|else if|for|while|switch|case|catch)\b|\?|&&|\|\|")
FUNCTION_PATTERN = re.compile(r"\bfunction\b|\bconst\s+[A-Za-z0-9_]+\s*=\s*(\([^\)]*\)|[A-Za-z0-9_]+)\s*=>")
CLASS_PATTERN = re.compile(r"\bclass\s+[A-Za-z0-9_]+")
TS_TYPE_PATTERN = re.compile(r"\b(interface|type)\s+[A-Za-z0-9_]+|:\s*(string|number|boolean|any|void|Promise<)")


class JavaScriptSourceAnalyzer(BaseSourceAnalyzer):
    """
    Static analyzer for JavaScript and TypeScript source files inspecting
    modularity, complexity heuristics, typing rigour, and security indicators.
    """

    def can_analyze(self, filename: str) -> bool:
        ext = filename.lower()
        return ext.endswith(".js") or ext.endswith(".jsx") or ext.endswith(".ts") or ext.endswith(".tsx")

    def analyze(self, filename: str, content: str) -> AnalyzerResult:
        lines = content.splitlines()
        loc = len([l for l in lines if l.strip() and not l.strip().startswith("//")])

        is_ts = filename.lower().endswith((".ts", ".tsx"))
        lang_name = "TypeScript" if is_ts else "JavaScript"

        findings: List[str] = []
        security_findings: List[SecurityFinding] = []

        total_functions = len(FUNCTION_PATTERN.findall(content))
        total_classes = len(CLASS_PATTERN.findall(content))

        # Complexity heuristic based on branching keywords
        decision_points = len(DECISION_PATTERN.findall(content))
        avg_complexity = round(max(1.0, decision_points / max(1, total_functions)), 1)
        max_complexity = min(25, int(avg_complexity * 2.2))
        high_comp_count = 1 if avg_complexity > 8 else 0

        has_error_handling = "try {" in content or ".catch(" in content
        has_type_annotations = is_ts and bool(TS_TYPE_PATTERN.search(content))

        # Check for dangerous patterns
        for idx, line in enumerate(lines, start=1):
            if "eval(" in line:
                security_findings.append(SecurityFinding(
                    severity="high",
                    category="dangerous_eval",
                    file_path=filename,
                    line_number=idx,
                    explanation="Use of 'eval()' executes arbitrary string expressions as code.",
                    remediation="Use structured JSON parsing or safe mapping functions.",
                    evidence_snippet="eval(...)"
                ))

            if "dangerouslySetInnerHTML" in line:
                security_findings.append(SecurityFinding(
                    severity="medium",
                    category="xss_risk",
                    file_path=filename,
                    line_number=idx,
                    explanation="dangerouslySetInnerHTML bypasses React's XSS sanitization safeguards.",
                    remediation="Ensure untrusted HTML is passed through DOMPurify before rendering.",
                    evidence_snippet="dangerouslySetInnerHTML={{ __html: ... }}"
                ))

            # Secret check
            match = SECRET_KEY_PATTERN.search(line)
            if match and not any(kw in line.lower() for kw in ("test", "example", "mock", "dummy", "process.env")):
                matched_key = match.group(2)
                security_findings.append(SecurityFinding(
                    severity="critical",
                    category="hardcoded_secret",
                    file_path=filename,
                    line_number=idx,
                    explanation=f"Potential hardcoded credentials assigned to '{matched_key}'.",
                    remediation="Store secrets in .env or environment configuration variables.",
                    evidence_snippet=f"{matched_key} = [REDACTED_SECRET]"
                ))

        if has_type_annotations:
            findings.append(f"Strong static typing annotations implemented in {filename}.")
        if has_error_handling:
            findings.append("Promises and async workflows backed by error handling.")

        return AnalyzerResult(
            language=lang_name,
            loc=loc,
            function_count=total_functions,
            class_count=total_classes,
            avg_complexity=avg_complexity,
            max_complexity=max_complexity,
            high_complexity_count=high_comp_count,
            has_error_handling=has_error_handling,
            has_type_annotations=has_type_annotations,
            findings=findings,
            security_findings=security_findings
        )

