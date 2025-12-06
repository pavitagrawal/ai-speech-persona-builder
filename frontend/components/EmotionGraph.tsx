'use client';

import { useMemo } from 'react';

interface EmotionGraphProps {
  perSentenceEmotions: string[];
}

const emotionValues: Record<string, number> = {
  uncertain: 3,
  neutral: 5,
  warm: 8,
  confident: 9,
  energetic: 8.5,
  calm: 6,
  anxious: 2,
  enthusiastic: 9.5,
  excited: 9,
  happy: 8.5,
  serious: 5.5,
  friendly: 8,
  professional: 7,
  casual: 6.5,
  formal: 7.5,
  relaxed: 7,
  tense: 3,
  bored: 4,
  engaged: 8.5,
};

const emotionColors: Record<string, string> = {
  uncertain: 'bg-yellow-400',
  neutral: 'bg-gray-400',
  warm: 'bg-orange-400',
  confident: 'bg-green-400',
  energetic: 'bg-blue-400',
  calm: 'bg-indigo-400',
  anxious: 'bg-red-400',
  enthusiastic: 'bg-purple-400',
  excited: 'bg-pink-400',
  happy: 'bg-yellow-300',
  serious: 'bg-gray-500',
  friendly: 'bg-green-300',
  professional: 'bg-blue-500',
  casual: 'bg-cyan-400',
  formal: 'bg-slate-500',
  relaxed: 'bg-teal-400',
  tense: 'bg-red-500',
  bored: 'bg-gray-600',
  engaged: 'bg-violet-400',
};

const emotionLabels: Record<string, string> = {
  uncertain: 'Uncertain',
  neutral: 'Neutral',
  warm: 'Warm',
  confident: 'Confident',
  energetic: 'Energetic',
  calm: 'Calm',
  anxious: 'Anxious',
  enthusiastic: 'Enthusiastic',
  excited: 'Excited',
  happy: 'Happy',
  serious: 'Serious',
  friendly: 'Friendly',
  professional: 'Professional',
  casual: 'Casual',
  formal: 'Formal',
  relaxed: 'Relaxed',
  tense: 'Tense',
  bored: 'Bored',
  engaged: 'Engaged',
};

export default function EmotionGraph({ perSentenceEmotions }: EmotionGraphProps) {
  const analysis = useMemo(() => {
    if (!perSentenceEmotions || perSentenceEmotions.length === 0) {
      return null;
    }

    const maxValue = 10;
    const data = perSentenceEmotions.map((emotion) => {
      const emotionLower = emotion.toLowerCase();
      return {
        emotion: emotionLower,
        label: emotionLabels[emotionLower] || emotion,
        value: emotionValues[emotionLower] || 5,
        color: emotionColors[emotionLower] || 'bg-gray-400',
      };
    });

    // Calculate statistics
    const avgValue = data.reduce((sum, item) => sum + item.value, 0) / data.length;
    const emotionCounts: Record<string, number> = {};
    data.forEach((item) => {
      emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
    });

    const dominantEmotion = Object.entries(emotionCounts).reduce((a, b) =>
      emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b
    )[0];

    const uniqueEmotions = Object.keys(emotionCounts);

    return { data, avgValue, dominantEmotion, uniqueEmotions, emotionCounts };
  }, [perSentenceEmotions]);

  if (!analysis) {
    return null;
  }

  const { data, avgValue, dominantEmotion, uniqueEmotions, emotionCounts } = analysis;
  const dominantData = data.find((d) => d.emotion === dominantEmotion) || data[0];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Emotional Analysis</h3>
      
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="text-xs text-gray-600 mb-1">Average Emotion</div>
            <div className="text-2xl font-bold text-blue-600">
              {avgValue.toFixed(1)}/10
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {avgValue >= 7 ? 'Positive' : avgValue >= 5 ? 'Neutral' : 'Needs Improvement'}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="text-xs text-gray-600 mb-1">Dominant Emotion</div>
            <div className="text-lg font-bold text-purple-600 capitalize">
              {dominantData.label}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {emotionCounts[dominantEmotion]} of {data.length} sentences
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="text-xs text-gray-600 mb-1">Emotion Variety</div>
            <div className="text-2xl font-bold text-green-600">
              {uniqueEmotions.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Unique emotions detected</div>
          </div>
        </div>

        {/* Bar Chart Visualization - Emotion by Sentence */}
        {data.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Emotion by Sentence</h4>
            <div className="flex items-end gap-2 h-48 mb-4">
              {data.map((item, index) => {
                const height = (item.value / 10) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex flex-col justify-end h-full relative">
                      <div
                        className={`w-full ${item.color} rounded-t transition-all duration-300 hover:opacity-90 cursor-pointer group-hover:shadow-lg border-2 border-transparent group-hover:border-gray-400`}
                        style={{ height: `${height}%`, minHeight: '8px' }}
                        title={`Sentence ${index + 1}: ${item.label} (${item.value.toFixed(1)}/10)`}
                      />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                          <div className="font-semibold">{item.label}</div>
                          <div className="text-xs opacity-90">{item.value.toFixed(1)}/10</div>
                        </div>
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 mx-auto"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 font-semibold">S{index + 1}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5 capitalize truncate w-full">
                        {item.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
              Hover over bars to see detailed emotion scores
            </div>
          </div>
        )}

        {/* Emotion Distribution */}
        {uniqueEmotions.length > 1 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Emotion Distribution</h4>
            <div className="space-y-2">
              {uniqueEmotions.map((emotion) => {
                const count = emotionCounts[emotion];
                const percentage = (count / data.length) * 100;
                const emotionData = data.find((d) => d.emotion === emotion) || data[0];
                return (
                  <div key={emotion} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-700 capitalize">
                      {emotionData.label}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full ${emotionData.color} transition-all duration-500 flex items-center justify-end pr-2`}
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Emotion Types</h4>
          <div className="flex flex-wrap gap-3">
            {uniqueEmotions.map((emotion) => {
              const emotionData = data.find((d) => d.emotion === emotion) || data[0];
              return (
                <div
                  key={emotion}
                  className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200"
                >
                  <div className={`w-3 h-3 rounded-full ${emotionData.color}`} />
                  <span className="text-sm text-gray-700 font-medium">
                    {emotionData.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

