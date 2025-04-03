'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import RemoteControl from '@/components/kit2/RemoteControl';
import CommandQueue from '@/components/kit2/CommandQueue';
import GameBoard from '@/components/GameBoard';
import { defaultAdjustments } from '@/utils/pieceAdjustments';
import CustomDragLayer from '@/components/CustomDragLayer';
import { CustomKit2Level } from '@/utils/kit2CustomLevels';

// Types
type Direction = 'up' | 'down' | 'left' | 'right';
type Command = Direction | 'action';
type Position = { row: number; col: number };

// Touch detection
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

const touchBackendOptions = {
  enableMouseEvents: true,
  enableTouchEvents: true,
  delay: 50,
  ignoreContextMenu: true,
};

const CELL_SIZE = 107;

export default function PlayKit2CustomLevel() {
  const { id } = useParams();
  const levelId = parseInt(id as string);
  
  const [isTouch, setIsTouch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Level data
  const [level, setLevel] = useState<CustomKit2Level | null>(null);
  const [grid, setGrid] = useState<(string | null)[][]>([]);
  const [lockedCells, setLockedCells] = useState<{row: number, col: number}[]>([]);
  
  // Turtle state
  const [turtlePosition, setTurtlePosition] = useState<Position>({ row: 0, col: 0 });
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [turtleDirection, setTurtleDirection] = useState<'north' | 'east' | 'south' | 'west'>('east');
  
  // Command state
  const [commandQueue, setCommandQueue] = useState<Command[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(-1);
  
  // Debug
  const [debug, setDebug] = useState({
    showGrid: false,
    gridOffsetX: 97,     
    gridOffsetY: 44,     
    cellSize: CELL_SIZE, 
    turtleOffsetX: 0, 
    turtleOffsetY: 0,
    turtleSize: 80,
  });
  
  // Feedback message
  const [feedback, setFeedback] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: '' });
  
  // Initialize touch detection
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);
  
  // Load the level data
  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const response = await fetch(`/api/kit2-custom-levels/${levelId}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du niveau personnalisé');
        }
        
        const data: CustomKit2Level = await response.json();
        
        setLevel(data);
        setGrid(JSON.parse(JSON.stringify(data.grid))); // Deep copy
        setLockedCells(data.lockedCells);
        
        if (data.startPosition) {
          setTurtlePosition(data.startPosition);
        }
        
        if (data.targetPosition) {
          setTargetPosition(data.targetPosition);
        }
        
      } catch (error) {
        console.error('Error loading level:', error);
        setError('Erreur lors du chargement du niveau');
      } finally {
        setLoading(false);
      }
    };
    
    if (levelId) {
      fetchLevel();
    }
  }, [levelId]);
  
  // Add a command to the queue
  const handleAddCommand = (command: Command) => {
    if (!isExecuting) {
      setCommandQueue([...commandQueue, command]);
    }
  };
  
  // Clear the command queue
  const handleClearCommands = () => {
    if (!isExecuting) {
      setCommandQueue([]);
    }
  };
  
  // Execute the command queue
  const handleStartExecution = async () => {
    if (commandQueue.length === 0 || isExecuting) return;
    
    // Clear any previous feedback
    setFeedback({ show: false, success: false, message: '' });
    
    setIsExecuting(true);
    setCurrentCommandIndex(-1);
    
    // Reset turtle to start position and direction
    setTurtlePosition({...level.startPosition});
    setTurtleDirection('north'); // Default starting direction (facing UP)
    
    try {
      // Short delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use local variables to track position and direction during execution
      let currentPos = {...level.startPosition};
      let currentDirection: 'north' | 'east' | 'south' | 'west' = 'north'; // Default starting direction
      
      // Execute each command with proper delays
      for (let i = 0; i < commandQueue.length; i++) {
        // Update which command is active in the UI
        setCurrentCommandIndex(i);
        
        // Short delay for UI to update
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Get the current command
        const command = commandQueue[i];
        console.log(`Executing command ${i+1}/${commandQueue.length}: ${command}`);
        
        // Handle each command type
        if (command === 'up') {
          // "Up" command now means "advance forward" in the current direction
          const nextPos = { ...currentPos };
          
          // Move forward in the current facing direction
          switch (currentDirection) {
            case 'north':
              if (nextPos.row > 0) nextPos.row -= 1;
              break;
            case 'east':
              if (nextPos.col < grid[0].length - 1) nextPos.col += 1;
              break;
            case 'south':
              if (nextPos.row < grid.length - 1) nextPos.row += 1;
              break;
            case 'west':
              if (nextPos.col > 0) nextPos.col -= 1;
              break;
          }
          
          // Check if the move would go out-of-bounds
          const isOutOfBounds = (
            (currentDirection === 'north' && currentPos.row === 0) ||
            (currentDirection === 'east' && currentPos.col === grid[0].length - 1) ||
            (currentDirection === 'south' && currentPos.row === grid.length - 1) ||
            (currentDirection === 'west' && currentPos.col === 0)
          );
          
          if (isOutOfBounds) {
            console.log(`⚠️ Commande ${i+1} invalide: mouvement hors du plateau`);
            
            // Show error feedback
            setFeedback({
              show: true,
              success: false,
              message: "Gaston ne peut pas sortir du plateau!"
            });
            
            // Allow the error feedback to be visible
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Reset to starting position
            setTurtlePosition({...level.startPosition});
            setTurtleDirection('north');
            setCommandQueue([]);
            setIsExecuting(false);
            setCurrentCommandIndex(-1);
            return;
          }
          
          // Check if the cell has an obstacle
          const hasObstacle = grid[nextPos.row][nextPos.col]?.startsWith('obstacle_');
          const isDecorative = grid[nextPos.row][nextPos.col]?.startsWith('deco_');
          
          if (hasObstacle && !isDecorative) {
            console.log(`⚠️ Commande ${i+1} invalide: obstacle détecté`);
            
            // Show obstacle hit animation
            const turtleElement = document.getElementById('turtle');
            if (turtleElement) {
              turtleElement.classList.add('error-flash');
              await new Promise(resolve => setTimeout(resolve, 800));
              turtleElement.classList.remove('error-flash');
            }
            
            // Show error feedback
            setFeedback({
              show: true,
              success: false,
              message: "Gaston a rencontré un obstacle!"
            });
            
            // Allow the error feedback to be visible
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Reset to starting position
            setTurtlePosition({...level.startPosition});
            setTurtleDirection('north');
            setCommandQueue([]);
            setIsExecuting(false);
            setCurrentCommandIndex(-1);
            return;
          }
          
          // Move is valid, update turtle position
          currentPos = { ...nextPos };
          setTurtlePosition({ ...currentPos });
        } 
        else if (command === 'right') {
          // Change direction to right/east
          currentDirection = 'east';
          setTurtleDirection(currentDirection);
        } 
        else if (command === 'down') {
          // Change direction to down/south
          currentDirection = 'south';
          setTurtleDirection(currentDirection);
        } 
        else if (command === 'left') {
          // Change direction to left/west
          currentDirection = 'west';
          setTurtleDirection(currentDirection);
        }
        
        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      // Check win condition
      if (targetPosition && 
          currentPos.row === targetPosition.row && 
          currentPos.col === targetPosition.col) {
        // Successful completion!
        console.log("🎉 Success! Destination reached!");
        
        // Show success animation
        const turtleElement = document.getElementById('turtle');
        if (turtleElement) {
          turtleElement.classList.add('success-bounce');
        }
        
        // Show success feedback
        setFeedback({
          show: true,
          success: true,
          message: "Bravo! Gaston a atteint sa destination!"
        });
        
        // Keep success feedback visible for a moment
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Failed to reach destination
        console.log("❌ Failed to reach destination");
        
        // Show failure feedback
        setFeedback({
          show: true,
          success: false,
          message: "Gaston n'a pas atteint sa destination."
        });
        
        // Allow the error feedback to be visible
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Reset to starting position after failure
        setTurtlePosition({...level.startPosition});
        setTurtleDirection('north');
        setCommandQueue([]);
      }
    } catch (error) {
      console.error("Error during execution:", error);
    } finally {
      // Always reset execution state when done
      setIsExecuting(false);
      setCurrentCommandIndex(-1);
    }
  };
  
  // Stop the execution
  const handleStopExecution = () => {
    setIsExecuting(false);
    setCurrentCommandIndex(-1);
  };
  
  // Reset the game
  const handleResetGame = () => {
    if (!level) return;
    
    setTurtlePosition({...level.startPosition});
    setTurtleDirection('north'); // Set direction to north by default
    setCommandQueue([]);
    setIsExecuting(false);
    setCurrentCommandIndex(-1);
    setFeedback({ show: false, success: false, message: '' });
  };
  
  // Check if a cell contains an obstacle
  const isCellObstacle = (row: number, col: number): boolean => {
    return grid[row]?.[col]?.startsWith('obstacle_') || false;
  };
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement du niveau...</div>;
  }
  
  if (error || !level) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || 'Erreur: Niveau introuvable'}</p>
        <Link href="/kit2/custom-levels" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Retour à la liste
        </Link>
      </div>
    );
  }
  
  return (
    <DndProvider backend={isTouch ? TouchBackend : HTML5Backend} options={isTouch ? touchBackendOptions : undefined}>
      <CustomDragLayer adjustments={defaultAdjustments} />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-blue-800">
              <span className="inline-block">🐢</span> {level.name}
            </h1>
            <Link 
              href="/kit2/custom-levels" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow"
            >
              Retour à la liste
            </Link>
          </div>
          
          {level.description && (
            <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
              <p className="text-gray-700 mb-0">{level.description}</p>
            </div>
          )}
          
          {/* Feedback message */}
          {feedback.show && (
            <div 
              className={`p-4 mb-6 rounded-lg text-white text-center transition-all duration-500 transform ${
                feedback.success 
                  ? 'bg-green-600 scale-100' 
                  : 'bg-red-600 scale-100'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="text-3xl mr-3">
                  {feedback.success ? '🎉' : '😕'}
                </span>
                <span className="text-xl font-bold">{feedback.message}</span>
              </div>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="relative bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-xl shadow-2xl border border-green-300">
                {/* Game Board */}
                <GameBoard
                  grid={grid}
                  setGrid={setGrid}
                  gridSize={5}
                  onCheckPath={() => {}}
                  validPath={[]}
                  lockedCells={level.lockedCells}
                  adjustments={defaultAdjustments}
                  boardImage="/Board-lvl1.png"
                  handleResetGrid={() => {}}
                />
                
                {/* Turtle Character */}
                <div 
                  id="turtle"
                  className="absolute transition-all duration-300 ease-in-out z-50"
                  style={{
                    top: `${6 + debug.gridOffsetY + turtlePosition.row * debug.cellSize + debug.cellSize/2}px`,
                    left: `${6 + debug.gridOffsetX + turtlePosition.col * debug.cellSize + debug.cellSize/2}px`,
                    transform: `translate(-50%, -50%) rotate(${getTurtleRotation(turtleDirection)}deg)`,
                    filter: isExecuting ? 'drop-shadow(0 0 8px rgba(255,255,0,0.7))' : 'none'
                  }}
                >
                  <Image
                    src="/Sprites/tortue/tortue.png"
                    alt="Gaston la tortue"
                    width={80} 
                    height={80}
                    className={isExecuting ? 'animate-pulse' : ''}
                    priority
                  />
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/3">
              <div className="bg-gray-100 rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Télécommande</h2>
                
                <RemoteControl 
                  onAddCommand={handleAddCommand}
                  onStart={handleStartExecution}
                  onStop={handleStopExecution}
                  isExecuting={isExecuting}
                />
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Programme</h2>
                  <button 
                    onClick={handleClearCommands}
                    disabled={isExecuting}
                    className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                  >
                    Effacer tout
                  </button>
                </div>
                
                <CommandQueue 
                  commands={commandQueue} 
                  currentIndex={currentCommandIndex}
                />
                
                <button
                  onClick={handleResetGame}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                >
                  Réinitialiser le jeu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

// Helper function to get rotation angle based on direction
function getTurtleRotation(direction: 'north' | 'east' | 'south' | 'west'): number {
  switch (direction) {
    case 'north': return -90;
    case 'east': return 0;
    case 'south': return 90;
    case 'west': return 180;
    default: return 0;
  }
}
