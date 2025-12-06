"""Minimal FastAPI backend for AI Speech Persona Builder.

This module exposes a FastAPI `app` with health and placeholder
API endpoints matching the project's API contract.
"""
from agents.coach_engine import score_against_persona, generate_coaching_with_gemini
from agents.persona_profiles import get_personas
from agents.persona_profiles import get_persona
from agents.metrics import compute_metrics, compute_highlights
from agents.tts_murf import generate_tts_with_murf
from logs.session_logger import log_session
from typing import Dict, List, Optional
from datetime import datetime
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()
from pydantic import BaseModel, Field

app = FastAPI(title="AI Speech Persona Builder - Backend")

# CORS: allow the frontend origin (can be overridden via FRONTEND_ORIGIN env var)
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Simple in-memory cache for generated coaching TTS text by attempt id.
attempt_cache: Dict[str, Dict] = {}


class PersonaTarget(BaseModel):
	wpm: List[int] = Field(..., description="Target words-per-minute range [min, max]")
	maxFillersPerMin: int = Field(..., description="Max allowed filler words per minute")


class PersonaOut(BaseModel):
	id: str
	name: str
	description: str
	targets: PersonaTarget


class AnalyzeSpeechRequest(BaseModel):
	personaId: str
	transcript: str
	durationSeconds: float


class Metrics(BaseModel):
	wpm: float
	totalWords: int
	totalFillers: int
	fillersPerMin: float


class PersonaScoreDimensions(BaseModel):
	pace: float
	clarity: float
	confidence: float
	fillerControl: float


class PersonaScore(BaseModel):
	overall: float
	dimensions: PersonaScoreDimensions


class Coaching(BaseModel):
	summary: str
	tips: List[str]
	exercise: str
	personaScores10: Dict[str, float]


class Highlight(BaseModel):
	wordIndex: int
	type: str


class AnalyzeSpeechResponse(BaseModel):
	metrics: Metrics
	personaScore: PersonaScore
	coaching: Coaching
	highlights: List[Highlight]
	perSentenceEmotions: List[str]
	attemptId: str
	needsConfirmation: bool
	coachingTextForTTS: str


class ConfirmFeedbackRequest(BaseModel):
	attemptId: str
	personaId: str


class ConfirmFeedbackResponse(BaseModel):
	audioUrl: Optional[str] = None
	fallbackText: Optional[str] = None


@app.get("/health")
def health() -> Dict[str, str]:
	"""Return a simple health check for uptime/availability.

	Returns:
		dict: {"status": "ok"}
	"""
	return {"status": "ok"}


@app.get("/api/personas")
def api_get_personas() -> Dict[str, List[Dict]]:
	"""Return available speech personas.

	Uses the personas defined in `backend/agents/persona_profiles.py` so
	there's a single source of truth for persona metadata.
	"""
	return {"personas": get_personas()}


from fastapi import HTTPException
import uuid

@app.post("/api/analyze-speech")
def analyze_speech(body: AnalyzeSpeechRequest):
    """
    Analyze a speech attempt for a given persona.
    - Computes metrics (wpm, fillers, etc.)
    - Scores against persona targets
    - Generates coaching via Gemini 2.5 (or fallback)
    """
    # 1) Get persona
    persona = get_persona(body.personaId)
    if persona is None:
        raise HTTPException(status_code=400, detail="Unknown personaId")

    # 2) Compute metrics
    metrics = compute_metrics(body.transcript, body.durationSeconds)

    # 3) Persona scoring
    persona_score = score_against_persona(metrics, persona)

    # 4) Coaching from Gemini
    coaching = generate_coaching_with_gemini(
        transcript=body.transcript,
        persona=persona,
        metrics=metrics,
        persona_score=persona_score,
    )

    # 5) Highlights
    highlights = compute_highlights(body.transcript)

    # 6) coachingTextForTTS (summary + tips for voice)
    tips_joined = " ".join(coaching.get("tips", [])) if isinstance(coaching.get("tips", None), list) else ""
    coaching_text_for_tts = (coaching.get("summary", "") + (" - " + tips_joined if tips_joined else "")).strip()

    # 7) Attempt ID + cache for TTS
    attempt_id = str(uuid.uuid4())
    attempt_cache[attempt_id] = {
        "personaId": body.personaId,
        "coachingText": coaching_text_for_tts,
    }

    # 8) Final response
    response_payload = {
        "metrics": metrics,
        "personaScore": persona_score,
        "coaching": {
            "summary": coaching.get("summary", ""),
            "tips": coaching.get("tips", []),
            "exercise": coaching.get("exercise", ""),
            "personaScores10": coaching.get("personaScores10", {}),
        },
        "highlights": highlights,
        "perSentenceEmotions": coaching.get("perSentenceEmotions", []),
        "attemptId": attempt_id,
        "needsConfirmation": True,
        "coachingTextForTTS": coaching_text_for_tts,
    }

    # 9) Log session
    log_session({
        "attemptId": attempt_id,
        "personaId": body.personaId,
        "metrics": metrics,
        "personaScore": persona_score,
        "timestamp": datetime.utcnow().isoformat()
    })

    return response_payload


@app.post("/api/confirm-feedback", response_model=ConfirmFeedbackResponse)
def confirm_feedback(body: ConfirmFeedbackRequest) -> ConfirmFeedbackResponse:
    """
    Take an attemptId, look up the stored coaching text, generate TTS,
    and return an audio URL. Never crashes; falls back to text if needed.
    """
    # 1) Look up the attempt in cache
    data = attempt_cache.get(body.attemptId)
    if data is None:
        return ConfirmFeedbackResponse(
            audioUrl=None,
            fallbackText="No coaching text found for this attemptId.",
        )

    coaching_text = data.get("coachingText", "")
    if not coaching_text:
        return ConfirmFeedbackResponse(
            audioUrl=None,
            fallbackText="No coaching text available for this attemptId.",
        )

    # 2) Call TTS (using Murf stub). Persona is ignored for now.
    try:
        audio_url = generate_tts_with_murf(coaching_text, persona=None)
    except Exception:
        audio_url = None

    # 3) Return audio URL or fallback text
    if audio_url:
        return ConfirmFeedbackResponse(audioUrl=audio_url, fallbackText=None)

    return ConfirmFeedbackResponse(audioUrl=None, fallbackText=coaching_text)

if __name__ == "__main__":
    from agents.metrics import compute_metrics
    print(compute_metrics("hi um my name is pavit and like I want to speak better", 30.0))