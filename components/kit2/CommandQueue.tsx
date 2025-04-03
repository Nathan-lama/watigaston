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
    const baseClass = "flex flex-col items-center justify-center p-2 rounded-md";
    
    // Active command style
    const activeClass = isActive 
      ? "bg-blue-500 text-white shadow-lg transform scale-110 ring-2 ring-blue-300" 
      : "bg-gray-100";
    
    // Combined style
    const className = `${baseClass} ${activeClass} ${index < currentIndex ? "opacity-50" : ""}`;
    
    // Define the content for each command type
    let content;
    let label;
    
    switch (command) {
      case 'up':
        content = <span className="text-lg">⏩</span>;
        label = "Avancer";
        break;
      case 'down':
        content = <span className="text-lg">⬇️</span>;
        label = "Tourner bas";
        break;
      case 'left':
        content = <span className="text-lg">⬅️</span>;
        label = "Tourner gauche";
        break;
      case 'right':
        content = <span className="text-lg">➡️</span>;
        label = "Tourner droite";
        break;
      case 'action':
        content = <span className="text-lg">⚡</span>;
        label = "Action";
        break;
      default:
        content = null;
        label = "";
    }
    
    return (
      <div className={className}>
        {content}
        <span className="text-xs mt-1">{label}</span>
      </div>
    );
  };

  return (
    <div className="border rounded-lg border-gray-200 p-4 min-h-[200px] bg-gray-50">
      {commands.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
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
