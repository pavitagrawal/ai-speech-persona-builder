"""Coaching and scoring helpers for AI Speech Persona Builder.

This module provides:
- A scoring function that compares computed metrics against persona targets.
- A Gemini 2.5–backed coaching generator with a safe local fallback.
"""

from typing import Dict, Any
import os
import json
import re

import google.generativeai as genai  # type: ignore
from dotenv import load_dotenv

print("DEBUG: coach_engine.py loaded")

# ---------------------------------------------------------------------------
# Gemini 2.5 setup
# ---------------------------------------------------------------------------

load_dotenv()  # reads GOOGLE_API_KEY from backend/.env
API_KEY = os.getenv("GOOGLE_API_KEY")
print("DEBUG: GOOGLE_API_KEY present?", bool(API_KEY))

_GEMINI_MODEL_NAME = "gemini-2.5-flash"  # you can change to gemini-2.0-flash if needed
_gemini_model = None  # type: ignore

if API_KEY:
    try:
        genai.configure(api_key=API_KEY)
        _gemini_model = genai.GenerativeModel(_GEMINI_MODEL_NAME)
        print("DEBUG: Gemini model initialized:", _GEMINI_MODEL_NAME)
    except Exception as e:  # pragma: no cover - debug logging
        print("DEBUG: Failed to initialize Gemini model:", e)
        _gemini_model = None
else:
    print("DEBUG: No GOOGLE_API_KEY found; using fallback coaching only.")


# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

def _score_pace(wpm: float, target_range: list[int]) -> float:
    """Score pace between 0.0 and 1.0 based on proximity to target range.

    - Within range -> ~0.95
    - Slightly outside (within 15% of nearest bound) -> ~0.6–0.8
    - Far outside -> down to 0.2
    """
    if wpm <= 0 or not target_range or len(target_range) != 2:
        return 0.2

    low, high = float(target_range[0]), float(target_range[1])
    if low <= wpm <= high:
        return 0.95

    range_width = max(high - low, 1.0)
    if wpm < low:
        diff = (low - wpm) / range_width
    else:
        diff = (wpm - high) / range_width

    if diff <= 0.15:
        return 0.8
    if diff <= 0.5:
        return 0.5
    return 0.2


def _score_filler_control(fillers_per_min: float, max_allowed: float) -> float:
    """Score filler control where lower fillers_per_min is better.

    - If fillers_per_min <= max_allowed -> score ~0.98
    - If higher, decrease linearly toward 0.2 at ~3× the max_allowed
    """
    if max_allowed <= 0:
        return 0.5

    if fillers_per_min <= max_allowed:
        return 0.98

    ratio = fillers_per_min / max_allowed
    if ratio >= 3.0:
        return 0.2

    score = 0.98 - (ratio - 1.0) * ((0.98 - 0.2) / 2.0)
    return max(0.2, score)


def score_against_persona(metrics: Dict[str, float], persona: Dict[str, Any]) -> Dict[str, Any]:
    """Score computed speech metrics against a persona's targets.

    Args:
        metrics: dict with keys "wpm", "totalWords", "totalFillers", "fillersPerMin".
        persona: persona dict with `targets` containing `wpm` range and `maxFillersPerMin`.

    Returns:
        dict:
        {
          "overall": float,
          "dimensions": {
              "pace": float,
              "clarity": float,
              "confidence": float,
              "fillerControl": float
          }
        }
    """
    wpm = float(metrics.get("wpm", 0.0))
    fillers_per_min = float(metrics.get("fillersPerMin", 0.0))

    targets = persona.get("targets", {}) if persona else {}
    target_wpm = targets.get("wpm", [0, 0])
    max_fillers = float(targets.get("maxFillersPerMin", 0))

    pace_score = _score_pace(wpm, target_wpm)
    filler_score = _score_filler_control(fillers_per_min, max_fillers)

    clarity_score = 0.9  # simple placeholder for now
    confidence_score = filler_score  # fewer fillers -> more confidence

    dims = {
        "pace": round(float(pace_score), 3),
        "clarity": round(float(clarity_score), 3),
        "confidence": round(float(confidence_score), 3),
        "fillerControl": round(float(filler_score), 3),
    }

    overall = sum(dims.values()) / len(dims)
    return {"overall": round(float(overall), 3), "dimensions": dims}


