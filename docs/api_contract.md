# API Contract

## GET /api/personas

Response:
{
  "personas": [
    {
      "id": "ted",
      "name": "TED Speaker",
      "description": "Inspiring, story-driven, calm but energetic.",
      "targets": {
        "wpm": [140, 170],
        "maxFillersPerMin": 3
      }
    },
    {
      "id": "leader",
      "name": "Confident Leader",
      "description": "Authoritative, concise, decisive.",
      "targets": {
        "wpm": [130, 160],
        "maxFillersPerMin": 2
      }
    }
  ]
}

## POST /api/analyze-speech

Request:
{
  "personaId": "ted",
  "transcript": "hi um my name is pavit and like I want to...",
  "durationSeconds": 32.5
}

Response:
{
  "metrics": {
    "wpm": 145,
    "totalWords": 78,
    "totalFillers": 6,
    "fillersPerMin": 4.5
  },
  "personaScore": {
    "overall": 0.74,
    "dimensions": {
      "pace": 0.8,
      "clarity": 0.9,
      "confidence": 0.6,
      "fillerControl": 0.55
    }
  },
  "coaching": {
    "summary": "You sound fairly clear but slightly rushed and filler-heavy.",
    "tips": [
      "Pause for half a second at the end of each sentence.",
      "Replace 'like' with a brief silence.",
      "Try to finish sentences instead of trailing off."
    ],
    "exercise": "Say the same introduction but consciously remove all 'like' and 'um'.",
    "personaScores10": {
      "confidence": 7.5,
      "clarity": 9,
      "energy": 6,
      "structure": 7
    }
  },
  "highlights": [
    { "wordIndex": 1, "type": "filler" }, 
    { "wordIndex": 5, "type": "filler" }
  ],
  "perSentenceEmotions": ["neutral", "uncertain", "warm"],
  "attemptId": "abc123",
  "needsConfirmation": true,
  "coachingTextForTTS": "Overall, you sound quite clear but slightly rushed..."
}

## POST /api/confirm-feedback

Request:
{
  "attemptId": "abc123",
  "personaId": "ted"
}

Response:
{
  "audioUrl": "https://.../coaching_abc123.mp3"
}
