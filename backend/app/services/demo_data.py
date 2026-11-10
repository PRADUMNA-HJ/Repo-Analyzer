from datetime import datetime, timezone
from typing import List
from app.schemas.analysis import (
    DetailedProjectAnalysis,
    LanguageBreakdown,
    TechnologyCategory,
    EvaluationCriterion,
    AnalysisResponse,
    AnalysisType,
)


def get_demo_projects() -> List[DetailedProjectAnalysis]:
    return [
        DetailedProjectAnalysis(
            id="campus-event-management-system",
            name="campus-event-mgmt",
            display_name="Campus Event Management System",
            description="Enterprise student engagement platform featuring real-time ticketing, QR-code check-ins, automated RSVP reminders, and administrative analytics dashboards.",
            repo_url="https://github.com/fictional-demo-org/campus-event-mgmt",
            overall_score=9.1,
            rank=1,
            summary="Exceptional full-stack architecture demonstrating production-grade separation of concerns, comprehensive automated test suites (89% coverage), structured database migrations, and clean API design.",
            stars=142,
            forks=38,
            primary_language="TypeScript",
            updated_at="2026-10-18T14:30:00Z",
            problem_solved="Eliminates fragmented spreadsheets and manual queues in collegiate extracurricular scheduling through unified ticketing, verified attendance tracking, and capacity enforcement.",
            key_features=[
                "Role-based access control (RBAC) separating Student, Organizer, and Dean portals",
                "Dynamic QR code generation with cryptographic nonce validation for single-use ticket scans",
                "Asynchronous batch notification worker processing queue with Redis & Celery",
                "Interactive attendance heatmaps and demographic analytics for university administrators",
                "Stripe integration sandbox for paid workshop registrations and ticket refunds"
            ],
            architecture_notes="Clean layered architecture isolating presentation, domain services, and repository layers. Features containerized microservices managed via Docker Compose and asynchronous background workers.",
            tech_stack=[
                TechnologyCategory(category="Frontend", items=["React 18", "TypeScript", "Tailwind CSS", "React Query", "Recharts"]),
                TechnologyCategory(category="Backend API", items=["FastAPI", "Python 3.12", "Pydantic v2", "Uvicorn", "Celery"]),
                TechnologyCategory(category="Database & Cache", items=["PostgreSQL 16", "SQLAlchemy 2.0", "Alembic", "Redis 7.2"]),
                TechnologyCategory(category="DevOps & Tools", items=["Docker", "Docker Compose", "GitHub Actions CI", "Pytest", "Jest"])
            ],
            language_breakdown=[
                LanguageBreakdown(name="TypeScript", percentage=46.5, color="#3178C6", bytes_count=215400),
                LanguageBreakdown(name="Python", percentage=38.2, color="#3572A5", bytes_count=177000),
                LanguageBreakdown(name="SQL", percentage=8.5, color="#E38C00", bytes_count=39400),
                LanguageBreakdown(name="CSS / HTML", percentage=6.8, color="#563D7C", bytes_count=31500),
            ],
            criteria_breakdown=[
                EvaluationCriterion(
                    id="code-quality",
                    name="Code Quality & Maintainability",
                    weight=20,
                    score=9.3,
                    max_score=10.0,
                    rating_label="Exceptional",
                    description="Clarity, modularity, type safety, linting discipline, and adherence to clean coding principles.",
                    findings=[
                        "Strict TypeScript typing with zero 'any' fallbacks detected in application modules",
                        "Consistent PEP 8 compliance enforced through Ruff and Black pre-commit hooks",
                        "High cohesion across domain modules with clean dependency injection patterns"
                    ]
                ),
                EvaluationCriterion(
                    id="architecture",
                    name="Architecture & Structure",
                    weight=15,
                    score=9.2,
                    max_score=10.0,
                    rating_label="Exceptional",
                    description="Repository layout, layer decoupling, scalability patterns, and structural integrity.",
                    findings=[
                        "Domain-driven folder isolation separating API routes, business schemas, and persistence",
                        "Proper decoupling between synchronous HTTP handlers and background task queues",
                        "Repository pattern isolates database queries cleanly from endpoint controllers"
                    ]
                ),
                EvaluationCriterion(
                    id="functionality",
                    name="Functionality & Implementation",
                    weight=15,
                    score=9.0,
                    max_score=10.0,
                    rating_label="Exceptional",
                    description="Completeness of core features, edge-case resilience, and business logic execution.",
                    findings=[
                        "Complete end-to-end user workflows for organizers, attendees, and admins",
                        "Graceful edge-case handling for concurrent registrations and waitlists",
                        "Valid idempotency keys applied to registration and payment mutations"
                    ]
                ),
                EvaluationCriterion(
                    id="technology",
                    name="Technology Usage",
                    weight=10,
                    score=9.4,
                    max_score=10.0,
                    rating_label="Cutting-edge",
                    description="Modern tool choices, appropriate library selection, and idiomatic ecosystem usage.",
                    findings=[
                        "Leveraged modern asynchronous Python (FastAPI + asyncpg) for high-throughput concurrency",
                        "Modern client-side data synchronization via React Query with optimistic UI updates",
                        "Utilized Redis pub/sub for real-time ticket availability streaming"
                    ]
                ),
                EvaluationCriterion(
                    id="testing",
                    name="Testing & Reliability",
                    weight=10,
                    score=8.7,
                    max_score=10.0,
                    rating_label="Very Strong",
                    description="Unit, integration, and E2E test coverage, CI pipeline automation, and assertions.",
                    findings=[
                        "89% automated test coverage across backend business logic via Pytest",
                        "Component test suites implemented using Vitest and React Testing Library",
                        "GitHub Actions pipeline verifies linters and test suites on every pull request"
                    ]
                ),
                EvaluationCriterion(
                    id="security",
                    name="Security Practices",
                    weight=10,
                    score=9.0,
                    max_score=10.0,
                    rating_label="Exceptional",
                    description="Authentication, authorization, secret handling, input sanitization, and vulnerability mitigation.",
                    findings=[
                        "Cryptographically salted Argon2 password hashing and secure HttpOnly JWT tokens",
                        "Parameterized queries prevent SQL injection across all database touchpoints",
                        "CORS policies and Content Security Headers explicitly configured"
                    ]
                ),
                EvaluationCriterion(
                    id="documentation",
                    name="Documentation",
                    weight=10,
                    score=9.1,
                    max_score=10.0,
                    rating_label="Exceptional",
                    description="README clarity, installation guides, architectural diagrams, and API docs.",
                    findings=[
                        "Extensive README featuring architecture diagrams, environment setup, and demo GIFs",
                        "Interactive OpenAPI (Swagger) documentation generated automatically with descriptive schemas",
                        "Comprehensive CONTRIBUTING.md guide with local Docker bootstrapping steps"
                    ]
                ),
                EvaluationCriterion(
                    id="activity",
                    name="Development Activity & Completeness",
                    weight=10,
                    score=9.1,
                    max_score=10.0,
                    rating_label="Exceptional",
                    description="Commit frequency, branch strategy, issue tracking, and overall project maturity.",
                    findings=[
                        "Meaningful conventional commits (feat:, fix:, docs:) distributed across 6 months",
                        "Feature branches and resolved pull requests showcasing collaborative workflow",
                        "Tagged semver releases accompanied by changelog documentation"
                    ]
                ),
            ],
            strengths=[
                "Exemplary architecture separating presentation, business domain, and persistence layers",
                "Strong test culture with 89% branch coverage and robust GitHub Actions CI workflows",
                "Clean cryptographic QR-code verification protocol preventing attendance fraud",
                "Production-ready Docker Compose orchestration enabling instant one-command onboarding"
            ],
            weaknesses=[
                "Email delivery service lacks an exponential backoff retry mechanism for failed SMTP handshakes",
                "Frontend bundle size could be improved by lazy loading administrative analytics charts",
                "Missing rate limiting headers on public ticket inquiry endpoints"
            ],
            recommendations=[
                "Implement Redis-based leaky-bucket rate limiting middleware for public ticketing routes",
                "Adopt route-based code splitting using React.lazy() to reduce initial client bundle by ~35%",
                "Integrate Prometheus metrics instrumentation to track HTTP latency percentiles (p95/p99)"
            ]
        ),
        DetailedProjectAnalysis(
            id="smart-disaster-response-platform",
            name="disaster-response-coord",
            display_name="Smart Disaster Response Platform",
            description="Geospatial emergency coordination system providing civilian distress dispatch, offline SMS relays, emergency shelter routing, and resource allocation mapping.",
            repo_url="https://github.com/fictional-demo-org/disaster-response-coord",
            overall_score=8.6,
            rank=2,
            summary="Impressive domain application of geospatial analysis, resilient peer-to-peer offline caching, and real-time incident triaging. Demonstrates high technical complexity and mission-critical engineering.",
            stars=98,
            forks=24,
            primary_language="Python",
            updated_at="2026-09-24T11:15:00Z",
            problem_solved="Coordinates first responders and civilians during severe weather outages when traditional cellular communication channels experience intermittent latency or failure.",
            key_features=[
                "Geographic heat mapping using PostGIS spatial queries for rapid triage zoning",
                "Offline-first Progressive Web App (PWA) with IndexedDB incident queueing",
                "WebSocket pub/sub dispatch grid synchronizing emergency responder coordinates",
                "Automated severity priority scoring based on civilian triage checklist inputs",
                "Exportable incident logs formatted for National Incident Management System (NIMS) audit"
            ],
            architecture_notes="Event-driven architecture combining FastAPI WebSockets for push notifications with PostGIS spatial database for geometric boundary computations. Resilient service worker caching on client.",
            tech_stack=[
                TechnologyCategory(category="Frontend", items=["React", "TypeScript", "Leaflet.js", "Tailwind CSS", "Workbox PWA"]),
                TechnologyCategory(category="Backend & GIS", items=["Python 3.12", "FastAPI", "GeoPandas", "Shapely", "WebSockets"]),
                TechnologyCategory(category="Database", items=["PostgreSQL 16", "PostGIS", "SQLAlchemy", "Redis"]),
                TechnologyCategory(category="Testing & Infra", items=["Pytest", "Docker", "Nginx", "GitHub Actions"])
            ],
            language_breakdown=[
                LanguageBreakdown(name="Python", percentage=54.8, color="#3572A5", bytes_count=248000),
                LanguageBreakdown(name="TypeScript", percentage=31.4, color="#3178C6", bytes_count=142000),
                LanguageBreakdown(name="SQL (PostGIS)", percentage=9.2, color="#E38C00", bytes_count=41600),
                LanguageBreakdown(name="Shell", percentage=4.6, color="#89E051", bytes_count=20800),
            ],
            criteria_breakdown=[
                EvaluationCriterion(
                    id="code-quality",
                    name="Code Quality & Maintainability",
                    weight=20,
                    score=8.5,
                    max_score=10.0,
                    rating_label="Very Strong",
                    description="Clarity, modularity, type safety, linting discipline, and adherence to clean coding principles.",
                    findings=[
                        "Clean type annotations across backend FastAPI schemas and spatial calculators",
                        "Modular separation between geospatial computation utilities and endpoint routers",
                        "Minor opportunities for refactoring in long WebSocket connection handlers"
                    ]
                ),
                EvaluationCriterion(
                    id="architecture",
                    name="Architecture & Structure",
                    weight=15,
                    score=8.8,
                    max_score=10.0,
                    rating_label="Very Strong",
                    description="Repository layout, layer decoupling, scalability patterns, and structural integrity.",
                    findings=[
                        "Effective event-driven WebSocket pub/sub design for live incident dispatch",
                        "Clean integration with spatial database extensions via PostGIS functions",
                        "Client service worker architecture provides true offline resilience"
                    ]
                ),
                EvaluationCriterion(
                    id="functionality",
                    name="Functionality & Implementation",
                    weight=15,
                    score=8.9,
                    max_score=10.0,
                    rating_label="Very Strong",
                    description="Completeness of core features, edge-case resilience, and business logic execution.",
                    findings=[
                        "Robust real-world disaster relief workflows with severity triage scoring",
                        "Offline dispatch synchronization succeeds seamlessly once connectivity resumes",
                        "Accurate spatial distance calculations to nearest operational triage shelters"
                    ]
                ),
                EvaluationCriterion(
                    id="technology",
                    name="Technology Usage",
                    weight=10,
                    score=9.1,
                    max_score=10.0,
                    rating_label="Exceptional",
                    description="Modern tool choices, appropriate library selection, and idiomatic ecosystem usage.",
                    findings=[
                        "Advanced PostGIS spatial queries (ST_DWithin, ST_Contains) executed efficiently",
                        "Native HTML5 Geolocation API coupled with Leaflet vector rendering",
                        "Asynchronous WebSocket broadcasting with Redis backplane"
                    ]
                ),
                EvaluationCriterion(
                    id="testing",
                    name="Testing & Reliability",
                    weight=10,
                    score=8.0,
                    max_score=10.0,
                    rating_label="Strong",
                    description="Unit, integration, and E2E test coverage, CI pipeline automation, and assertions.",
                    findings=[
                        "78% test coverage with automated unit tests for spatial triage calculations",
                        "Mock WebSocket testing harness validates event broadcast distribution",
                        "Integration tests would benefit from simulated network drop-out scenarios"
                    ]
                ),
                EvaluationCriterion(
                    id="security",
                    name="Security Practices",
                    weight=10,
                    score=8.4,
                    max_score=10.0,
                    rating_label="Strong",
                    description="Authentication, authorization, secret handling, input sanitization, and vulnerability mitigation.",
                    findings=[
                        "Secure token authentication on both REST and WebSocket upgrade handshakes",
                        "GPS coordinate inputs rigorously validated against geo-fencing bounding boxes",
                        "Sensitive responder contact details masked for unauthorized civilian roles"
                    ]
                ),
                EvaluationCriterion(
                    id="documentation",
                    name="Documentation",
                    weight=10,
                    score=8.6,
                    max_score=10.0,
                    rating_label="Very Strong",
                    description="README clarity, installation guides, architectural diagrams, and API docs.",
                    findings=[
                        "Clear architectural diagrams explaining the offline sync and WebSocket bridge",
                        "Detailed Docker setup guide with pre-seeded sample geographic GIS shapefiles",
                        "Documented incident priority classification schema"
                    ]
                ),
                EvaluationCriterion(
                    id="activity",
                    name="Development Activity & Completeness",
                    weight=10,
                    score=8.5,
                    max_score=10.0,
                    rating_label="Very Strong",
                    description="Commit frequency, branch strategy, issue tracking, and overall project maturity.",
                    findings=[
                        "Consistent development history spanning two academic semesters",
                        "Clear milestone tracking with issues linked to pull requests",
                        "Active changelog updates for minor and patch releases"
                    ]
                ),
            ],
            strengths=[
                "High real-world social impact and technical sophistication utilizing spatial algorithms",
                "Resilient offline-first capability ensuring functionality during simulated connectivity loss",
                "Low-latency real-time responder telemetry via optimized WebSocket message protocols",
                "Well-documented GIS installation scripts including automated PostGIS migration seeding"
            ],
            weaknesses=[
                "Automated end-to-end integration test coverage sits slightly below target at 78%",
                "Lack of automated tile pre-caching mechanism for low-bandwidth vector map layers",
                "WebSocket connection recovery logic lacks randomized jitter during mass reconnection"
            ],
            recommendations=[
                "Implement exponential backoff with jitter on frontend WebSocket reconnect attempts",
                "Introduce vector tile pre-fetching to enable offline map pan and zoom capabilities",
                "Increase integration test suite coverage focusing on high-concurrency dispatch simulations"
            ]
        ),
        DetailedProjectAnalysis(
            id="ai-powered-learning-assistant",
            name="adaptive-study-copilot",
            display_name="AI-Powered Learning Assistant",
            description="Personalized pedagogical study system that digests lecture transcripts and textbooks to produce interactive knowledge graphs, flashcards, and Socratic dialogues.",
            repo_url="https://github.com/fictional-demo-org/adaptive-study-copilot",
            overall_score=8.2,
            rank=3,
            summary="Creative application of Retrieval-Augmented Generation (RAG) and spaced repetition algorithms. Well-engineered vector indexing pipeline with clean citation attribution.",
            stars=76,
            forks=19,
            primary_language="Python",
            updated_at="2026-08-30T16:45:00Z",
            problem_solved="Prevents superficial rote memorization by prompting students through guided Socratic questioning and dynamically scheduled SuperMemo-2 (SM-2) spaced repetition cycles.",
            key_features=[
                "Document chunking and vector embedding pipeline supporting PDF and EPUB formats",
                "Retrieval-Augmented Generation (RAG) citing exact page numbers and paragraphs",
                "Interactive concept knowledge graph rendered via D3-force network graph",
                "SM-2 algorithmic scheduler optimizing daily active recall flashcard decks",
                "Voice-to-text transcript analyzer highlighting key lecture definitions and exam hints"
            ],
            architecture_notes="Modular RAG pipeline utilizing LangChain, ChromaDB vector persistence, and FastAPI streaming responses. Client-side state managed via Zustand.",
            tech_stack=[
                TechnologyCategory(category="Frontend", items=["React", "TypeScript", "Tailwind CSS", "D3.js", "Zustand"]),
                TechnologyCategory(category="AI & NLP Pipeline", items=["LangChain", "ChromaDB", "Sentence-Transformers", "PyPDF", "OpenAI API"]),
                TechnologyCategory(category="Backend API", items=["FastAPI", "Python 3.12", "Pydantic", "Uvicorn"]),
                TechnologyCategory(category="Infrastructure", items=["Docker", "Pytest", "Poetry", "GitHub Actions"])
            ],
            language_breakdown=[
                LanguageBreakdown(name="Python", percentage=61.2, color="#3572A5", bytes_count=198000),
                LanguageBreakdown(name="TypeScript", percentage=28.5, color="#3178C6", bytes_count=92000),
                LanguageBreakdown(name="CSS", percentage=5.9, color="#563D7C", bytes_count=19000),
                LanguageBreakdown(name="Dockerfile", percentage=4.4, color="#384D54", bytes_count=14200),
            ],
            criteria_breakdown=[
                EvaluationCriterion(
                    id="code-quality",
                    name="Code Quality & Maintainability",
                    weight=20,
                    score=8.2,
                    max_score=10.0,
                    rating_label="Very Strong",
                    description="Clarity, modularity, type safety, linting discipline, and adherence to clean coding principles.",
                    findings=[
                        "Clean abstract base classes defining vector store and LLM provider interfaces",
                        "Structured Pydantic validation on all incoming query payloads and RAG responses",
                        "Occasional hardcoded prompt strings could be extracted into external template files"
                    ]
                ),
                EvaluationCriterion(
                    id="architecture",
                    name="Architecture & Structure",
                    weight=15,
                    score=8.1,
                    max_score=10.0,
                    rating_label="Very Strong",
                    description="Repository layout, layer decoupling, scalability patterns, and structural integrity.",
                    findings=[
                        "Decoupled document ingestion worker from live query answering endpoint",
                        "Interface isolation enables swapping local Ollama models with cloud LLM providers",
                        "Chunking strategy implements recursive token splitting with configurable overlap"
                    ]
                ),
                EvaluationCriterion(
                    id="functionality",
                    name="Functionality & Implementation",
                    weight=15,
                    score=8.4,
                    max_score=10.0,
                    rating_label="Very Strong",
                    description="Completeness of core features, edge-case resilience, and business logic execution.",
                    findings=[
                        "Accurate source attribution citations returned with confidence scores",
                        "SuperMemo-2 spaced repetition formula correctly schedules review intervals",
                        "Knowledge graph visualizes conceptual dependencies between syllabus chapters"
                    ]
                ),
                EvaluationCriterion(
                    id="technology",
                    name="Technology Usage",
                    weight=10,
                    score=8.8,
                    max_score=10.0,
                    rating_label="Very Strong",
                    description="Modern tool choices, appropriate library selection, and idiomatic ecosystem usage.",
                    findings=[
                        "Modern local vector indexing using ChromaDB with cosine distance metrics",
                        "Server-Sent Events (SSE) streaming tokens to the client with low first-token latency",
                        "Interactive D3 force-directed visualizer with physics collision avoidance"
                    ]
                ),
                EvaluationCriterion(
                    id="testing",
                    name="Testing & Reliability",
                    weight=10,
                    score=7.6,
                    max_score=10.0,
                    rating_label="Good",
                    description="Unit, integration, and E2E test coverage, CI pipeline automation, and assertions.",
                    findings=[
                        "72% test coverage verifying chunking logic, SM-2 math, and API input validation",
                        "Mock LLM responses used in integration tests to avoid live external API fees",
                        "Test suite lacks coverage for large file upload timeouts and PDF corruption edges"
                    ]
                ),
                EvaluationCriterion(
                    id="security",
                    name="Security Practices",
                    weight=10,
                    score=8.0,
                    max_score=10.0,
                    rating_label="Strong",
                    description="Authentication, authorization, secret handling, input sanitization, and vulnerability mitigation.",
                    findings=[
                        "Environment variable injection ensures API keys are never checked into git history",
                        "User prompt sanitization prevents basic prompt injection attempts",
                        "Uploaded PDF files validated against magic byte signatures before parsing"
                    ]
                ),
                EvaluationCriterion(
                    id="documentation",
                    name="Documentation",
                    weight=10,
                    score=8.3,
                    max_score=10.0,
                    rating_label="Very Strong",
                    description="README clarity, installation guides, architectural diagrams, and API docs.",
                    findings=[
                        "Comprehensive README featuring step-by-step installation instructions for local models",
                        "Clear documentation of mathematical logic underpinning SM-2 repetition schedule",
                        "Detailed environment variable template (.env.example) included"
                    ]
                ),
                EvaluationCriterion(
                    id="activity",
                    name="Development Activity & Completeness",
                    weight=10,
                    score=8.2,
                    max_score=10.0,
                    rating_label="Very Strong",
                    description="Commit frequency, branch strategy, issue tracking, and overall project maturity.",
                    findings=[
                        "Regular commit cadence highlighting iterative algorithm refinement",
                        "Documented bug triage and benchmark comparisons between embedding models",
                        "Clear release notes corresponding to major model upgrades"
                    ]
                ),
            ],
            strengths=[
                "Modern generative AI implementation incorporating RAG with transparent citation attribution",
                "Pedagogically sound integration of the SuperMemo-2 active recall interval algorithm",
                "High-performance Server-Sent Events (SSE) token streaming for responsive UX",
                "Flexible architecture enabling plug-and-play local LLM models (e.g. Ollama, Llama 3)"
            ],
            weaknesses=[
                "Automated test coverage currently at 72%, particularly requiring more PDF parsing edge cases",
                "Vector database is locally disk-persisted and lacks distributed multi-replica support",
                "Long PDF ingestion processes can cause temporary memory spikes in container"
            ],
            recommendations=[
                "Introduce async task worker queue (e.g., Celery or RQ) for heavy document ingestion",
                "Add evaluation benchmarks using RAGAS framework to quantitatively grade response accuracy",
                "Increase test coverage for malformed PDF and non-UTF8 document uploads"
            ]
        ),
    ]


def build_demo_response(target_type: AnalysisType, target_identifier: str) -> AnalysisResponse:
    projects = get_demo_projects()

    # If the user requested a specific single repository, we can tailor the response to that project
    if target_type == AnalysisType.REPOSITORY:
        matching = [p for p in projects if target_identifier.lower().endswith(p.name.lower())]
        if matching:
            selected_projects = matching
        else:
            # Default to the first demo project for illustrative purposes
            first = projects[0]
            selected_projects = [first]
        total_repos = 1
    else:
        selected_projects = projects
        total_repos = 14

    return AnalysisResponse(
        is_demo=True,
        target_type=target_type,
        target_identifier=target_identifier,
        total_repositories_found=total_repos,
        analyzed_projects=selected_projects,
        evaluation_date=datetime.now(timezone.utc).isoformat(),
        disclaimer=(
            "DEMO DATA: Phase 1 provides structured demonstration data to validate frontend/backend "
            "integration and UI layout. Real repository analysis will be activated in Phase 2."
        )
    )

