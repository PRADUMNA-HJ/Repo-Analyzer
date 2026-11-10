# Evidence-Based 8-Pillar Scoring Methodology

RepoScope uses an objective, deterministic, evidence-based evaluation model designed to eliminate evaluator bias and vanity metric inflation (such as GitHub stars or commit spam).

---

## 1. The 8 Evaluation Pillars & Calibrated Weights

Each candidate project is evaluated independently across 8 distinct engineering dimensions. The weights total exactly 100%:

| Pillar ID | Pillar Name | Weight | Primary Engineering Indicators |
| :--- | :--- | :---: | :--- |
| `code-quality` | **Code Quality & Maintainability** | **20%** | Cyclomatic complexity, modularity, type annotation density, docstring coverage, consistent naming, low duplication. |
| `architecture` | **Architecture & Design** | **15%** | Multi-tier layering (MVC/domain/repository), full-stack separation, containerization (`Dockerfile`, `docker-compose`), CI workflows. |
| `functionality` | **Functionality & Engineering Depth** | **15%** | Business logic depth, API endpoints, data models, state handling, real problem solving. |
| `tech-stack` | **Technology Stack & Modern Practices** | **10%** | Modern frameworks, package manager hygiene, typing ecosystems (TypeScript, Python typing), ecosystem fit. |
| `testing` | **Testing & Quality Assurance** | **10%** | Test presence (pytest, jest, vitest, junit), test-to-code ratio, mock patterns, automated CI test execution. |
| `security` | **Security & Best Practices** | **10%** | Zero hardcoded secrets, input sanitization, safe shell invocation, defensive error handling, safe dependencies. |
| `documentation` | **Documentation & Presentation** | **10%** | Comprehensive README (problem statement, setup instructions, architecture notes, API specs), inline docstrings. |
| `activity` | **Project Activity & Longevity** | **10%** | Sustained commit frequency, clear commit messages, multiple releases/tags, active maintenance. |

---

## 2. Deterministic Score Computation

1. **Sub-Pillar Evaluation:**
   For each pillar $i \in \{1 \dots 8\}$, a raw score $S_i \in [0.0, 10.0]$ is computed based on verified structural findings and verified indicators.
   - Base credit is awarded for standard conventions.
   - Points are added for verified positive practices (e.g. strict type hints $+1.5$, comprehensive test suite $+3.0$, multi-tier layering $+2.5$).
   - Points are deducted for detected risks (e.g. dangerous `eval()` $-2.5$, exposed secret $-3.0$, monolithic unmodular files $-1.5$).
   - The raw score is clamped to the range $[1.0, 10.0]$.

2. **Weighted Composite Score:**
   The overall score $S_{\text{overall}}$ is calculated as:
   $$S_{\text{overall}} = \sum_{i=1}^{8} \left( S_i \times \frac{W_i}{100} \right)$$
   Where $W_i$ represents the percentage weight of pillar $i$ ($\sum W_i = 100$).

3. **Qualitative Rating Labels:**
   - **$9.0 - 10.0$:** Exceptional (Production-grade, publication/enterprise standard)
   - **$8.0 - 8.9$:** Very Strong (Solid architectural discipline, good testing, clean structure)
   - **$7.0 - 7.9$:** Strong (Functional, good structure with minor areas for improvement)
   - **$5.0 - 6.9$:** Moderate (Functional student project, limited tests or monolithic organization)
   - **$1.0 - 4.9$:** Needs Improvement (Minimal implementation, missing documentation, or critical code smells)

---

## 3. Confidence Rating Formulation

To reflect how thoroughly a project could be analyzed based on accessible files and rate limits, RepoScope attaches an explainable confidence rating:

$$\text{Confidence Score} = \min(1.0, 0.4 + 0.1 \times N_{\text{inspected\_files}} + 0.1 \times \mathbb{I}_{\text{manifest}} + 0.1 \times \mathbb{I}_{\text{readme}})$$

- **High ($\ge 0.8$):** Comprehensive tree scanned, manifests parsed, multiple source files statically analyzed.
- **Moderate ($0.6 - 0.79$):** Substantial inspection performed; some files excluded by size limit or tree depth.
- **Low ($< 0.6$):** Limited accessible code (e.g. single-file repo, shallow tree, or rate-limited fetch).

---

## 4. Candidate Ranking & Tie-Breaking Hierarchy

When an entire GitHub profile is analyzed, RepoScope evaluates all non-excluded candidate projects and selects the **Top 3**:

1. **Primary Key:** Composite Score $S_{\text{overall}}$ (descending).
2. **First Tie-Breaker:** Code Quality & Maintainability score (20% weight pillar).
3. **Second Tie-Breaker:** Architecture & Design score (15% weight pillar).
4. **Third Tie-Breaker:** Testing & QA score (10% weight pillar).
5. **Fourth Tie-Breaker:** Recency of last commit.

> [!NOTE]
> **GitHub Stars are deliberately excluded as a primary ranking metric.** A high-quality student project with 0 stars will rightfully rank higher than a superficial popular fork or meme repository.

