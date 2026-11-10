# Static Code Analysis Engine

The RepoScope static analysis engine inspects candidate software repositories without executing any remote code. It extracts objective, reproducible metrics across architectural layers, code modularity, complexity, and security practices.

---

## 1. Zero Remote Code Execution Guarantee

RepoScope strictly enforces a **Zero Remote Execution Policy**:
- **No `eval()`, `exec()`, or sub-process interpreters** are ever run on fetched source code.
- Source code is treated strictly as structured text and parsed into Abstract Syntax Trees (AST) or analyzed via deterministic lexical scanners.
- Code inspection occurs within sandboxed AST visitors that compute counts, syntax patterns, and complexity without evaluating expressions.

---

## 2. Analysis Components

### A. Python AST Analyzer (`PythonSourceAnalyzer`)
Uses Python's standard library `ast` module to inspect Python source code safely:
- **Cyclomatic Complexity Estimation:** Measures branching density by traversing decision nodes: `If`, `While`, `For`, `AsyncFor`, `ExceptHandler`, `With`, `Assert`, and boolean operations (`And`, `Or`).
- **Function Metrics:** Average function length in statements, maximum function length, and presence of long monolithic procedures.
- **Type Annotation Coverage:** Calculates ratio of function signatures featuring argument annotations (`arg.annotation`) and return type annotations (`returns`).
- **Docstring Coverage:** Traverses `ast.get_docstring(node)` on modules, classes, and functions.
- **Error Handling Discipline:** Scans for structured `try...except` blocks versus raw unhandled operations.
- **Dangerous Constructs Detection:** Flags risky invocations such as `eval()`, `exec()`, `__import__`, `os.system()`, or `subprocess.Popen(..., shell=True)`.

### B. JavaScript / TypeScript Analyzer (`JavaScriptSourceAnalyzer`)
Analyzes `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs` files using compiled regex heuristics:
- **ES6+ & Modern Syntax:** Detects `class`, `import/export`, `async/await`, arrow functions, destructuring.
- **Frontend Framework Components:** Identifies React functional components (`return <... />`), JSX elements, hooks (`useState`, `useEffect`), or Vue/Angular structures.
- **Typing Discipline:** Identifies TypeScript interfaces, types (`interface`, `type`, `<Generic>`), and strict typing.
- **Dangerous DOM Patterns:** Detects unescaped HTML injections: `dangerouslySetInnerHTML`, `innerHTML =`, `document.write()`, and `eval()`.

### C. Cross-Language Generic Analyzer (`GenericSourceAnalyzer`)
Provides structural fallback analysis for other languages:
- **Java:** Package hierarchies, class definitions, `@Test` annotations, Spring Boot `@RestController` patterns.
- **C / C++:** `#include` structures, pointers, structs, namespaces, header-source separation.
- **Go:** `package main`, `struct`, goroutines, channels, `_test.go` suites.
- **Rust:** `fn main()`, `impl`, `traits`, `Cargo.toml`, `#[test]` modules.

### D. Architectural Scanner (`ArchitectureScanner`)
Inspects overall repository tree topography:
- **Separation of Concerns:** Detects whether repository exhibits dedicated presentation/frontend directories, API/backend controllers, services/domain layers, models/entities, and test suites.
- **Monorepo / Full-Stack Detection:** Identifies dual-tier architectures containing both frontend (e.g. Next.js, React, Vite) and backend (FastAPI, Express, Django).
- **Containerization & CI:** Checks for `Dockerfile`, `docker-compose.yml`, and `.github/workflows/` CI automation.

### E. Documentation Scanner (`DocumentationScanner`)
Evaluates README quality across key academic criteria:
- **Problem Statement:** Explains what the software solves.
- **Installation & Quickstart:** Clear setup commands (`npm install`, `pip install`, `docker run`).
- **Architecture Overview:** Diagrams, module flow, or directory explanations.
- **API Documentation:** Route lists, curl examples, or OpenAPI references.

---

## 3. Secret Detection & Redaction Engine

Any potential secret or credential detected in source code or configuration files is flagged under `security_findings` with **mandatory redaction**:

```python
REDACT_PATTERNS = [
    (r"(?i)(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*['\"][A-Za-z0-9_\-]{8,}['\"]", "[REDACTED_API_KEY]"),
    (r"AKIA[0-9A-Z]{16}", "[REDACTED_AWS_KEY]"),
    (r"ghp_[0-9a-zA-Z]{36}", "[REDACTED_GITHUB_PAT]"),
    (r"-----BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY-----[\s\S]+?-----END \1 KEY-----", "[REDACTED_PRIVATE_KEY]"),
    (r"(postgres|mysql|mongodb|redis):\/\/[^:\s]+:[^@\s]+@[^\s]+", "[REDACTED_DB_CONNECTION_STRING]")
]
```

Under no circumstances is an unredacted credential ever saved in job status, logged, or sent to the frontend.

