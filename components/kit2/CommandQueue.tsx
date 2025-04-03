import React from 'react';

type Command = 'up' | 'down' | 'left' | 'right' | 'action';

interface CommandQueueProps {
  commands: Command[];
  currentIndex: number;
}

const CommandQueue: React.FC<CommandQueueProps> = ({ commands, currentIndex }) => {
  // Function to render command icon based on type
  const renderCommandIcon = (command: Command, index: number) => {
    const isActive = index === currentIndex;
    
    // Base styles
    const baseClass = "flex items-center justify-center p-2 rounded-md";
    
    // Active command style
    const activeClass = isActive 
      ? "bg-blue-500 text-white shadow-lg transform scale-110 ring-2 ring-blue-300" 
      : "bg-gray-100";
    
    // Combined style
    const className = `${baseClass} ${activeClass} ${index < currentIndex ? "opacity-50" : ""}`;
    
    // Return appropriate icon based on command
    switch (command) {
      case 'up':
        return (
          <div className={className}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        );
      case 'down':
        return (
          <div className={className}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        );
      case 'left':
        return (
          <div className={className}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
        );
      case 'right':
        return (
          <div className={className}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        );
      case 'action':
        return (
          <div className={className}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg border-gray-200 p-4 min-h-[200px] bg-gray-50">
      {commands.length > 0 ? (
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {commands.map((command, index) => (
            <div 
              key={index} 
              className="transition-all duration-200"
              title={`Command ${index + 1}: ${command}`}
            >
              {renderCommandIcon(command, index)}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400 italic">
          Aucune commande programmée
        </div>
      )}
    </div>
  );
};

export default CommandQueue;
