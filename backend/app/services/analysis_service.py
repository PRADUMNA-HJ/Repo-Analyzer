import asyncio
from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status

from app.analysis.analyzers.base import AnalyzerResult
from app.analysis.analyzers.generic_analyzer import GenericSourceAnalyzer
from app.analysis.analyzers.javascript_analyzer import JavaScriptSourceAnalyzer
from app.analysis.analyzers.python_analyzer import PythonSourceAnalyzer
from app.analysis.scoring.ranking_service import ProjectRankingService
from app.analysis.scoring.scoring_engine import ScoringEngine
from app.analysis.services.architecture_scanner import ArchitectureScanner
from app.analysis.services.documentation_scanner import DocumentationScanner
from app.core.config import settings
from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisStage,
    AnalysisType,
    DetailedProjectAnalysis,
    EvidenceFileRef,
    UserProfileInfo,
)
from app.services.ai_explanation import AIExplanationService
from app.services.demo_data import build_demo_response
from app.services.github_client import (
    GitHubAPIError,
    GitHubClient,
    GitHubNotFoundError,
    GitHubRateLimitError,
)
from app.services.job_store import job_store
from app.services.repository_discovery import RepositoryDiscoveryService
from app.services.source_inspection import SourceInspectionService
from app.utils.github_validator import validate_and_parse_github_url

logger = logging.getLogger("reposcope.service")


