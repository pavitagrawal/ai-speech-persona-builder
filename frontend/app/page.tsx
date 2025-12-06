'use client';

import { useState } from 'react';
import PersonaSelector from '@/components/PersonaSelector';
import MicRecorder from '@/components/MicRecorder';
import TranscriptView from '@/components/TranscriptView';
import ScoreCard from '@/components/ScoreCard';
import CoachingPanel from '@/components/CoachingPanel';
import EmotionGraph from '@/components/EmotionGraph';
import ConsciousPauseModal from '@/components/ConsciousPauseModal';
import PersonaScoreBreakdown from '@/components/PersonaScoreBreakdown';
import { analyzeSpeech } from '@/lib/api';
import { AnalyzeSpeechResponse } from '@/lib/types';

export default function Home() {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | undefined>();
  const [analysis, setAnalysis] = useState<AnalyzeSpeechResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersonaId(personaId);
    setAnalysis(null); // Reset analysis when persona changes
    setCurrentTranscript(''); // Reset transcript
  };

  const handleRecordingComplete = async (data: { transcript: string; durationSeconds: number }) => {
    if (!selectedPersonaId) {
      alert('Please select a persona first');
      return;
    }

    setCurrentTranscript(data.transcript);
    setLoading(true);
    try {
      const result = await analyzeSpeech({
        personaId: selectedPersonaId,
        transcript: data.transcript,
        durationSeconds: data.durationSeconds,
      });
      setAnalysis(result);
      
      // Show modal if confirmation is needed
      if (result.needsConfirmation) {
        setShowModal(true);
      }
    } catch (error) {
      console.error('Failed to analyze speech:', error);
      alert('Failed to analyze speech. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Speech Persona Coach</h1>
          <p className="text-sm text-gray-600 mt-1">
            Improve your speaking skills with AI-powered feedback
          </p>
        </div>
      </header>

      {/* Main Content - Three Column Layout */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          {/* Left Column - Persona Selector */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <PersonaSelector
              onSelect={handlePersonaSelect}
              selectedPersonaId={selectedPersonaId}
            />
          </div>

          {/* Center Column - Mic Recorder */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Recording</h2>
                {selectedPersonaId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Persona selected. Ready to record.
                  </p>
                )}
                {!selectedPersonaId && (
                  <p className="text-xs text-amber-600 mt-1">
                    Please select a persona first
                  </p>
                )}
              </div>
              <div className="flex-1">
                <MicRecorder
                  onRecordingComplete={handleRecordingComplete}
                  disabled={!selectedPersonaId || loading}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-5 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Analyzing your speech...</p>
                  </div>
                </div>
              )}

              {!loading && !analysis && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <p>Your analysis results will appear here</p>
                    <p className="text-sm mt-2">Select a persona and record to get started</p>
                  </div>
                </div>
              )}

              {!loading && analysis && (
                <div className="space-y-6">
                  {/* Overall Metrics Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border-2 border-blue-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Speech Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">Words per minute</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {analysis.metrics.wpm.toFixed(0)}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">Fillers per minute</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {analysis.metrics.fillersPerMin.toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">Total words</div>
                        <div className="text-2xl font-bold text-gray-700">
                          {analysis.metrics.totalWords}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">Total fillers</div>
                        <div className="text-2xl font-bold text-red-600">
                          {analysis.metrics.totalFillers}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Persona Score Breakdown */}
                  <PersonaScoreBreakdown
                    dimensions={analysis.personaScore.dimensions}
                    overall={analysis.personaScore.overall}
                  />

                  {/* Transcript */}
                  <TranscriptView
                    transcript={currentTranscript}
                    highlights={analysis.highlights}
                  />

                  {/* Performance Scores (10-point scale) */}
                  <ScoreCard dimensions={analysis.coaching.personaScores10} />

                  {/* Coaching Panel */}
                  <CoachingPanel coaching={analysis.coaching} />

                  {/* Emotion Analysis */}
                  <EmotionGraph perSentenceEmotions={analysis.perSentenceEmotions || []} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Conscious Pause Modal */}
      {analysis && (
        <ConsciousPauseModal
          isOpen={showModal}
          attemptId={analysis.attemptId}
          personaId={selectedPersonaId || ''}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