# ---------------------------------------------------------------------------
# Coaching (fallback + Gemini)
# ---------------------------------------------------------------------------

def _default_coaching_fallback(
    transcript: str,
    persona: Dict[str, Any],
    metrics: Dict[str, Any],
    persona_score: Dict[str, Any],
) -> Dict[str, Any]:
    """Local, non-LLM fallback coaching. Always safe and deterministic."""
    return {
        "summary": "FALLBACK COACHING – GEMINI NOT USED",
        "tips": [
            "This is fallback. Gemini call failed or no key.",
            "Check GOOGLE_API_KEY or model configuration.",
            "Once Gemini is working, this text should disappear.",
        ],
        "exercise": "Repeat your introduction while consciously avoiding filler words like 'um' and 'uh'.",
        "personaScores10": {
            "confidence": 5.0,
            "clarity": 5.0,
            "energy": 5.0,
            "structure": 5.0,
        },
        "perSentenceEmotions": ["neutral"],
    }


def generate_coaching_with_gemini(
    transcript: str,
    persona: Dict[str, Any],
    metrics: Dict[str, Any],
    persona_score: Dict[str, Any],
) -> Dict[str, Any]:
    """Generate coaching guidance using Gemini 2.5 with robust fallback.

    This function:
    - Uses the configured Gemini model (if available) to generate STRICT JSON coaching.
    - On any error (no key, SDK error, bad JSON), returns a safe fallback dict.
    - Never raises; always returns a well-formed coaching payload.

    Returns a dict with keys:
        summary, tips, exercise, personaScores10, perSentenceEmotions
    """
    # If model didn't initialize, immediately fallback
    if _gemini_model is None:
        print("DEBUG: _gemini_model is None -> using fallback coaching")
        return _default_coaching_fallback(transcript, persona, metrics, persona_score)

    try:
        persona_name = persona.get("name", "Speaker")
        persona_desc = persona.get("description", "")

        prompt = (
            f"You are a speaking coach helping a persona '{persona_name}'.\n"
            f"Persona description: {persona_desc}\n\n"
            f"Metrics:\n"
            f"- WPM: {metrics.get('wpm')}\n"
            f"- Total words: {metrics.get('totalWords')}\n"
            f"- Total fillers: {metrics.get('totalFillers')}\n"
            f"- Fillers per minute: {metrics.get('fillersPerMin')}\n\n"
            f"Persona scores (0..1): {json.dumps(persona_score.get('dimensions', {}))}\n\n"
            f"User transcript:\n\"\"\"{transcript}\"\"\"\n\n"
            "Respond ONLY with JSON in this exact structure:\n"
            "{\n"
            '  \"summary\": str,\n'
            '  \"tips\": [str, str, str],\n'
            '  \"exercise\": str,\n'
            '  \"personaScores10\": {\n'
            '    \"confidence\": float,\n'
            '    \"clarity\": float,\n'
            '    \"energy\": float,\n'
            '    \"structure\": float\n'
            "  },\n"
            '  \"perSentenceEmotions\": [str, ...]\n'
            "}\n"
        )

        print("DEBUG: Calling Gemini model for coaching...")
        result = _gemini_model.generate_content(prompt)  # type: ignore[arg-type]

        # Try to get raw text from result
        if hasattr(result, "text") and isinstance(result.text, str):
            resp_text = result.text
        else:
            resp_text = str(result)

        # Extract first JSON object from the response
        match = re.search(r"\{.*\}", resp_text, re.DOTALL)
        if not match:
            print("DEBUG: No JSON object found in Gemini response, falling back")
            return _default_coaching_fallback(transcript, persona, metrics, persona_score)

        json_str = match.group(0)
        data = json.loads(json_str)

        if not isinstance(data, dict):
            print("DEBUG: Parsed JSON is not a dict, falling back")
            return _default_coaching_fallback(transcript, persona, metrics, persona_score)

        # Ensure required keys exist
        required_keys = ("summary", "tips", "exercise", "personaScores10", "perSentenceEmotions")
        if any(k not in data for k in required_keys):
            print("DEBUG: Missing keys in Gemini JSON, falling back")
            return _default_coaching_fallback(transcript, persona, metrics, persona_score)

        return data
    except Exception as exc:  # pragma: no cover - defensive logging
        print("DEBUG: Exception in generate_coaching_with_gemini:", exc)
        return _default_coaching_fallback(transcript, persona, metrics, persona_score)