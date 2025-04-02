'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import GameBoard from '@/components/GameBoard';
import DraggableItem from '@/components/DraggableItem';
import { puzzlePieces } from '@/utils/puzzleTypes';
import { defaultAdjustments } from '@/utils/pieceAdjustments';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import CustomDragLayer from '@/components/CustomDragLayer';

const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
const touchBackendOptions = { enableMouseEvents: true, enableTouchEvents: true, delay: 50, ignoreContextMenu: true };

// Add this code to group puzzle pieces by type
const puzzlePiecesByType = Object.entries(puzzlePieces).reduce((acc, [key, piece]) => {
  const type = key.split('_')[0];
  if (!acc[type]) {
    acc[type] = [];
  }
  acc[type].push(piece);
  return acc;
}, {} as Record<string, typeof puzzlePieces[keyof typeof puzzlePieces][]>);

interface CustomLevel {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  grid: (string | null)[][];
  lockedCells: { row: number; col: number }[];
  availablePieces: string[];
}

export default function EditCustomLevel() {
  const { id } = useParams();
  const router = useRouter();
  const [level, setLevel] = useState<CustomLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [grid, setGrid] = useState<(string | null)[][]>([]);
  const [lockedCells, setLockedCells] = useState<{ row: number; col: number }[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [availablePieces, setAvailablePieces] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [pathResult, setPathResult] = useState<string | null>(null);
  const [validPath, setValidPath] = useState<PathPosition[]>([]);
  const [usedPieces, setUsedPieces] = useState<string[]>([]);

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const response = await fetch(`/api/custom-levels/${id}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du niveau personnalisé');
        }

        const data = await response.json();

        // Ensure the grid is properly initialized
        if (!Array.isArray(data.grid) || data.grid.length === 0 || !Array.isArray(data.grid[0])) {
          throw new Error('La grille du niveau est invalide ou vide');
        }

        setLevel(data);
        setGrid(data.grid);
        setLockedCells(data.lockedCells);
        setName(data.name);
        setDescription(data.description);
        setDifficulty(data.difficulty);
        setAvailablePieces(data.availablePieces);
      } catch (error) {
        setError('Erreur: Impossible de charger le niveau personnalisé');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLevel();
  }, [id]);

  useEffect(() => {
    if (level && grid) {
      // Initialize used pieces
      const initialUsedPieces: string[] = [];
      grid.forEach(row => {
        row.forEach(cell => {
          if (cell && cell.startsWith('puzzle_')) {
            initialUsedPieces.push(cell);
          }
        });
      });
      setUsedPieces(initialUsedPieces);
    }
  }, [level, grid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/custom-levels/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          difficulty,
          grid,
          lockedCells,
          availablePieces,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde du niveau');
      }

      router.push('/custom-levels');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde du niveau');
    } finally {
      setSaving(false);
    }
  };

  // Add this function to handle toggling pieces
  const handleTogglePiece = (pieceType: string) => {
    setAvailablePieces(prev => {
      if (prev.includes(pieceType)) {
        return prev.filter(p => p !== pieceType);
      } else {
        return [...prev, pieceType];
      }
    });
  };

  // Add this function to automatically lock cells when pieces are placed
  const handlePiecePlaced = (row: number, col: number, pieceType: string) => {
    console.log(`Piece placed at [${row},${col}]: ${pieceType}`);
    // Automatically lock the cell when a piece is placed
    if (!lockedCells.some(cell => cell.row === row && cell.col === col)) {
      setLockedCells([...lockedCells, { row, col }]);
    }
    
    // Also update the usedPieces list if it's a puzzle piece
    if (pieceType.startsWith('puzzle_')) {
      setUsedPieces(prev => [...prev, pieceType]);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (error || !level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || 'Niveau introuvable'}</p>
      </div>
    );
  }

  return (
    <DndProvider backend={isTouch ? TouchBackend : HTML5Backend} options={isTouch ? touchBackendOptions : undefined}>
      <div className="min-h-screen bg-blue-50 p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-800">Modifier le niveau</h1>
            <Link
              href="/custom-levels"
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Retour
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-1">Nom du niveau</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-1">Difficulté</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            >
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
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
                gridSize={grid[0]?.length || 5} // Safely access grid size
                onCheckPath={() => {}}
                validPath={validPath}
                lockedCells={lockedCells}
                adjustments={defaultAdjustments}
                boardImage="/Board-lvl1.png"
                handleResetGrid={() => setGrid(level.grid)}
                onPiecePlaced={(pieceType) => {
                  // This handler is called separately, so we don't need to duplicate the locking logic here
                  if (pieceType.startsWith('puzzle_')) {
                    setUsedPieces(prev => [...prev, pieceType]);
                  }
                }}
                onPieceRemoved={(pieceType) => {
                  if (pieceType.startsWith('puzzle_')) {
                    setUsedPieces(prev => prev.filter(p => p !== pieceType));
                  }
                }}
              />
            </div>
            
            <div className="md:w-1/3">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Pièces disponibles pour le joueur</h3>
              
              {/* Replace the existing puzzlePiecesByType mapping with this filtered version */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                {Object.values(puzzlePieces)
                  .filter(piece => piece.type.startsWith('puzzle_')) // Only show puzzle pieces
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
                  <strong>Note:</strong> Les joueurs ne peuvent utiliser que les pièces de puzzle sélectionnées ci-dessus.
                  Les pièces de départ, d'arrivée et les obstacles sont placés et verrouillés par vous comme créateur du niveau.
                </p>
              </div>
              
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Pièces à placer dans le niveau</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Ces pièces peuvent être placées sur le plateau mais seront verrouillées pour le joueur.
                </p>
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
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
