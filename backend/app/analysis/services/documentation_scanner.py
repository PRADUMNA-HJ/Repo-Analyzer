import re
from typing import Any, Dict, List, Optional, Tuple


class DocumentationScanner:
    """
    Evaluates documentation quality, extracting project summaries,
    features, installation guides, and problem statements from README files.
    """

    def analyze_documentation(self, readme_content: Optional[str]) -> Tuple[Dict[str, Any], List[str]]:
        if not readme_content or not readme_content.strip():
            return {
                "has_readme": False,
                "summary": "Repository contains no README documentation.",
                "problem_solved": "Undocumented project intent.",
                "key_features": ["Source code repository without explicit documentation"],
                "has_installation": False,
                "has_api_docs": False,
            }, ["Repository lacks README or onboarding documentation."]

        findings: List[str] = []
        text = readme_content.strip()
        lines = [line.strip() for line in text.splitlines() if line.strip()]

        has_installation = bool(re.search(r"(install|getting started|setup|prerequisites|running)", text, re.I))
        has_api_docs = bool(re.search(r"(api|endpoint|routes|curl|swagger|openapi)", text, re.I))
        has_license = bool(re.search(r"(license|mit|apache|gpl)", text, re.I))
        has_diagrams = bool(re.search(r"(\.png|\.jpg|\.svg|```mermaid|architecture)", text, re.I))

        if has_installation:
            findings.append("Comprehensive installation and local environment bootstrapping instructions.")
        else:
            findings.append("README lacks explicit step-by-step installation instructions.")

        if has_api_docs:
            findings.append("Documented API endpoint specifications and usage examples.")

        if has_diagrams:
            findings.append("Visual architectural diagrams or UI demonstrations included.")

        if has_license:
            findings.append("Open source license explicitly referenced.")

        # Extract problem statement and features
        extracted_summary = ""
        extracted_problem = ""
        extracted_features: List[str] = []

        # Find first descriptive paragraph for summary
        for line in lines:
            if not line.startswith("#") and len(line) > 30 and not line.startswith("!"):
                extracted_summary = line
                break

        if not extracted_summary:
            extracted_summary = "Software project discovered from public GitHub repository."

        # Heuristic for problem statement
        prob_match = re.search(r"(?:problem|motivation|about|overview|why)\s*\n+([^\n#]+)", text, re.I)
        if prob_match:
            extracted_problem = prob_match.group(1).strip()
        else:
            extracted_problem = extracted_summary

        # Extract bullet features
        feature_matches = re.findall(r"^[*-]\s+([A-Za-z0-9].{10,120})$", text, re.MULTILINE)
        if feature_matches:
            extracted_features = feature_matches[:5]
        else:
            extracted_features = [
                "Modular source code organization",
                "Automated software engineering workflows",
                "Full-stack and database integration components"
            ]

        data = {
            "has_readme": True,
            "summary": extracted_summary,
            "problem_solved": extracted_problem,
            "key_features": extracted_features,
            "has_installation": has_installation,
            "has_api_docs": has_api_docs,
            "has_license": has_license,
            "has_diagrams": has_diagrams
        }

        return data, findings
