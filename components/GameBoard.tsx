import Cell from '@/components/Cell';
import TurtleAnimation from '@/components/TurtleAnimation';
import { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { PieceAdjustments } from '@/utils/pieceAdjustments';
import { PathPosition } from '@/utils/pathFinding';

interface GameBoardProps {
  grid: (string | null)[][];
  setGrid: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
  gridSize: number;
  onCheckPath: () => void;
  validPath: PathPosition[];
  lockedCells: {row: number, col: number}[]; // Nouvelle prop pour les cellules verrouillées
  adjustments?: PieceAdjustments;
  boardImage?: string; // Nouvelle prop pour l'image du plateau
}

const GameBoard = ({ 
  grid, 
  setGrid, 
  gridSize, 
  onCheckPath, 
  validPath,
  lockedCells = [], // Par défaut, aucune cellule n'est verrouillée
  adjustments, 
  boardImage = '/Board-lvl1.png' 
}: GameBoardProps) => {
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
    img.src = boardImage;
  }, [boardImage]);

  // Vérifiez si une cellule est verrouillée
  const isCellLocked = (row: number, col: number): boolean => {
    return lockedCells.some(cell => cell.row === row && cell.col === col);
  };

  const handleDropOnCell = (row: number, col: number, item: { 
    type: string; 
    category: string; 
    isFromCell?: boolean; 
    position?: { row: number; col: number };
    fromGallery?: boolean;
    uniqueId?: string;
  }) => {
    try {
      // Vérifier si la cellule est verrouillée
      if (isCellLocked(row, col)) {
        console.log(`Cellule [${row}][${col}] est verrouillée, impossible de la modifier`);
        return;
      }

      console.log("Drop détecté:", item);
      
      // Vérifications de sécurité
      if (!grid) {
        console.error("Grid is undefined");
        return;
      }
      
      // Créer une copie profonde de la grille
      const newGrid = JSON.parse(JSON.stringify(grid));
      
      // Si la pièce est déplacée depuis une autre cellule, effacer l'ancienne position
      if (item.isFromCell && item.position) {
        const { row: oldRow, col: oldCol } = item.position;
        if (oldRow !== row || oldCol !== col) { // Éviter de s'effacer soi-même
          newGrid[oldRow][oldCol] = null;
        }
      }
      
      // Placer la pièce à la nouvelle position
      newGrid[row][col] = item.type;
      
      console.log(`Pièce placée: ${item.type} en [${row}][${col}]`);
      setGrid(newGrid);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la grille:", error);
    }
  };

  // Remove an item from a cell when clicked
  const handleCellClick = (row: number, col: number) => {
    try {
      // Vérifier si la cellule est verrouillée
      if (isCellLocked(row, col)) {
        console.log(`Cellule [${row}][${col}] est verrouillée, impossible de la supprimer`);
        return;
      }

      if (!grid || !grid[row] || grid[row][col] === undefined) {
        console.error(`Cellule [${row}][${col}] inaccessible`);
        return;
      }
      
      if (grid[row][col] === null) {
        return; // Ne rien faire si la cellule est déjà vide
      }
      
      console.log(`Suppression de la pièce en [${row}][${col}]: ${grid[row][col]}`);
      
      const newGrid = [...grid];
      newGrid[row][col] = null;
      setGrid(newGrid);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Calculer l'espacement de la grille en fonction des ajustements
  const gridGap = adjustments?.board.gridGap || 0;
  const boardScale = adjustments?.board.scale || 1.2; 
  const cellSize = adjustments?.board.cellSize || 107;
  
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
            src={boardImage} 
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
                  isLocked={isCellLocked(rowIndex, colIndex)} // Indiquer si la cellule est verrouillée
                />
              ))
            ))}
          </div>
          
          {/* Animation de la tortue si le chemin est valide */}
          {validPath.length > 0 && (
            <TurtleAnimation 
              path={validPath} 
              cellSize={cellSize}
            />
          )}
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
