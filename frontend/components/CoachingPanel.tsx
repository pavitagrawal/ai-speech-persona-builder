'use client';

import { Coaching } from '@/lib/types';

interface CoachingPanelProps {
  coaching: Coaching;
}

export default function CoachingPanel({ coaching }: CoachingPanelProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Summary</h3>
        <p className="text-gray-700 leading-relaxed">{coaching.summary}</p>
      </div>

      {/* Tips */}
      {coaching.tips && coaching.tips.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Tips</h3>
          <ul className="space-y-2">
            {coaching.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700 flex-1">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Exercise */}
      {coaching.exercise && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Practice Exercise</h3>
          <p className="text-blue-900 leading-relaxed">{coaching.exercise}</p>
        </div>
      )}
    </div>
  );
}

