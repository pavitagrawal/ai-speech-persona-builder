import os
import requests
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

MURF_API_KEY = os.getenv("MURF_API_KEY")
MURF_URL = "https://api.murf.ai/v1/speech/generate"


# Choose voice by persona
VOICE_MAP = {
    "ted": "en-US-natalie",
    "leader": "en-US-marcus",
    "teacher": "en-UK-hazel",
    "default": "en-US-natalie"
}


def generate_tts_with_murf(coaching_text: str, persona: Optional[dict] = None) -> str:
    if not MURF_API_KEY:
        raise RuntimeError("MURF_API_KEY not found in environment")

    persona_id = persona.get("id") if persona else "default"
    voice_id = VOICE_MAP.get(persona_id, VOICE_MAP["default"])

    payload = {
        "voiceId": voice_id,
        "text": coaching_text,
        "format": "mp3"
    }

    headers = {
        "Content-Type": "application/json",
        "api-key": MURF_API_KEY
    }

    response = requests.post(MURF_URL, json=payload, headers=headers, timeout=30)

    if response.status_code != 200:
        raise RuntimeError(f"Murf API Error {response.status_code}: {response.text}")

    data = response.json()

    # Murf returns: { "audioFile": "https://....mp3" }
    audio_url = data.get("audioFile") or data.get("audioUrl")

    if not audio_url:
        raise RuntimeError("No audio URL returned from Murf")

    return audio_url
