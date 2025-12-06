'use client';

import { PersonaScoreDimensions } from '@/lib/types';

interface PersonaScoreBreakdownProps {
  dimensions: PersonaScoreDimensions;
  overall: number;
}

export default function PersonaScoreBreakdown({ dimensions, overall }: PersonaScoreBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 0.4) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Needs Work';
    return 'Poor';
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Persona Score Breakdown</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
          <span className="text-lg font-semibold text-gray-800">Overall Score</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">
              {(overall * 100).toFixed(0)}%
            </span>
            <p className="text-xs text-gray-600 mt-1">{getScoreLabel(overall)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(dimensions).map(([key, value]) => {
            const percentage = value * 100;
            const colorClass = getScoreColor(value);
            return (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 ${colorClass}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-lg font-bold">{percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-current opacity-60 transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs mt-1 opacity-80">{getScoreLabel(value)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

