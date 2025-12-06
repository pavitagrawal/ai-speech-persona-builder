"""Persona profiles for AI Speech Persona Builder.

This module exposes a CONSTANT `PERSONAS` mapping persona ids to their
metadata and two helpers to access the list or a single persona.
"""
from typing import Dict, List, Optional


# Personas keyed by `id`. Values are simple dicts so they are easy to
# serialize to JSON when returned from API endpoints.
PERSONAS: Dict[str, Dict] = {
	"ted": {
		"id": "ted",
		"name": "TED Speaker",
		"description": "Inspiring, story-driven, calm but energetic.",
		"targets": {"wpm": [140, 170], "maxFillersPerMin": 3},
	},
	"leader": {
		"id": "leader",
		"name": "Confident Leader",
		"description": "Authoritative, concise, decisive.",
		"targets": {"wpm": [130, 160], "maxFillersPerMin": 2},
	},
	"teacher": {
		"id": "teacher",
		"name": "Engaging Teacher",
		"description": "Clear, patient, explanatory with measured pacing.",
		"targets": {"wpm": [110, 140], "maxFillersPerMin": 2},
	},
}


def get_personas() -> List[Dict]:
	"""Return all personas as a list of dicts.

	Returns:
		list[dict]: Persona metadata dictionaries.
	"""
	return list(PERSONAS.values())


def get_persona(persona_id: str) -> Optional[Dict]:
	"""Return a single persona dict by id or ``None`` if not found.

	Args:
		persona_id: The persona id to look up.

	Returns:
		dict | None: Persona metadata dictionary or ``None`` when missing.
	"""
	return PERSONAS.get(persona_id)

