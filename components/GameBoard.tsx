import Cell from '@/components/Cell';
import { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';

interface GameBoardProps {
  grid: (string | null)[][];
  setGrid: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
  gridSize: number;
  onCheckPath: () => void;
}

const GameBoard = ({ grid, setGrid, gridSize, onCheckPath }: GameBoardProps) => {
  const [boardWidth, setBoardWidth] = useState(0);
  const [boardHeight, setBoardHeight] = useState(0);
  const rows = 3;
  const cols = 5;

  // Récupérer les dimensions de l'image au chargement
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setBoardWidth(img.width);
      setBoardHeight(img.height);
    };
    img.src = '/Board-lvl1.png';
  }, []);

  const handleDropOnCell = (row: number, col: number, item: { type: string }) => {
    const newGrid = [...grid];
    newGrid[row][col] = item.type;
    setGrid(newGrid);
  };

  // Remove an item from a cell when clicked
  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col]) {
      const newGrid = [...grid];
      newGrid[row][col] = null;
      setGrid(newGrid);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-lg shadow-xl border border-green-300">
      <div className="relative mx-auto" style={{ width: 'fit-content' }}>
        {/* Image du plateau */}
        <Image 
          src="/Board-lvl1.png" 
          width={500} 
          height={300} 
          alt="Plateau de jeu"
          className="rounded-md"
        />
        
        {/* Grille superposée sur l'image */}
        <div 
          className="absolute top-0 left-0 w-full h-full grid"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }}
        >
          {Array(rows).fill(null).map((_, rowIndex) => (
            Array(cols).fill(null).map((_, colIndex) => (
              <Cell 
                key={`${rowIndex}-${colIndex}`} 
                content={grid[rowIndex]?.[colIndex] || null} 
                onDrop={(item) => handleDropOnCell(rowIndex, colIndex, item)}
                position={{ row: rowIndex, col: colIndex }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                transparent={true}
              />
            ))
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <button 
          onClick={onCheckPath}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-full transform transition-transform hover:scale-105 shadow-md"
        >
          Vérifier le chemin
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
