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
  // Button style classes
  const directionButtonClass = "bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-lg shadow transition-all duration-200 active:scale-95 flex items-center justify-center";
  const advanceButtonClass = "bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow transition-all duration-200 active:scale-95";
  const actionButtonClass = "bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-lg shadow transition-all duration-200 active:scale-95";
  const controlButtonClass = "font-bold py-3 px-6 rounded-lg shadow transition-all duration-200 active:scale-95";
  
  return (
    <div className="bg-gray-100 p-4 rounded-xl shadow-inner">
      {/* Direction pad with updated labels/functions */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Up button is now "Advance" - move in current direction */}
        <div className="col-start-2">
          <button 
            onClick={() => onAddCommand('up')} 
            disabled={isExecuting}
            className={advanceButtonClass + " " + (isExecuting ? "opacity-50 cursor-not-allowed" : "")}
            aria-label="Advance"
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs mt-1">Avancer</span>
            </div>
          </button>
        </div>
        
        {/* Left direction - only changes direction */}
        <div className="col-start-1">
          <button 
            onClick={() => onAddCommand('left')} 
            disabled={isExecuting}
            className={directionButtonClass + " " + (isExecuting ? "opacity-50 cursor-not-allowed" : "")}
            aria-label="Turn Left"
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs mt-1">Tourner à gauche</span>
            </div>
          </button>
        </div>
        
        {/* Empty cell in middle position */}
        <div className="col-start-2 row-start-2">
          {/* Empty space */}
        </div>
        
        {/* Right direction - only changes direction */}
        <div className="col-start-3">
          <button 
            onClick={() => onAddCommand('right')} 
            disabled={isExecuting}
            className={directionButtonClass + " " + (isExecuting ? "opacity-50 cursor-not-allowed" : "")}
            aria-label="Turn Right"
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs mt-1">Tourner à droite</span>
            </div>
          </button>
        </div>
        
        {/* Down direction - only changes direction */}
        <div className="col-start-2 row-start-3">
          <button 
            onClick={() => onAddCommand('down')} 
            disabled={isExecuting}
            className={directionButtonClass + " " + (isExecuting ? "opacity-50 cursor-not-allowed" : "")}
            aria-label="Turn Down"
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-xs mt-1">Tourner vers le bas</span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Action button - kept the same */}
      <div className="mb-4">
        <button 
          onClick={() => onAddCommand('action')} 
          disabled={isExecuting}
          className={actionButtonClass + " w-full " + (isExecuting ? "opacity-50 cursor-not-allowed" : "")}
          aria-label="Action"
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Action
          </div>
        </button>
      </div>
      
      {/* Control buttons (Start/Stop) */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onStart} 
          disabled={isExecuting}
          className={`${controlButtonClass} bg-green-500 hover:bg-green-600 text-white ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Start
          </div>
        </button>
        
        <button 
          onClick={onStop} 
          disabled={!isExecuting}
          className={`${controlButtonClass} bg-red-500 hover:bg-red-600 text-white ${!isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Stop
          </div>
        </button>
      </div>
    </div>
  );
};

export default RemoteControl;