class AnalysisService:
    """
    Core analysis service orchestrating GitHub crawling, source code inspection,
    static analysis, 8-pillar scoring, and project ranking.
    """

    def __init__(self, demo_mode: Optional[bool] = None) -> None:
        self.default_demo_mode = demo_mode if demo_mode is not None else settings.DEMO_MODE
        self.github_client = GitHubClient()
        self.discovery_service = RepositoryDiscoveryService()
        self.source_inspector = SourceInspectionService()
        self.architecture_scanner = ArchitectureScanner()
        self.doc_scanner = DocumentationScanner()
        self.scoring_engine = ScoringEngine()
        self.ranking_service = ProjectRankingService()
        self.ai_service = AIExplanationService()

        # Language analyzers
        self.analyzers = [
            PythonSourceAnalyzer(),
            JavaScriptSourceAnalyzer(),
            GenericSourceAnalyzer(),
        ]

    def _determine_demo_mode(self, request: AnalysisRequest) -> bool:
        if request.demo_mode is not None:
            return request.demo_mode
        return self.default_demo_mode

    async def execute_real_analysis(
        self,
        target_type: AnalysisType,
        username: str,
        repo_name: Optional[str] = None,
        analysis_id: Optional[str] = None
    ) -> AnalysisResponse:
        """Executes real GitHub repository inspection and scoring."""

        async def update_stage(stage: AnalysisStage, percent: int, msg: str):
            if analysis_id:
                await job_store.update_job(analysis_id, stage, percent, msg)

        await update_stage(AnalysisStage.FETCHING_REPOSITORIES, 10, "Fetching GitHub profile & repositories...")

        user_profile: Optional[UserProfileInfo] = None
        raw_repositories: List[Dict[str, Any]] = []

        try:
            if target_type == AnalysisType.PROFILE:
                try:
                    u_data = await self.github_client.get_user(username)
                    user_profile = UserProfileInfo(
                        username=u_data.get("login", username),
                        name=u_data.get("name"),
                        avatar_url=u_data.get("avatar_url"),
                        bio=u_data.get("bio"),
                        public_repos_count=u_data.get("public_repos", 0),
                        followers=u_data.get("followers", 0),
                        html_url=u_data.get("html_url", f"https://github.com/{username}")
                    )
                except GitHubNotFoundError:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"GitHub user profile '{username}' does not exist or is private."
                    )
                raw_repositories = await self.github_client.get_all_user_repos(username)
            else:
                # Single repository target
                try:
                    r_data = await self.github_client.get_repo(username, repo_name or "")
                    raw_repositories = [r_data]
                    owner_obj = r_data.get("owner", {})
                    user_profile = UserProfileInfo(
                        username=owner_obj.get("login", username),
                        avatar_url=owner_obj.get("avatar_url"),
                        html_url=owner_obj.get("html_url", f"https://github.com/{username}")
                    )
                except GitHubNotFoundError:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"GitHub repository '{username}/{repo_name}' does not exist or is private."
                    )

        except GitHubRateLimitError as rle:
            raise HTTPException(status_code=429, detail=rle.message)
        except GitHubAPIError as gae:
            raise HTTPException(status_code=gae.status_code or 502, detail=gae.message)

        await update_stage(AnalysisStage.FILTERING_REPOSITORIES, 25, "Filtering candidate software engineering projects...")

        candidates, excluded = self.discovery_service.filter_and_rank_candidates(raw_repositories)
        target_identifier = f"{username}/{repo_name}" if repo_name else username

        if not candidates:
            # No eligible projects found
            resp = AnalysisResponse(
                is_demo=False,
                target_type=target_type,
                target_identifier=target_identifier,
                total_repositories_found=len(raw_repositories),
                analyzed_projects=[],
                evaluation_date=datetime.now(timezone.utc).isoformat(),
                disclaimer="Real GitHub analysis completed: No qualifying original software projects met the analysis thresholds.",
                user_profile=user_profile,
                excluded_repositories=excluded,
                status=AnalysisStage.COMPLETED
            )
            if analysis_id:
                await job_store.update_job(analysis_id, AnalysisStage.COMPLETED, 100, "Analysis complete.", result=resp)
            return resp

        # Select top candidates to inspect in detail
        projects_to_inspect = candidates[:settings.MAX_CONCURRENT_REPOSITORIES]
        analyzed_projects: List[DetailedProjectAnalysis] = []

        await update_stage(AnalysisStage.INSPECTING_SOURCE, 40, "Inspecting repository trees, manifests & entrypoints...")

        for repo_idx, repo in enumerate(projects_to_inspect):
            r_name = repo.get("name", "project")
            r_owner = repo.get("owner", {}).get("login", username)
            r_branch = repo.get("default_branch", "main")
            r_url = repo.get("html_url", f"https://github.com/{r_owner}/{r_name}")

            # 1. Fetch file tree
            tree = await self.github_client.get_repo_tree(r_owner, r_name, r_branch)
            tree_paths = [item.get("path", "") for item in tree if item.get("type") == "blob"]
            selected_items = self.source_inspector.filter_tree_and_select_files(tree)

            # 2. Fetch language statistics
            lang_bytes = await self.github_client.get_repo_languages(r_owner, r_name)
            inspected_exts = [p[p.rfind("."):].lower() for p in tree_paths if "." in p]

            from app.services.tech_detector import TechnologyDetector
            detector = TechnologyDetector()
            lang_breakdown = detector.calculate_language_breakdown(lang_bytes, inspected_exts)

            # 3. Fetch README & commit history
            readme_content = await self.github_client.get_repo_readme(r_owner, r_name)
            commits_data = await self.github_client.get_repo_commits(r_owner, r_name)

            # 4. Fetch content for selected manifests and sample source files
            manifest_contents: Dict[str, str] = {}
            source_analyzer_results: List[AnalyzerResult] = []
            evidence_files: List[EvidenceFileRef] = []

            for item in selected_items[:20]:
                f_path = item.get("path", "")
                f_cat = item.get("category", "source")
                content = await self.github_client.get_raw_file_content(r_owner, r_name, f_path, r_branch)

                if content:
                    if f_cat == "manifest":
                        manifest_contents[f_path] = content

                    evidence_files.append(EvidenceFileRef(
                        path=f_path,
                        category=f_cat,
                        description=f"Inspected for {f_cat} structure and static metrics"
                    ))

                    # Run static source analyzers
                    for analyzer in self.analyzers:
                        if analyzer.can_analyze(f_path):
                            res = analyzer.analyze(f_path, content)
                            source_analyzer_results.append(res)
                            break

            # 5. Technology detection
            tech_cats, _ = detector.detect_technologies_from_manifests(manifest_contents, tree_paths)

            # 6. Architecture & documentation scanning
            arch_notes, arch_findings = self.architecture_scanner.analyze_architecture(tree_paths)
            doc_data, doc_findings = self.doc_scanner.analyze_documentation(readme_content)

            # Collect security findings
            all_sec_findings = []
            for r in source_analyzer_results:
                all_sec_findings.extend(r.security_findings)

            await update_stage(AnalysisStage.EVALUATING_PROJECTS, 65 + (repo_idx * 10), f"Evaluating engineering quality for {r_name}...")

            # 7. Scoring Engine
            (
                overall_score,
                criteria,
                strengths,
                weaknesses,
                recommendations,
                complexity_metrics,
                confidence
            ) = self.scoring_engine.calculate_evaluation(
                repo_data=repo,
                analyzer_results=source_analyzer_results,
                tech_categories=tech_cats,
                architecture_findings=arch_findings,
                doc_data=doc_data,
                doc_findings=doc_findings,
                security_findings=all_sec_findings,
                commits_data=commits_data,
                tree_paths=tree_paths
            )

            primary_lang = repo.get("language") or (lang_breakdown[0].name if lang_breakdown else "Unknown")
            description = repo.get("description") or doc_data.get("summary", "Software project repository.")

            # Optional AI enhancement for executive summary
            summary = await self.ai_service.enhance_summary(
                project_name=r_name,
                tech_stack=[item for c in tech_cats for item in c.items][:6],
                deterministic_summary=doc_data.get("summary", description),
                problem_solved=doc_data.get("problem_solved", description),
                readme_snippet=readme_content or ""
            )

            display_name = r_name.replace("-", " ").replace("_", " ").title()

            project_model = DetailedProjectAnalysis(
                id=r_name.lower(),
                name=r_name,
                display_name=display_name,
                description=description,
                repo_url=r_url,
                overall_score=overall_score,
                rank=repo_idx + 1,
                summary=summary,
                stars=repo.get("stargazers_count", 0),
                forks=repo.get("forks_count", 0),
                primary_language=primary_lang,
                updated_at=repo.get("updated_at", datetime.now(timezone.utc).isoformat()),
                problem_solved=doc_data.get("problem_solved", description),
                key_features=doc_data.get("key_features", ["Modular software implementation"]),
                architecture_notes=arch_notes,
                tech_stack=tech_cats,
                language_breakdown=lang_breakdown,
                criteria_breakdown=criteria,
                strengths=strengths,
                weaknesses=weaknesses,
                recommendations=recommendations,
                confidence_score=confidence,
                confidence_label="High" if confidence >= 0.8 else "Moderate",
                complexity_metrics=complexity_metrics,
                security_findings=all_sec_findings,
                evidence_files=evidence_files,
                is_fork=repo.get("fork", False),
                default_branch=r_branch
            )
            analyzed_projects.append(project_model)

        await update_stage(AnalysisStage.RANKING_PROJECTS, 90, "Ranking candidate showcase projects...")

        # Rank projects using deterministic tie-breaking
        ranked_projects = self.ranking_service.rank_projects(analyzed_projects)

        await update_stage(AnalysisStage.GENERATING_REPORT, 95, "Synthesizing evaluation reports...")

        comparison_summary = (
            f"Successfully analyzed {len(ranked_projects)} engineering project(s) from GitHub. "
            f"Top project '{ranked_projects[0].display_name}' achieved a score of {ranked_projects[0].overall_score}/10.0."
        ) if ranked_projects else None

        final_response = AnalysisResponse(
            is_demo=False,
            target_type=target_type,
            target_identifier=target_identifier,
            total_repositories_found=len(raw_repositories),
            analyzed_projects=ranked_projects,
            evaluation_date=datetime.now(timezone.utc).isoformat(),
            disclaimer="REAL GITHUB ANALYSIS: Evaluated directly from GitHub public APIs and static source code inspection.",
            analysis_id=analysis_id,
            status=AnalysisStage.COMPLETED,
            user_profile=user_profile,
            excluded_repositories=excluded,
            comparison_summary=comparison_summary
        )

        if analysis_id:
            await job_store.update_job(
                analysis_id,
                AnalysisStage.COMPLETED,
                100,
                "Analysis completed successfully.",
                result=final_response
            )

        return final_response

    async def analyze_github_target(self, request: AnalysisRequest) -> AnalysisResponse:
        is_valid, target_type_str, username, repo_name = validate_and_parse_github_url(request.github_url)

        if not is_valid or not target_type_str or not username:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid GitHub URL. Must be a valid user profile or repository path on github.com."
            )

        target_type = AnalysisType(target_type_str)
        target_identifier = f"{username}/{repo_name}" if repo_name else username

        if self._determine_demo_mode(request):
            return build_demo_response(target_type=target_type, target_identifier=target_identifier)

        # Real GitHub Analysis
        return await self.execute_real_analysis(target_type, username, repo_name)


def get_analysis_service() -> AnalysisService:
    """FastAPI dependency provider."""
    return AnalysisService()
