from abc import ABC, abstractmethod
from typing import List, Optional
from app.schemas.analysis import SecurityFinding


class AnalyzerResult:
    def __init__(
        self,
        language: str,
        loc: int = 0,
        function_count: int = 0,
        class_count: int = 0,
        avg_complexity: float = 1.0,
        max_complexity: int = 1,
        high_complexity_count: int = 0,
        has_error_handling: bool = False,
        has_type_annotations: bool = False,
        findings: Optional[List[str]] = None,
        security_findings: Optional[List[SecurityFinding]] = None,
    ):
        self.language = language
        self.loc = loc
        self.function_count = function_count
        self.class_count = class_count
        self.avg_complexity = avg_complexity
        self.max_complexity = max_complexity
        self.high_complexity_count = high_complexity_count
        self.has_error_handling = has_error_handling
        self.has_type_annotations = has_type_annotations
        self.findings = findings or []
        self.security_findings = security_findings or []


class BaseSourceAnalyzer(ABC):
    """Abstract base class for language-specific static source analyzers."""

    @abstractmethod
    def can_analyze(self, filename: str) -> bool:
        """Check if analyzer supports this file extension."""
        pass

    @abstractmethod
    def analyze(self, filename: str, content: str) -> AnalyzerResult:
        """Perform static analysis on file source code."""
        pass

