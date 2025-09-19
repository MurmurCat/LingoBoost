import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { LearningLevel } from '../types';

const LevelSelector: React.FC = () => {
  const { learningLevel, setLearningLevel } = useAppContext();

  const levels: { level: LearningLevel; label: string }[] = [
    { level: 'B1', label: 'B1 - Lower Intermediate' },
    { level: 'B2', label: 'B2 - Upper Intermediate' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-8">
      <h3 className="font-semibold text-slate-600 mb-3 text-center">Your CEFR Level</h3>
      <div className="flex bg-slate-200 rounded-lg p-1 space-x-1">
        {levels.map(({ level, label }) => (
          <button
            key={level}
            onClick={() => setLearningLevel(level)}
            className={`w-full py-2 px-4 rounded-md text-sm font-bold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 ${
              learningLevel === level
                ? 'bg-blue-500 text-white shadow'
                : 'text-slate-600 hover:bg-slate-300'
            }`}
            aria-pressed={learningLevel === level}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelector;
