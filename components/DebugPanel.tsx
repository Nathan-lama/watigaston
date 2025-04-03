import { useState } from 'react';

interface DebugPanelProps {
  onToggleGridLines: () => void;
  onToggleDecorationMode: () => void;
  onRefreshGameBoard: () => void;
}

export default function DebugPanel({ 
  onToggleGridLines, 
  onToggleDecorationMode,
  onRefreshGameBoard
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="fixed right-4 bottom-4 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-500 text-white p-2 rounded-full shadow-lg"
      >
        🐞
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white p-4 rounded-lg shadow-xl border border-gray-300 w-64">
          <h3 className="font-bold text-gray-800 mb-3">Debug Tools</h3>
          
          <div className="space-y-2">
            <button 
              onClick={onToggleGridLines}
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-3 rounded text-sm"
            >
              Toggle Grid Lines
            </button>
            
            <button 
              onClick={onToggleDecorationMode}
              className="w-full bg-green-100 hover:bg-green-200 text-green-800 py-1 px-3 rounded text-sm"
            >
              Toggle Decoration Mode
            </button>
            
            <button 
              onClick={onRefreshGameBoard}
              className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-1 px-3 rounded text-sm"
            >
              Refresh Game Board
            </button>
            
            <button 
              onClick={() => console.log('Running Kit2 debug')}
              className="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 py-1 px-3 rounded text-sm"
            >
              Debug Kit2 Elements
            </button>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            Version 1.0.1 - Debug mode
          </div>
        </div>
      )}
    </div>
  );
}
