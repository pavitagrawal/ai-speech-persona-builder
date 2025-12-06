import {
  PersonasResponse,
  AnalyzeSpeechRequest,
  AnalyzeSpeechResponse,
  ConfirmFeedbackRequest,
  ConfirmFeedbackResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

// Mock data for development
const MOCK_PERSONAS: PersonasResponse = {
  personas: [
    {
      id: 'ted',
      name: 'TED Speaker',
      description: 'Inspiring, story-driven, calm but energetic.',
      targets: {
        wpm: [140, 170],
        maxFillersPerMin: 3,
      },
    },
    {
      id: 'leader',
      name: 'Confident Leader',
      description: 'Authoritative, concise, decisive.',
      targets: {
        wpm: [130, 160],
        maxFillersPerMin: 2,
      },
    },
  ],
};

const MOCK_ANALYSIS: AnalyzeSpeechResponse = {
  metrics: {
    wpm: 145,
    totalWords: 78,
    totalFillers: 6,
    fillersPerMin: 4.5,
  },
  personaScore: {
    overall: 0.74,
    dimensions: {
      pace: 0.8,
      clarity: 0.9,
      confidence: 0.6,
      fillerControl: 0.55,
    },
  },
  coaching: {
    summary: 'You sound fairly clear but slightly rushed and filler-heavy.',
    tips: [
      'Pause for half a second at the end of each sentence.',
      "Replace 'like' with a brief silence.",
      'Try to finish sentences instead of trailing off.',
    ],
    exercise: "Say the same introduction but consciously remove all 'like' and 'um'.",
    personaScores10: {
      confidence: 7.5,
      clarity: 9,
      energy: 6,
      structure: 7,
    },
  },
  highlights: [
    { wordIndex: 1, type: 'filler' },
    { wordIndex: 5, type: 'filler' },
  ],
  perSentenceEmotions: ['neutral', 'uncertain', 'warm'],
  attemptId: 'abc123',
  needsConfirmation: true,
  coachingTextForTTS: 'Overall, you sound quite clear but slightly rushed...',
};

export async function fetchPersonas(): Promise<PersonasResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/personas`);
    if (!response.ok) {
      throw new Error('Failed to fetch personas');
    }
    return await response.json();
  } catch (error) {
    console.warn('API call failed, using mock data:', error);
    return MOCK_PERSONAS;
  }
}

export async function analyzeSpeech(
  request: AnalyzeSpeechRequest
): Promise<AnalyzeSpeechResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Failed to analyze speech');
    }
    return await response.json();
  } catch (error) {
    console.warn('API call failed, using mock data:', error);
    // Return mock with the actual transcript
    return {
      ...MOCK_ANALYSIS,
      metrics: {
        ...MOCK_ANALYSIS.metrics,
        totalWords: request.transcript.split(/\s+/).length,
      },
    };
  }
}

export async function confirmFeedback(
  request: ConfirmFeedbackRequest
): Promise<ConfirmFeedbackResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/confirm-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Failed to confirm feedback');
    }
    return await response.json();
  } catch (error) {
    console.warn('API call failed, using mock audio URL:', error);
    // Return a mock audio URL (you can replace with a real sample)
    return {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    };
  }
}

