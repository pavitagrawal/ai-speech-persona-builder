'use client';

import { Highlight } from '@/lib/types';

interface TranscriptViewProps {
  transcript: string;
  highlights: Highlight[];
}

export default function TranscriptView({ transcript, highlights }: TranscriptViewProps) {
  const words = transcript.split(/\s+/);
  const highlightSet = new Set(highlights.map((h) => h.wordIndex));

  const getHighlightColor = (wordIndex: number) => {
    const highlight = highlights.find((h) => h.wordIndex === wordIndex);
    if (!highlight) return '';
    
    switch (highlight.type) {
      case 'filler':
        return 'bg-yellow-200 text-yellow-900';
      case 'pace':
        return 'bg-orange-200 text-orange-900';
      case 'confidence':
        return 'bg-blue-200 text-blue-900';
      default:
        return 'bg-gray-200 text-gray-900';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Transcript</h3>
      <div className="prose max-w-none">
        <p className="text-gray-700 leading-relaxed">
          {words.map((word, index) => {
            const isHighlighted = highlightSet.has(index);
            return (
              <span key={index}>
                <span
                  className={
                    isHighlighted
                      ? `rounded px-1.5 py-0.5 font-medium ${getHighlightColor(index)}`
                      : ''
                  }
                >
                  {word}
                </span>
                {index < words.length - 1 && ' '}
              </span>
            );
          })}
        </p>
      </div>
      {highlights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Highlighted words indicate areas for improvement
          </p>
        </div>
      )}
    </div>
  );
}

