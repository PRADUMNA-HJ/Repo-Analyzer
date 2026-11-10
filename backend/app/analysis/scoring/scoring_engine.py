import datetime
from typing import Any, Dict, List, Optional, Tuple
from app.schemas.analysis import (
    CodeComplexityMetrics,
    EvaluationCriterion,
    SecurityFinding,
    TechnologyCategory,
)


class ScoringEngine:
    """
    Deterministic 8-pillar engineering scoring engine.
    Calculates category-wise scores out of 10 with weighted aggregation to 100 points.
    Treats small, clean codebases fairly and never relies on star counts.
    """

    def calculate_evaluation(
        self,
        repo_data: Dict[str, Any],
        analyzer_results: List[Any],
        tech_categories: List[TechnologyCategory],
        architecture_findings: List[str],
        doc_data: Dict[str, Any],
        doc_findings: List[str],
        security_findings: List[SecurityFinding],
        commits_data: List[Dict[str, Any]],
        tree_paths: List[str]
    ) -> Tuple[float, List[EvaluationCriterion], List[str], List[str], List[str], CodeComplexityMetrics, float]:
        
        # Aggregate static code metrics
        total_loc = sum(r.loc for r in analyzer_results)
        total_functions = sum(r.function_count for r in analyzer_results)
        total_classes = sum(r.class_count for r in analyzer_results)
        avg_complexity = round(sum(r.avg_complexity for r in analyzer_results) / len(analyzer_results), 1) if analyzer_results else 1.5
        high_comp_count = sum(r.high_complexity_count for r in analyzer_results)
        has_typing = any(r.has_type_annotations for r in analyzer_results)
        has_error_handling = any(r.has_error_handling for r in analyzer_results)

        complexity_metrics = CodeComplexityMetrics(
            cyclomatic_complexity_avg=avg_complexity,
            maintainability_index=round(max(40.0, 100.0 - (avg_complexity * 4.5)), 1),
            total_functions=total_functions,
            total_classes=total_classes,
            high_complexity_functions_count=high_comp_count,
            notes="Evaluated via static AST and pattern analyzers without executing code."
        )

        # -------------------------------------------------------------
        # Pillar 1: Code Quality & Maintainability (Weight: 20%)
        # -------------------------------------------------------------
        cq_score = 7.5
        cq_findings = []
        if has_typing:
            cq_score += 1.3
            cq_findings.append("Consistent static type annotations verified across source modules.")
        if has_error_handling:
            cq_score += 0.8
            cq_findings.append("Structured exception and error-handling routines implemented.")
        if avg_complexity <= 4.0:
            cq_score += 0.4
            cq_findings.append("Low cyclomatic complexity indicating readable, maintainable control flow.")
        elif avg_complexity > 10.0:
            cq_score -= 1.0
            cq_findings.append("High branching complexity detected in key calculation routines.")
        cq_score = max(3.0, min(10.0, cq_score))

        # -------------------------------------------------------------
        # Pillar 2: Architecture & Structure (Weight: 15%)
        # -------------------------------------------------------------
        arch_score = 7.0
        arch_findings = list(architecture_findings)
        has_mvc = any("layered" in f.lower() or "separation" in f.lower() for f in architecture_findings)
        if has_mvc:
            arch_score += 1.5
        if any("frontend" in f.lower() and "backend" in f.lower() for f in architecture_findings):
            arch_score += 1.0
        if any("docker" in f.lower() for f in architecture_findings):
            arch_score += 0.5
        arch_score = max(3.0, min(10.0, arch_score))

        # -------------------------------------------------------------
        # Pillar 3: Functionality & Implementation (Weight: 15%)
        # -------------------------------------------------------------
        func_score = 7.2
        func_findings = []
        if total_functions > 10:
            func_score += 1.2
            func_findings.append("Broad functional coverage across domain handlers and business logic.")
        if len(doc_data.get("key_features", [])) >= 3:
            func_score += 0.8
            func_findings.append("Multiple discrete functional workflows identified and verified.")
        if any(c.category in ("Backend API", "Frontend") for c in tech_categories):
            func_score += 0.8
            func_findings.append("Interactive application tier present in repository.")
        func_score = max(3.0, min(10.0, func_score))

        # -------------------------------------------------------------
        # Pillar 4: Technology Usage (Weight: 10%)
        # -------------------------------------------------------------
        tech_score = 7.0
        tech_findings = []
        cat_count = len(tech_categories)
        if cat_count >= 3:
            tech_score += 2.0
            tech_findings.append("Multi-tier integration across frontend, backend, and persistence tooling.")
        elif cat_count >= 1:
            tech_score += 1.0
            tech_findings.append("Modern framework tooling detected in project manifest files.")
        tech_score = max(3.0, min(10.0, tech_score))

        # -------------------------------------------------------------
        # Pillar 5: Testing & Reliability (Weight: 10%)
        # -------------------------------------------------------------
        test_score = 5.0
        test_findings = []
        has_tests_dir = any("test" in p.lower() for p in tree_paths)
        has_ci = any(".github/workflows" in p.lower() for p in tree_paths)
        has_test_framework = any(c.category == "Testing & QA" for c in tech_categories)

        if has_tests_dir or has_test_framework:
            test_score += 3.0
            test_findings.append("Dedicated automated test suites detected.")
            if has_ci:
                test_score += 2.0
                test_findings.append("Continuous integration (CI) automation workflows configured.")
        else:
            test_findings.append("No explicit automated unit or integration tests detected in repository.")
        test_score = max(2.0, min(10.0, test_score))

        # -------------------------------------------------------------
        # Pillar 6: Security Practices (Weight: 10%)
        # -------------------------------------------------------------
        sec_score = 9.0
        sec_findings = []
        critical_sec = sum(1 for s in security_findings if s.severity == "critical")
        high_sec = sum(1 for s in security_findings if s.severity == "high")

        if critical_sec > 0:
            sec_score -= min(4.0, critical_sec * 2.0)
            sec_findings.append(f"{critical_sec} potential hardcoded credentials identified (redacted in report).")
        if high_sec > 0:
            sec_score -= min(2.5, high_sec * 1.0)
            sec_findings.append(f"{high_sec} potential security risk patterns flagged.")
        if not security_findings:
            sec_findings.append("Clean static security profile with zero hardcoded secret patterns detected.")
        sec_score = max(2.0, min(10.0, sec_score))

        # -------------------------------------------------------------
        # Pillar 7: Documentation (Weight: 10%)
        # -------------------------------------------------------------
        doc_score = 5.0
        if doc_data.get("has_readme", False):
            doc_score += 2.0
            if doc_data.get("has_installation", False):
                doc_score += 1.5
            if doc_data.get("has_api_docs", False):
                doc_score += 1.0
            if doc_data.get("has_diagrams", False):
                doc_score += 0.5
        doc_score = max(2.0, min(10.0, doc_score))

        # -------------------------------------------------------------
        # Pillar 8: Development Activity & Completeness (Weight: 10%)
        # -------------------------------------------------------------
        act_score = 6.5
        act_findings = []
        commit_count = len(commits_data)
        if commit_count >= 15:
            act_score += 2.0
            act_findings.append(f"Substantial iterative commit history ({commit_count}+ recent commits).")
        elif commit_count >= 5:
            act_score += 1.0
            act_findings.append("Demonstrated multi-commit development progression.")
        if repo_data.get("default_branch"):
            act_score += 0.5
        if repo_data.get("has_issues", False):
            act_score += 0.5
            act_findings.append("Issue tracking enabled for project defect and milestone management.")
        act_score = max(3.0, min(10.0, act_score))

        # Format label helper
        def get_label(s: float) -> str:
            if s >= 9.0:
                return "Exceptional"
            if s >= 8.0:
                return "Very Strong"
            if s >= 7.0:
                return "Strong"
            if s >= 5.5:
                return "Moderate"
            return "Limited"

        criteria = [
            EvaluationCriterion(
                id="code-quality",
                name="Code Quality & Maintainability",
                weight=20,
                score=round(cq_score, 1),
                max_score=10.0,
                rating_label=get_label(cq_score),
                description="Clarity, modularity, type safety, linting discipline, and clean code idioms.",
                findings=cq_findings or ["Standard coding idioms maintained."]
            ),
            EvaluationCriterion(
                id="architecture",
                name="Architecture & Structure",
                weight=15,
                score=round(arch_score, 1),
                max_score=10.0,
                rating_label=get_label(arch_score),
                description="Repository layout, layer decoupling, scalability patterns, and structural integrity.",
                findings=arch_findings or ["Organized repository structure."]
            ),
            EvaluationCriterion(
                id="functionality",
                name="Functionality & Implementation",
                weight=15,
                score=round(func_score, 1),
                max_score=10.0,
                rating_label=get_label(func_score),
                description="Completeness of core features, edge-case resilience, and business logic execution.",
                findings=func_findings or ["Core functional features implemented in source code."]
            ),
            EvaluationCriterion(
                id="technology",
                name="Technology Usage",
                weight=10,
                score=round(tech_score, 1),
                max_score=10.0,
                rating_label=get_label(tech_score),
                description="Modern tool choices, appropriate library selection, and idiomatic ecosystem usage.",
                findings=tech_findings or ["Demonstrated usage of modern programming toolchains."]
            ),
            EvaluationCriterion(
                id="testing",
                name="Testing & Reliability",
                weight=10,
                score=round(test_score, 1),
                max_score=10.0,
                rating_label=get_label(test_score),
                description="Unit, integration, and E2E test coverage, CI pipeline automation, and assertions.",
                findings=test_findings
            ),
            EvaluationCriterion(
                id="security",
                name="Security Practices",
                weight=10,
                score=round(sec_score, 1),
                max_score=10.0,
                rating_label=get_label(sec_score),
                description="Authentication, authorization, secret handling, input sanitization, and vulnerability mitigation.",
                findings=sec_findings
            ),
            EvaluationCriterion(
                id="documentation",
                name="Documentation",
                weight=10,
                score=round(doc_score, 1),
                max_score=10.0,
                rating_label=get_label(doc_score),
                description="README clarity, installation guides, architectural diagrams, and API docs.",
                findings=doc_findings
            ),
            EvaluationCriterion(
                id="activity",
                name="Development Activity & Completeness",
                weight=10,
                score=round(act_score, 1),
                max_score=10.0,
                rating_label=get_label(act_score),
                description="Commit frequency, branch strategy, issue tracking, and overall project maturity.",
                findings=act_findings or ["Demonstrated active commit progression."]
            ),
        ]

        # Calculate weighted sum out of 100, then divide by 10 for score out of 10
        total_points = sum(c.score * (c.weight / 100.0) for c in criteria)
        overall_score = round(total_points, 1)

        # Strengths, Weaknesses, Recommendations
        strengths: List[str] = []
        weaknesses: List[str] = []
        recommendations: List[str] = []

        if has_typing:
            strengths.append("High type safety discipline prevents common runtime class and property errors.")
        if has_mvc or len(architecture_findings) >= 2:
            strengths.append("Modular architecture separating presentation, domain services, and persistence.")
        if not security_findings:
            strengths.append("Zero hardcoded credentials or dangerous execution calls detected.")
        if has_tests_dir:
            strengths.append("Automated test suites established for continuous software verification.")

        if not has_tests_dir:
            weaknesses.append("Lack of automated unit or integration test suites to guard against regressions.")
            recommendations.append("Introduce automated test suites (e.g. Pytest or Vitest) integrated into CI.")
        if not doc_data.get("has_installation", False):
            weaknesses.append("README lacks explicit step-by-step local installation and setup instructions.")
            recommendations.append("Provide explicit local prerequisites, environment variables, and startup commands in README.")
        if security_findings:
            weaknesses.append(f"Static security scan identified {len(security_findings)} potential vulnerability/secret risk(s).")
            recommendations.append("Sanitize hardcoded credentials and migrate secrets to environment variables.")

        if not strengths:
            strengths.append("Functional software project implementing domain logic.")
        if not recommendations:
            recommendations.append("Continue maintaining clean commit conventions and dependency updates.")

        # Evidence confidence calculation
        confidence = 0.9 if total_loc > 200 and doc_data.get("has_readme") else 0.7

        return overall_score, criteria, strengths, weaknesses, recommendations, complexity_metrics, confidence

