import Cell from '@/components/Cell';
import { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { PieceAdjustments } from '@/utils/pieceAdjustments';

interface GameBoardProps {
  grid: (string | null)[][];
  setGrid: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
  gridSize: number;
  onCheckPath: () => void;
  adjustments?: PieceAdjustments;
}

const GameBoard = ({ grid, setGrid, gridSize, onCheckPath, adjustments }: GameBoardProps) => {
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

  const handleDropOnCell = (row: number, col: number, item: { type: string; category: string }) => {
    // On enregistre le type complet de la pièce pour pouvoir déterminer son image
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

  // Calculer l'espacement de la grille en fonction des ajustements
  const gridGap = adjustments?.board.gridGap || 0;
  const boardScale = adjustments?.board.scale || 1.2; // Modifié de 1 à 1.2
  const cellSize = adjustments?.board.cellSize || 80; // Taille de cellule par défaut
  
  // Calculer la taille totale de la grille basée sur les cellules
  const totalGridWidth = cellSize * cols + gridGap * (cols - 1);
  const totalGridHeight = cellSize * rows + gridGap * (rows - 1);

  return (
    <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-lg shadow-xl border border-green-300">
      <div className="relative mx-auto" style={{ width: 'fit-content' }}>
        {/* Image du plateau avec échelle ajustable */}
        <div style={{ 
          position: 'relative', 
          zIndex: 1,
          transform: `scale(${boardScale})`,
          transformOrigin: 'center',
          margin: '0 auto'
        }}>
          <Image 
            src="/Board-lvl1.png" 
            width={500} 
            height={300} 
            alt="Plateau de jeu"
            className="rounded-md"
            priority
            style={{ 
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          />
        </div>

        {/* Grille indépendante du plateau */}
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            transform: 'translate(-50%, -50%)',
            width: totalGridWidth,
            height: totalGridHeight,
            zIndex: 2
          }}
        >
          <div 
            className="grid"
            style={{ 
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
              gap: `${gridGap}px`,
              width: '100%',
              height: '100%'
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
                  adjustments={adjustments}
                  cellSize={cellSize}
                />
              ))
            ))}
          </div>
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
