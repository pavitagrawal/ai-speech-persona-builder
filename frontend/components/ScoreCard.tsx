'use client';

import { PersonaScores10 } from '@/lib/types';

interface ScoreCardProps {
  dimensions: PersonaScores10;
}

interface DimensionConfig {
  label: string;
  color: string;
  bgColor: string;
}

const dimensionConfigs: Record<keyof PersonaScores10, DimensionConfig> = {
  confidence: {
    label: 'Confidence',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  clarity: {
    label: 'Clarity',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  energy: {
    label: 'Energy',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  structure: {
    label: 'Structure',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
};

function getScoreLabel(score: number): string {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Needs Work';
  return 'Poor';
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  if (score >= 4) return 'text-orange-600';
  return 'text-red-600';
}

export default function ScoreCard({ dimensions }: ScoreCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Scores</h3>
      <div className="space-y-4">
        {(Object.keys(dimensions) as Array<keyof PersonaScores10>).map((key) => {
          const score = dimensions[key];
          const config = dimensionConfigs[key];
          const percentage = (score / 10) * 100;

          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${config.color}`}>
                  {config.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                    {score.toFixed(1)}/10
                  </span>
                  <span className={`text-xs ${getScoreColor(score)}`}>
                    ({getScoreLabel(score)})
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${config.bgColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

