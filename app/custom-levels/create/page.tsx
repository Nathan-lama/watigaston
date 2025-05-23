'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { puzzlePieces } from '@/utils/puzzleTypes';
import GameBoard from '@/components/GameBoard';
import DraggableItem from '@/components/DraggableItem';
import { defaultAdjustments } from '@/utils/pieceAdjustments';

// Function to detect touch devices
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Options for TouchBackend
const touchBackendOptions = {
  enableMouseEvents: true,
  enableTouchEvents: true,
  delay: 50,
  ignoreContextMenu: true,
};

export default function CreateCustomLevel() {
  const router = useRouter();
  const [isTouch, setIsTouch] = useState(isTouchDevice());
  const [grid, setGrid] = useState<(string | null)[][]>(Array(3).fill(null).map(() => Array(5).fill(null)));
  const [lockedCells, setLockedCells] = useState<{row: number, col: number}[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [boardImage, setBoardImage] = useState('/Board-lvl1.png');
  const [availablePieces, setAvailablePieces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grouper les pièces par type
  const puzzlePiecesByType = Object.entries(puzzlePieces).reduce((acc, [key, piece]) => {
    const type = key.split('_')[0];
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(piece);
    return acc;
  }, {} as Record<string, typeof puzzlePieces[keyof typeof puzzlePieces][]>);

  const handleTogglePiece = (pieceType: string) => {
    setAvailablePieces(prev => {
      if (prev.includes(pieceType)) {
        return prev.filter(p => p !== pieceType);
      } else {
        return [...prev, pieceType];
      }
    });
  };

  const handleResetGrid = () => {
    setGrid(Array(3).fill(null).map(() => Array(5).fill(null)));
  };

  // Add this function to automatically lock cells when pieces are placed
  const handlePiecePlaced = (row: number, col: number, pieceType: string) => {
    console.log(`Piece placed at [${row},${col}]: ${pieceType}`);
    // Automatically lock the cell when a piece is placed
    if (!lockedCells.some(cell => cell.row === row && cell.col === col)) {
      setLockedCells([...lockedCells, { row, col }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation checks
    if (!name) {
      setError("Le nom du niveau est obligatoire");
      setLoading(false);
      return;
    }

    // Check if we have at least one available piece selected
    if (availablePieces.length === 0) {
      setError("Sélectionnez au moins une pièce disponible");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending data:", {
        name,
        description,
        difficulty,
        boardImage,
        grid,
        lockedCells,
        availablePieces,
        userId: "default-user-id" // Provide a default userId for demonstration
      });

      const response = await fetch('/api/custom-levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          difficulty,
          boardImage,
          grid,
          lockedCells,
          availablePieces,
          userId: "default-user-id" // Provide a default userId for demonstration
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur lors de la création du niveau');
      }

      router.push('/custom-levels');
    } catch (error) {
      console.error('Error creating custom level:', error);
      setError('Erreur lors de la création du niveau: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DndProvider 
      backend={isTouch ? TouchBackend : HTML5Backend} 
      options={isTouch ? touchBackendOptions : { enableMouseEvents: true }}
    >
      <div className="min-h-screen bg-blue-50 p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-800">Créer un niveau personnalisé</h1>
            <Link 
              href="/custom-levels" 
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Retour à la liste
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">Nom du niveau</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-1">Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                    rows={3}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-800 mb-1">Difficulté</label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                  >
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Pièces disponibles pour le joueur</h3>
                
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {Object.values(puzzlePieces)
                    .filter(piece => piece.type.startsWith('puzzle_')) // Only allow puzzle pieces
                    .map(piece => (
                      <div 
                        key={piece.type}
                        className={`p-2 border rounded-md cursor-pointer transition-colors ${
                          availablePieces.includes(piece.type) 
                            ? 'bg-blue-100 border-blue-300' 
                            : 'bg-gray-50 border-gray-300'
                        }`}
                        onClick={() => handleTogglePiece(piece.type)}
                      >
                        <div className="flex justify-center mb-1">
                          <img 
                            src={piece.imagePath} 
                            alt={piece.name} 
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                        <div className="text-xs text-center truncate">{piece.name}</div>
                      </div>
                    ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Les pièces de départ, d'arrivée et les obstacles sont placés automatiquement dans le niveau.
                    Les joueurs ne peuvent utiliser que les pièces de puzzle que vous sélectionnez ci-dessus.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Conception du niveau</h3>
              <p className="text-sm text-gray-600 mb-4">
                Placez les pièces sur la grille pour créer votre niveau personnalisé
              </p>
              
              <GameBoard
                grid={grid}
                setGrid={(newGrid) => {
                  // When grid is updated, check for new pieces and lock them
                  setGrid(newGrid);
                  
                  // Compare the new grid with the current grid to find newly placed pieces
                  for (let row = 0; row < newGrid.length; row++) {
                    for (let col = 0; col < newGrid[row].length; col++) {
                      if (newGrid[row][col] && (!grid[row] || grid[row][col] !== newGrid[row][col])) {
                        handlePiecePlaced(row, col, newGrid[row][col]!);
                      }
                    }
                  }
                }}
                gridSize={5}
                onCheckPath={() => {}}
                validPath={[]}
                lockedCells={lockedCells}
                adjustments={defaultAdjustments}
                boardImage={boardImage}
                handleResetGrid={handleResetGrid}
              />
              
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.values(puzzlePieces).map((piece) => (
                  <div key={piece.type} className="w-16">
                    <DraggableItem
                      type={piece.type}
                      name={piece.name}
                      imagePath={piece.imagePath}
                      category={piece.type.split('_')[0]}
                      directions={piece.directions}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Link 
                href="/custom-levels" 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Création en cours...' : 'Créer le niveau'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DndProvider>
  );
}
