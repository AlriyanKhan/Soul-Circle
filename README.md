# SOUL-CIRCLE

A mental health/psychological aid platform.

Tech stack:
- Frontend: React (Vite)
- Backend: Flask
- Database: MongoDB
- Chatbot: Botpress (embedded in frontend)

## Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running locally (or set MONGO_URI)

## Backend Setup

1. Create a virtual environment and install deps:
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

2. Create `.env` in `backend/` (optional) or export env vars:
```
export MONGO_URI=mongodb://localhost:27017
export MONGO_DB_NAME=soul_circle
export JWT_SECRET_KEY=change-this-jwt-secret
export SECRET_KEY=change-this-secret
```

3. Run the server:
```
python backend/app.py
```
Server runs at http://127.0.0.1:5000

4. Seed sample data:
```
python backend/seed.py
```

## Frontend Setup

1. Install deps and run dev server:
```
cd frontend
npm install
npm run dev
```

Dev server: http://127.0.0.1:5173

### Botpress Embed
Edit `src/pages/Home.jsx` and set your Botpress config:
- window.botpressWebChat.init({ botId: "<BOT_ID>", hostUrl: "<BOT_URL>", messagingUrl: "<MSG_URL>", clientId: "<CLIENT_ID>" })

## Env and URLs
- Frontend expects backend at http://127.0.0.1:5000 (configure in `src/services/api.js`)

## Notes
- Admin user is created by seed: admin@soul-circle.local / AdminPass123!
- Use this user to access admin endpoints/pages.
