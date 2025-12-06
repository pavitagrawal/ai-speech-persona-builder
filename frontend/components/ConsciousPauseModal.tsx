'use client';

import { useState } from 'react';
import { confirmFeedback } from '@/lib/api';

interface ConsciousPauseModalProps {
  isOpen: boolean;
  attemptId: string;
  personaId: string;
  onClose: () => void;
}

export default function ConsciousPauseModal({
  isOpen,
  attemptId,
  personaId,
  onClose,
}: ConsciousPauseModalProps) {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlay = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await confirmFeedback({ attemptId, personaId });
      setAudioUrl(response.audioUrl);
    } catch (err) {
      setError('Failed to load feedback audio. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Feedback Audio Ready
        </h2>
        <p className="text-gray-600 mb-6">
          We've prepared personalized feedback audio based on your speech analysis. Would you like to
          listen to it?
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {audioUrl ? (
          <div className="space-y-4">
            <audio controls className="w-full" autoPlay>
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <button
              onClick={handleSkip}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handlePlay}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Loading...' : 'Play Audio'}
            </button>
            <button
              onClick={handleSkip}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

