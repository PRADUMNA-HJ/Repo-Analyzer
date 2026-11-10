import ast
import re
from typing import List
from app.analysis.analyzers.base import BaseSourceAnalyzer, AnalyzerResult
from app.schemas.analysis import SecurityFinding

SECRET_KEY_PATTERN = re.compile(
    r"(password|secret|api_key|access_token|private_key|token)\s*=\s*['\"][A-Za-z0-9_\-\.]{8,}['\"]",
    re.IGNORECASE
)


class CyclomaticComplexityVisitor(ast.NodeVisitor):
    def __init__(self):
        self.complexity = 1

    def visit_If(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_For(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_AsyncFor(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_While(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_Try(self, node):
        self.complexity += len(node.handlers)
        self.generic_visit(node)

    def visit_BoolOp(self, node):
        self.complexity += len(node.values) - 1
        self.generic_visit(node)

    def visit_IfExp(self, node):
        self.complexity += 1
        self.generic_visit(node)


class PythonSourceAnalyzer(BaseSourceAnalyzer):
    """
    AST-based Python static analyzer measuring cyclomatic complexity,
    modularity, typing discipline, error handling, and security patterns.
    """

    def can_analyze(self, filename: str) -> bool:
        return filename.lower().endswith(".py")

    def analyze(self, filename: str, content: str) -> AnalyzerResult:
        lines = content.splitlines()
        loc = len([line for line in lines if line.strip() and not line.strip().startswith("#")])

        findings: List[str] = []
        security_findings: List[SecurityFinding] = []

        try:
            tree = ast.parse(content, filename=filename)
        except SyntaxError as e:
            return AnalyzerResult(
                language="Python",
                loc=loc,
                findings=[f"Python SyntaxError on line {e.lineno}: {e.msg}"]
            )

        function_complexities: List[int] = []
        total_functions = 0
        total_classes = 0
        has_error_handling = False
        has_type_annotations = False
        type_annotated_count = 0

        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                total_functions += 1
                visitor = CyclomaticComplexityVisitor()
                visitor.visit(node)
                function_complexities.append(visitor.complexity)

                # Check typing
                if node.returns is not None or any(arg.annotation is not None for arg in node.args.args):
                    type_annotated_count += 1

            elif isinstance(node, ast.ClassDef):
                total_classes += 1

            elif isinstance(node, (ast.Try, ast.TryStar)):
                has_error_handling = True

            # Security: check dangerous calls
            elif isinstance(node, ast.Call):
                func_name = ""
                if isinstance(node.func, ast.Name):
                    func_name = node.func.id
                elif isinstance(node.func, ast.Attribute):
                    func_name = node.func.attr

                if func_name in ("eval", "exec"):
                    security_findings.append(SecurityFinding(
                        severity="high",
                        category="dangerous_execution",
                        file_path=filename,
                        line_number=node.lineno,
                        explanation=f"Use of '{func_name}' dynamically executes arbitrary code.",
                        remediation="Refactor to use safe deserialization or parsing alternatives.",
                        evidence_snippet=f"{func_name}(...)"
                    ))

                # Check subprocess shell=True
                if func_name in ("Popen", "run", "call", "check_call", "check_output"):
                    for kw in node.keywords:
                        if kw.arg == "shell" and isinstance(kw.value, ast.Constant) and kw.value.value is True:
                            security_findings.append(SecurityFinding(
                                severity="high",
                                category="shell_injection_risk",
                                file_path=filename,
                                line_number=node.lineno,
                                explanation="subprocess executed with shell=True creates shell injection vulnerability.",
                                remediation="Pass arguments as an argument list and remove shell=True.",
                                evidence_snippet=f"subprocess.{func_name}(..., shell=True)"
                            ))

        # Check for hardcoded secret assignments
        for idx, line in enumerate(lines, start=1):
            match = SECRET_KEY_PATTERN.search(line)
            if match and not any(kw in line.lower() for kw in ("test", "example", "dummy", "placeholder", "os.environ")):
                matched_key = match.group(1)
                security_findings.append(SecurityFinding(
                    severity="critical",
                    category="hardcoded_secret",
                    file_path=filename,
                    line_number=idx,
                    explanation=f"Potential hardcoded credential or secret key assigned to variable '{matched_key}'.",
                    remediation="Extract credentials into environment variables or secrets manager.",
                    evidence_snippet=f"{matched_key} = [REDACTED_SECRET]"
                ))

        avg_comp = round(sum(function_complexities) / len(function_complexities), 1) if function_complexities else 1.0
        max_comp = max(function_complexities) if function_complexities else 1
        high_comp_count = sum(1 for c in function_complexities if c > 10)

        if total_functions > 0 and (type_annotated_count / total_functions) >= 0.5:
            has_type_annotations = True

        if high_comp_count > 0:
            findings.append(f"{high_comp_count} functions exhibit high cyclomatic complexity (>10).")
        if has_type_annotations:
            findings.append("Consistent Python type hints adopted across modules.")
        if has_error_handling:
            findings.append("Structured exception handling (try/except) detected.")

        return AnalyzerResult(
            language="Python",
            loc=loc,
            function_count=total_functions,
            class_count=total_classes,
            avg_complexity=avg_comp,
            max_complexity=max_comp,
            high_complexity_count=high_comp_count,
            has_error_handling=has_error_handling,
            has_type_annotations=has_type_annotations,
            findings=findings,
            security_findings=security_findings
        )

