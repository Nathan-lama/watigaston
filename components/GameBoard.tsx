import Cell from '@/components/Cell';
import TurtleAnimation from '@/components/TurtleAnimation';
import { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { PieceAdjustments } from '@/utils/pieceAdjustments';
import { PathPosition } from '@/utils/pathFinding';
import { Direction, getPieceConfig, rotateDirectionsClockwise } from '@/utils/puzzleTypes';
import ConnectionDebugger from '@/components/ConnectionDebugger';
import { debugPuzzle6Issue } from '@/utils/debugHelpers';

interface GameBoardProps {
  grid: (string | null)[][];
  setGrid: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
  gridSize: number;
  onCheckPath: (cellDirections?: Record<string, Direction[]>) => void;
  validPath: PathPosition[];
  lockedCells: {row: number, col: number}[]; // Nouvelle prop pour les cellules verrouillées
  adjustments?: PieceAdjustments;
  boardImage?: string; // Nouvelle prop pour l'image du plateau
  showDebugger?: boolean; // Nouvelle prop pour afficher/masquer le débogueur
  showDirections?: boolean; // Nouvelle prop
}

const GameBoard = ({ 
  grid, 
  setGrid, 
  gridSize, 
  onCheckPath, 
  validPath,
  lockedCells = [], // Par défaut, aucune cellule n'est verrouillée
  adjustments, 
  boardImage = '/Board-lvl1.png',
  showDebugger = false,
  showDirections = false,
}: GameBoardProps) => {
  const [boardWidth, setBoardWidth] = useState(0);
  const [boardHeight, setBoardHeight] = useState(0);
  const rows = 3;
  const cols = 5;

  // État pour stocker les directions de chaque cellule
  const [cellDirections, setCellDirections] = useState<Record<string, Direction[]>>({});

  // Ajouter un état pour stocker les rotations visuelles des pièces
  const [cellRotations, setCellRotations] = useState<Record<string, number>>({});

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
    directions?: Direction[];
    rotation?: number; // Ajouter la rotation
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
          
          // Effacer également les directions associées
          const newDirections = { ...cellDirections };
          delete newDirections[`${oldRow},${oldCol}`];
          setCellDirections(newDirections);
        }
      }
      
      // Placer la pièce à la nouvelle position
      newGrid[row][col] = item.type;
      
      // Conserver les directions personnalisées après rotation
      if (item.directions) {
        console.log(`Pièce placée: ${item.type} en [${row},${col}] avec directions personnalisées:`, item.directions);
        // Utiliser directement les directions personnalisées de l'item
        setCellDirections(prev => ({
          ...prev,
          [`${row},${col}`]: [...item.directions] // Copie profonde des directions
        }));
      } else {
        // Si pas de directions personnalisées, utiliser les directions par défaut
        const pieceConfig = getPieceConfig(item.type);
        if (pieceConfig) {
          setCellDirections(prev => ({
            ...prev,
            [`${row},${col}`]: [...pieceConfig.directions]
          }));
        }
      }
      
      // Enregistrer la rotation visuelle de la pièce si disponible
      if (item.rotation !== undefined) {
        setCellRotations(prev => ({
          ...prev,
          [`${row},${col}`]: item.rotation
        }));
        console.log(`Rotation visuelle enregistrée: ${item.rotation}° pour [${row},${col}]`);
      }

      console.log(`Pièce placée: ${item.type} en [${row}][${col}] avec directions:`, 
                 item.directions || getPieceConfig(item.type)?.directions);
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

  // Fonction pour faire pivoter une pièce
  const handleRotatePiece = (position: { row: number; col: number }) => {
    try {
      // Add a safeguard at the beginning of the function
      if (!position || position.row === undefined || position.col === undefined) {
        console.error("Invalid position for rotation:", position);
        return;
      }

      const { row, col } = position;
      
      // Additional logging to help debug
      console.log(`Rotating piece at [${row},${col}]`);
      
      // Rest of the function remains the same
      if (!grid || !grid[row][col] || isCellLocked(row, col)) {
        console.log("Cannot rotate: no piece, grid undefined, or cell locked");
        return;
      }
      
      const pieceType = grid[row][col];
      if (!pieceType) return;
      
      // Obtenir les directions actuelles
      const currentDirections = cellDirections[`${row},${col}`] || 
                               getPieceConfig(pieceType)?.directions || [];
      
      // Faire pivoter les directions
      const newDirections = rotateDirectionsClockwise(currentDirections);
      
      // Mettre à jour l'état des directions
      setCellDirections(prev => ({
        ...prev,
        [`${row},${col}`]: newDirections
      }));
      
      // Mettre à jour aussi la rotation visuelle
      setCellRotations(prev => {
        const currentRotation = prev[`${row},${col}`] || 0;
        return {
          ...prev,
          [`${row},${col}`]: (currentRotation + 90) % 360
        };
      });

      console.log(`Pièce en [${row},${col}] pivotée: ${currentDirections} -> ${newDirections}`);
    } catch (error) {
      console.error("Erreur lors de la rotation de la pièce:", error);
    }
  };

  // Calculer l'espacement de la grille en fonction des ajustements
  const gridGap = adjustments?.board.gridGap || 0;
  const boardScale = adjustments?.board.scale || 1.2; 
  const cellSize = adjustments?.board.cellSize || 107;
  
  // Calculer la taille totale de la grille basée sur les cellules
  const totalGridWidth = cellSize * cols + gridGap * (cols - 1);
  const totalGridHeight = cellSize * rows + gridGap * (rows - 1);

  // Passer cellDirections à la fonction handleCheckPath
  const handleCheckPathWithDirections = () => {
    console.log("Envoi des directions personnalisées:", cellDirections);
    onCheckPath(cellDirections);
  };

  // Ajouter cette fonction pour réinitialiser les directions
  const resetAllDirectionsToDefault = () => {
    const newDirections: Record<string, Direction[]> = {};
    
    // Parcourir la grille et réappliquer les directions par défaut
    grid.forEach((row, rowIndex) => {
      row.forEach((cellType, colIndex) => {
        if (cellType) {
          const pieceConfig = getPieceConfig(cellType);
          if (pieceConfig) {
            newDirections[`${rowIndex},${colIndex}`] = [...pieceConfig.directions];
          }
        }
      });
    });
    
    setCellDirections(newDirections);
    console.log("Directions réinitialisées aux valeurs par défaut");
  };

  // Fonction de diagnostic spécifique pour les problèmes de validation
  const handleDiagnosePath = () => {
    console.log("=== DIAGNOSTIC DU CHEMIN ===");
    console.log("Appel du débogueur spécifique...");
    debugPuzzle6Issue(grid, cellDirections);
  };

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
            priority="grid"
            style={{ 
              pointerEvents: 'none',
              userSelect: 'none',
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
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onRotate={handleRotatePiece} // Ajouter le gestionnaire de rotation
                  position={{ row: rowIndex, col: colIndex }} // Ensure position is explicitly passed
                  transparent={true}
                  adjustments={adjustments}
                  cellSize={cellSize}
                  isLocked={isCellLocked(rowIndex, colIndex)} // Indiquer si la cellule est verrouillée
                  directions={cellDirections[`${rowIndex},${colIndex}`]}
                  showDirections={showDirections}
                  rotation={cellRotations[`${rowIndex},${colIndex}`] || 0} // Passer la rotation
                />
              ))
            ))}
          </div>
        </div>

        {/* Animation de la tortue si le chemin est valide */}
        {validPath.length > 0 && (
          <TurtleAnimation 
            path={validPath} 
            cellSize={cellSize}
          />
        )}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button 
          onClick={handleCheckPathWithDirections}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-full transform transition-transform hover:scale-105 shadow-md"
        >
          Vérifier le chemin
        </button>
        
        <button 
          onClick={resetAllDirectionsToDefault}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full text-sm"
        >
          Réinitialiser directions
        </button>
        
        {/* Nouveau bouton de diagnostic */}
        <button 
          onClick={handleDiagnosePath}
          className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-full text-sm"
        >
          Diagnostiquer chemin
        </button>
      </div>

      {/* Ajouter le débogueur si showDebugger est true */}
      {showDebugger && (
        <ConnectionDebugger grid={grid} cellDirections={cellDirections} />
      )}
    </div>
  );
};

export default GameBoard;