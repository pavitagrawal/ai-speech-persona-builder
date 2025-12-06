# AI Speech Persona Builder

AI-powered speech coaching app using Gemini for analysis and Murf for TTS. Records speech, analyzes pace/clarity/emotions, and provides personalized feedback with scores, tips, and audio coaching.

🎥 **Demo Video:**  
https://drive.google.com/file/d/1i-RP_z7S5lsmnEoNLZqL-tKWx7nPDDU8/view?usp=sharing

## Services
- Backend: `backend/` (FastAPI). Runs on port `8000` by default.
- Frontend: `frontend/` (Next.js). Runs on port `3000` by default.

## Environment
Create a `.env` file in the `backend/` folder with:

```
GOOGLE_API_KEY=your_google_key_here
MURF_API_KEY=your_murf_key_here
FRONTEND_ORIGIN=http://localhost:3000
```

For frontend, set in your environment (or `.env.local` in `frontend/`):

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Run backend

From project root:

```powershell
# activate your python environment
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Run frontend

From project root:

```powershell
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

## Notes
- Backend is the source of truth for persona definitions and analysis shapes.
- Frontend uses a typed API client at `frontend/lib/api.ts` which calls backend endpoints:
  - `GET /api/personas`
  - `POST /api/analyze-speech`
  - `POST /api/confirm-feedback`

If Murf or Gemini keys are not present, the backend will fallback to safe behavior but still return valid payloads.
