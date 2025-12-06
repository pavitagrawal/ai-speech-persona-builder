'use client';

import { useEffect, useState } from 'react';
import { Persona } from '@/lib/types';
import { fetchPersonas } from '@/lib/api';

interface PersonaSelectorProps {
  onSelect: (personaId: string) => void;
  selectedPersonaId?: string;
}

export default function PersonaSelector({ onSelect, selectedPersonaId }: PersonaSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPersonas() {
      try {
        const response = await fetchPersonas();
        setPersonas(response.personas);
      } catch (error) {
        console.error('Failed to load personas:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPersonas();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Select Persona</h2>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Persona</h2>
      <div className="space-y-4">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => onSelect(persona.id)}
            className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
              selectedPersonaId === persona.id
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{persona.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{persona.description}</p>
            <div className="text-xs text-gray-500 bg-gray-100 rounded px-3 py-1.5 inline-block">
              Target: {persona.targets.wpm[0]}-{persona.targets.wpm[1]} WPM,{' '}
              {persona.targets.maxFillersPerMin} fillers/min max
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

