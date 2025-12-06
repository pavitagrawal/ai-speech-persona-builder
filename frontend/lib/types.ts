// API Types matching the backend contract

export interface Persona {
  id: string;
  name: string;
  description: string;
  targets: {
    wpm: [number, number];
    maxFillersPerMin: number;
  };
}

export interface PersonasResponse {
  personas: Persona[];
}

export interface AnalyzeSpeechRequest {
  personaId: string;
  transcript: string;
  durationSeconds: number;
}

export interface Metrics {
  wpm: number;
  totalWords: number;
  totalFillers: number;
  fillersPerMin: number;
}

export interface PersonaScoreDimensions {
  pace: number;
  clarity: number;
  confidence: number;
  fillerControl: number;
}

export interface PersonaScore {
  overall: number;
  dimensions: PersonaScoreDimensions;
}

export interface PersonaScores10 {
  confidence: number;
  clarity: number;
  energy: number;
  structure: number;
}

export interface Coaching {
  summary: string;
  tips: string[];
  exercise: string;
  personaScores10: PersonaScores10;
}

export interface Highlight {
  wordIndex: number;
  type: string;
}

export interface AnalyzeSpeechResponse {
  metrics: Metrics;
  personaScore: PersonaScore;
  coaching: Coaching;
  highlights: Highlight[];
  perSentenceEmotions: string[];
  attemptId: string;
  needsConfirmation: boolean;
  coachingTextForTTS: string;
}

export interface ConfirmFeedbackRequest {
  attemptId: string;
  personaId: string;
}

export interface ConfirmFeedbackResponse {
  audioUrl: string;
}

