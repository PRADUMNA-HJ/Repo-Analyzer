# RepoScope Production Deployment Guide

This guide describes how to deploy RepoScope to production using **Render** (for the FastAPI backend and Managed PostgreSQL database) and **Vercel** (for the React 18 frontend).

---

## Architecture Overview in Production

```
 [ Client Browser ]
         │
         ▼ (HTTPS)
 [ Vercel Edge CDN ] ────> React 18 + Vite SPA (reposcope.vercel.app)
         │
         ▼ (HTTPS REST API / JWT Bearer)
 [ Render Web Service ] ──> FastAPI Backend (reposcope-api.onrender.com)
         │
         ├── Async connection pool (asyncpg / SQLAlchemy 2.0)
         ▼
 [ Render Managed PostgreSQL ] ──> `reposcope` Database (Alembic schema)
```

---

## 1. Backend & PostgreSQL Deployment (Render)

### Option A: Automatic Blueprint Deployment (Recommended)
RepoScope includes a production `render.yaml` Blueprint definition at the project root:

1. Push your repository to GitHub or GitLab.
2. Sign in to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** and select **Blueprint**.
4. Connect your RepoScope repository.
5. Render will automatically parse `render.yaml` and provision:
   - **PostgreSQL Database:** `reposcope-db` (Database: `reposcope`, User: `reposcope_user`)
   - **Web Service:** `reposcope-api` with Python runtime, build command `pip install -r requirements.txt && alembic upgrade head`, and start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`.
6. Configure the following environment variables in the Render dashboard:
   - `FRONTEND_ORIGIN`: `https://your-app.vercel.app`
   - `ALLOWED_ORIGINS`: `https://your-app.vercel.app,http://localhost:5173`
   - `GITHUB_TOKEN`: *(Optional)* Your fine-grained read-only GitHub PAT.
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API key.
7. Click **Apply**. Render will run database migrations and start the web service.

### Option B: Manual Service Creation
1. **Create PostgreSQL Database:**
   - In Render Dashboard, click **New +** → **PostgreSQL**.
   - Name: `reposcope-db`, Database: `reposcope`.
   - Copy the **Internal Database URL** (e.g., `postgresql://reposcope_user:...@dpg-...:5432/reposcope`).
2. **Create Web Service:**
   - Click **New +** → **Web Service**.
   - Connect the repository and set Root Directory to `backend`.
   - Environment: `Python`.
   - Build Command: `pip install -r requirements.txt && alembic upgrade head`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`
   - Add Environment Variables:
     - `DATABASE_URL`: *(Paste Internal Database URL from Step 1)*
     - `APP_ENV`: `production`
     - `DEMO_MODE`: `false`
     - `JWT_SECRET_KEY`: *(Generate a 64+ char random hex string)*
     - `METHODOLOGY_VERSION`: `2.1.0`
     - `FRONTEND_ORIGIN`: `https://your-app.vercel.app`
     - `ALLOWED_ORIGINS`: `https://your-app.vercel.app`
     - `GITHUB_TOKEN`: `ghp_...`
     - `PYTHON_VERSION`: `3.12.7`

---

## 2. Frontend Deployment (Vercel)

### Option A: Using Vercel CLI
```bash
# Navigate to frontend folder
cd frontend

# Deploy using Vercel CLI
npx vercel

# Follow prompts:
# - Set root directory to frontend
# - Build command: npm run build
# - Output directory: dist
# - Set Environment Variable: VITE_API_BASE_URL=https://reposcope-api.onrender.com

# Deploy to production:
npx vercel --prod
```

### Option B: Using Vercel Web Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** → **Project**.
2. Import your GitHub repository.
3. Configure Project Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://reposcope-api.onrender.com` (your Render backend URL)
5. Click **Deploy**. Vercel will build the frontend with `tsc -b && vite build` and deploy to global Edge CDN.

---

## 3. Post-Deployment Verification Checklist

Once deployed, verify the full end-to-end workflow on the live production environment:

1. **Backend Health Check:**
   Visit `https://reposcope-api.onrender.com/api/v1/health`  
   Verify response is `HTTP 200` with `status: "healthy"`.

2. **Database Connectivity & Migrations:**
   Visit `https://reposcope-api.onrender.com/api/v1/evaluations/stats/summary`  
   Verify response returns aggregate database metrics.

3. **Frontend SPA Loading:**
   Visit `https://your-app.vercel.app`  
   Verify the dark SaaS landing page loads with the green "API: Online" pulse badge.

4. **Live GitHub Evaluation:**
   Navigate to `/analyze`, enter `https://github.com/octocat`, ensure Demo Mode is unchecked, and click **Analyze**.  
   Verify asynchronous job progress executes through all 8 stages to completion.

5. **Academic PDF Dossier Download:**
   Click **Download Academic PDF Dossier** on the completed evaluation. Verify that a valid multi-page PDF (`RepoScope-Dossier-octocat.pdf`) downloads cleanly.

6. **Faculty History & Authentication:**
   Click **Faculty Portal**, sign in with `faculty@university.edu` / `faculty123`, navigate to `/history`, and verify that previous evaluations appear and review notes can be submitted.

