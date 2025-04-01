import { useState } from 'react';
import { Level, levels } from '@/utils/levels';

interface LevelSelectorProps {
  currentLevelId: number;
  onSelectLevel: (level: Level) => void;
}

const LevelSelector = ({ currentLevelId, onSelectLevel }: LevelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentLevel = levels.find(lvl => lvl.id === currentLevelId) || levels[0];

  return (
    <div className="bg-white rounded-lg shadow-md border border-amber-200 overflow-hidden">
      <div 
        className="px-4 py-3 bg-amber-50 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div className="bg-amber-100 text-amber-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
            {currentLevel.id}
          </div>
          <h3 className="font-medium text-amber-800">{currentLevel.name}</h3>
        </div>
        <div className="text-amber-500">
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 border-t border-amber-100">
          <p className="text-sm text-gray-600 mb-3">{currentLevel.description}</p>
          <div className="text-xs mb-3">
            <span className={`inline-block px-2 py-1 rounded-full ${
              currentLevel.difficulty === 'easy' 
                ? 'bg-green-100 text-green-800' 
                : currentLevel.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {currentLevel.difficulty === 'easy' ? 'Facile' : currentLevel.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {levels.map(level => (
              <button
                key={level.id}
                className={`py-2 px-3 text-sm rounded-md ${
                  level.id === currentLevelId
                    ? 'bg-amber-500 text-white font-medium'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
                onClick={() => {
                  onSelectLevel(level);
                  setIsOpen(false);
                }}
              >
                Niveau {level.id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelSelector;
