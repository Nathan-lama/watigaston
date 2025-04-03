import React from 'react';

interface RemoteControlProps {
  onAddCommand: (command: 'up' | 'down' | 'left' | 'right' | 'action') => void;
  onStart: () => void;
  onStop: () => void;
  isExecuting: boolean;
}

const RemoteControl: React.FC<RemoteControlProps> = ({
  onAddCommand,
  onStart,
  onStop,
  isExecuting
}) => {
  // Common button style for consistent sizing
  const buttonBaseClass = "w-full h-16 rounded-lg shadow transition-all duration-200 active:scale-95 flex flex-col items-center justify-center";
  
  // Style classes for different button types
  const controlButtonClass = `${buttonBaseClass} font-medium text-white`;
  const directionButtonClass = `${buttonBaseClass} bg-gray-200 hover:bg-gray-300 text-gray-700`;
  const advanceButtonClass = `${buttonBaseClass} bg-blue-500 hover:bg-blue-600 text-white`;
  const actionButtonClass = `${buttonBaseClass} bg-amber-500 hover:bg-amber-600 text-white`;
  
  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 p-5 rounded-xl shadow-inner border border-gray-300">
      {/* Control buttons (Start/Stop) at the top */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          onClick={onStart} 
          disabled={isExecuting}
          className={`${controlButtonClass} bg-green-500 hover:bg-green-600 ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Start</span>
          </div>
        </button>
        
        <button 
          onClick={onStop} 
          disabled={!isExecuting}
          className={`${controlButtonClass} bg-red-500 hover:bg-red-600 ${!isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Stop</span>
          </div>
        </button>
      </div>

      {/* Direction pad with consistent sizing and improved layout */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Empty top-left cell */}
        <div></div>
        
        {/* Up button (Advance) */}
        <div>
          <button 
            onClick={() => onAddCommand('up')} 
            disabled={isExecuting}
            className={`${advanceButtonClass} ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Advance"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium text-sm mt-1">Avancer</span>
          </button>
        </div>
        
        {/* Empty top-right cell */}
        <div></div>
        
        {/* Left button */}
        <div>
          <button 
            onClick={() => onAddCommand('left')} 
            disabled={isExecuting}
            className={`${directionButtonClass} ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Turn Left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm mt-1">Gauche</span>
          </button>
        </div>
        
        {/* Center - Action button */}
        <div>
          <button 
            onClick={() => onAddCommand('action')} 
            disabled={isExecuting}
            className={`${actionButtonClass} ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Action"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-medium text-sm mt-1">Action</span>
          </button>
        </div>
        
        {/* Right button */}
        <div>
          <button 
            onClick={() => onAddCommand('right')} 
            disabled={isExecuting}
            className={`${directionButtonClass} ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Turn Right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm mt-1">Droite</span>
          </button>
        </div>
        
        {/* Empty bottom-left cell */}
        <div></div>
        
        {/* Down button */}
        <div>
          <button 
            onClick={() => onAddCommand('down')} 
            disabled={isExecuting}
            className={`${directionButtonClass} ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Turn Down"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm mt-1">Bas</span>
          </button>
        </div>
        
        {/* Empty bottom-right cell */}
        <div></div>
      </div>
      
      {/* Remote control instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 mt-2">
        <p className="mb-1"><strong>Comment utiliser la télécommande:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Utilisez les flèches pour orienter Gaston</li>
          <li>Le bouton bleu fait avancer Gaston</li>
          <li>Appuyez sur Start pour exécuter les commandes</li>
        </ul>
      </div>
    </div>
  );
};

export default RemoteControl;
