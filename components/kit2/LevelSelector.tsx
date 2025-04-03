import React, { useState } from 'react';
import { Kit2Level, kit2Levels } from '@/utils/kit2Levels';

interface LevelSelectorProps {
  currentLevelId: number;
  onSelectLevel: (level: Kit2Level) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ 
  currentLevelId, 
  onSelectLevel 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find the current level
  const currentLevel = kit2Levels.find(lvl => lvl.id === currentLevelId) || kit2Levels[0];

  // Function to get difficulty badge style
  const getDifficultyStyle = (difficulty: string) => {
    switch(difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-green-200 overflow-hidden">
      <div 
        className="px-4 py-3 bg-green-50 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
            {currentLevel.id}
          </div>
          <h3 className="font-medium text-green-800">{currentLevel.name}</h3>
        </div>
        <div className="text-green-500">
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
        <div className="p-3 border-t border-green-100">
          <p className="text-sm text-gray-600 mb-3">{currentLevel.description}</p>
          <div className="text-xs mb-3">
            <span className={`inline-block px-2 py-1 rounded-full ${getDifficultyStyle(currentLevel.difficulty)}`}>
              {currentLevel.difficulty === 'easy' ? 'Facile' : currentLevel.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {kit2Levels.map((level) => (
              <button
                key={level.id}
                className={`py-2 px-3 text-sm rounded-md ${
                  level.id === currentLevelId
                    ? 'bg-green-500 text-white font-medium'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
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
