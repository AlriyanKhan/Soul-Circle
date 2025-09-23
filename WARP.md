# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Full-stack app for mental health support.
- Frontend: React (Vite) in frontend/.
- Backend: Flask + MongoDB in backend/.
- Auth: JWT (flask-jwt-extended). CORS is enabled for the Vite dev origin.

Common commands
Backend
- Create venv and install deps (macOS/Linux):
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```
- Run API server (default http://127.0.0.1:5000):
```
python backend/app.py
```
- Seed development data (admin user, starter resources):
```
python backend/seed.py
```

Frontend
- Install and run dev server (default http://127.0.0.1:5173):
```
cd frontend
npm install
npm run dev
```
- Build and preview:
```
npm run build
npm run preview
```
- Optional: point the frontend at a non-default API base:
```
# In the shell that runs Vite
echo 'VITE_API_BASE=http://127.0.0.1:5000' > .env.local
# or export VITE_API_BASE before npm run dev
```

High-level architecture
Backend (backend/)
- app.py sets up the Flask app (factory pattern), loads Config from env, enables CORS for /api/*, configures JWT, and attaches a pymongo DB handle at app.config["DB"].
- Blueprints mounted under /api:
  - /api/auth (routes/auth.py): signup, login, me; issues JWTs with a role claim (user/admin).
  - /api/forum (routes/forum.py): forum categories, CRUD-like post endpoints, simple content moderation (utils/moderation.py) flags potential self-harm content.
  - /api/resources (routes/resources.py): list/create/delete curated resources; write ops require role == admin (checked via JWT claims).
  - /api/tests (routes/tests.py): PHQ-9 and GAD-7 definitions and scoring; persists submissions and returns basic recommendations.
  - /api/admin (routes/admin.py): admin-only views of users, reports, and test analytics (Mongo aggregation).
- Config (backend/config.py):
  - MONGO_URI, MONGO_DB_NAME, JWT_SECRET_KEY, SECRET_KEY, CORS_ORIGINS (defaults include http://127.0.0.1:5173).
- Dev data seeding (backend/seed.py): creates admin@soul-circle.local / AdminPass123! and inserts sample resources.

Frontend (frontend/)
- Vite + React app. Entry in src/main.jsx wraps App with BrowserRouter and AuthProvider.
- Routing (src/App.jsx):
  - Public: /, /login, /signup, /forum, /resources, /tests, /posts/:id
  - Protected: /admin, /profile (guarded by components/auth/ProtectedRoute.jsx, which requires a token).
- Auth state (src/context/AuthContext.jsx): stores token in localStorage, fetches /api/auth/me, and injects Authorization header via src/services/api.js (axios). API base is import.meta.env.VITE_API_BASE or http://127.0.0.1:5000.
- Layout components (Header, Sidebar, Footer) compose the app shell; feature areas live under components/ (forum, library, tests) and pages/.

Environment and configuration
- Backend required env (see backend/config.py):
  - MONGO_URI (default mongodb://localhost:27017)
  - MONGO_DB_NAME (default soul_circle)
  - JWT_SECRET_KEY, SECRET_KEY (defaults present but override for non-dev use)
  - CORS_ORIGINS should include the Vite dev origin (127.0.0.1:5173)
- Frontend API base: set VITE_API_BASE if the backend is not on http://127.0.0.1:5000.

Important notes from README.md
- Prereqs: Python 3.10+, Node.js 18+, MongoDB local or MONGO_URI configured.
- Dev URLs: frontend http://127.0.0.1:5173, backend http://127.0.0.1:5000.
- Admin credentials (from seeding): admin@soul-circle.local / AdminPass123! (use for admin routes and /admin page).
- Botpress embed: configure in frontend/src/pages/Home.jsx if using the chatbot.

Testing and linting
- No test or lint commands are currently configured in package.json or backend requirements. If tests are added later (e.g., Vitest/Jest or pytest), document their commands here, including how to run a single test.
