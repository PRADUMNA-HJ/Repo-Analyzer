# RepoScope Local Development Guide

## 1. Prerequisites

- **Node.js:** v18.0.0 or later (v24 tested)
- **npm:** v9.0.0 or later (v11 tested)
- **Python:** 3.12 or later (3.14 tested)
- **Git**

---

## 2. Setting Up the Monorepo

### 2.1 Clone and Enter Directory
```bash
cd github_analyzer
```

### 2.2 Backend Environment Setup
```bash
# Create virtual environment
python -m venv backend/.venv

# Activate virtual environment
# Windows PowerShell:
.\backend\.venv\Scripts\Activate.ps1
# Linux / macOS:
source backend/.venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Verify backend tests
pytest -c backend/pytest.ini backend/tests -v
```

### 2.3 Frontend Environment Setup
```bash
cd frontend

# Install packages with legacy peer deps
npm install --legacy-peer-deps

# Verify frontend tests
npm run test

# Verify production build
npm run build
```

---

## 3. Running Development Servers

### Terminal 1: Backend
```bash
.\backend\.venv\Scripts\Activate.ps1
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at `http://localhost:8000/docs`.

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
UI will be live at `http://localhost:5173`.

---

## 4. Coding Standards & Conventions

1. **Strict TypeScript:** No implicit `any` types. All API requests and responses are strictly typed in `frontend/src/types/index.ts`.
2. **Pydantic Validation:** All incoming payloads are validated using Pydantic models in `backend/app/schemas/`.
3. **No Hardcoded URLs:** Frontend requests route exclusively through `frontend/src/services/api.ts` reading `VITE_API_BASE_URL`.
4. **Clean Code Separation:** Business logic is decoupled from HTTP handlers and placed into `backend/app/services/`.

