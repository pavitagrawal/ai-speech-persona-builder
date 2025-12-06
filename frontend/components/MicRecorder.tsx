'use client';

import { useState, useEffect, useRef } from 'react';

type RecordingState = 'idle' | 'recording' | 'processing';

interface MicRecorderProps {
  onRecordingComplete: (data: { transcript: string; durationSeconds: number }) => void;
  disabled?: boolean;
}

export default function MicRecorder({ onRecordingComplete, disabled }: MicRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const stateRef = useRef<RecordingState>('idle');

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState('recording');
      stateRef.current = 'recording';
      setTranscript('');
      finalTranscriptRef.current = '';
      setError(null);
      startTimeRef.current = Date.now();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current += finalTranscript;
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Recognition error: ${event.error}`);
      setState('idle');
      stateRef.current = 'idle';
    };

    recognition.onend = () => {
      if (stateRef.current === 'recording') {
        const durationSeconds = startTimeRef.current
          ? (Date.now() - startTimeRef.current) / 1000
          : 0;
        const finalTranscript = finalTranscriptRef.current.trim() || 'No speech detected.';
        setState('processing');
        stateRef.current = 'processing';
        setTimeout(() => {
          onRecordingComplete({
            transcript: finalTranscript,
            durationSeconds,
          });
          setState('idle');
          stateRef.current = 'idle';
          setTranscript('');
          finalTranscriptRef.current = '';
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onRecordingComplete]);

  const handleStart = () => {
    if (recognitionRef.current && state === 'idle') {
      recognitionRef.current.start();
    }
  };

  const handleStop = () => {
    if (recognitionRef.current && state === 'recording') {
      recognitionRef.current.stop();
    }
  };

  const getButtonContent = () => {
    switch (state) {
      case 'recording':
        return (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 bg-white rounded-full" />
            </div>
            <span className="mt-4 text-lg font-semibold text-red-600">Recording...</span>
            <p className="text-sm text-gray-500 mt-2">Click to stop</p>
          </>
        );
      case 'processing':
        return (
          <>
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="mt-4 text-lg font-semibold text-yellow-600">Processing...</span>
          </>
        );
      default:
        return (
          <>
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="mt-4 text-lg font-semibold text-gray-700">Start Recording</span>
            <p className="text-sm text-gray-500 mt-2">Click to begin</p>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full">
      <button
        onClick={state === 'recording' ? handleStop : handleStart}
        disabled={disabled || state === 'processing'}
        className={`flex flex-col items-center ${
          disabled || state === 'processing' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {getButtonContent()}
      </button>

      {transcript && (
        <div className="mt-8 w-full max-w-2xl">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Live transcript:</p>
            <p className="text-gray-800">{transcript}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!error && state === 'idle' && (
        <p className="mt-6 text-xs text-gray-400 text-center max-w-md">
          Make sure your microphone is enabled. Your speech will be transcribed in real-time.
        </p>
      )}
    </div>
  );
}

