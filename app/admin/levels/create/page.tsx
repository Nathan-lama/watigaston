'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { puzzlePieces } from '@/utils/puzzleTypes';
import GameBoard from '@/components/GameBoard';
import DraggableItem from '@/components/DraggableItem';
import { defaultAdjustments } from '@/utils/pieceAdjustments';

export default function CreateLevel() {
  const router = useRouter();
  const [grid, setGrid] = useState<(string | null)[][]>(Array(3).fill(null).map(() => Array(5).fill(null)));
  const [lockedCells, setLockedCells] = useState<{row: number, col: number}[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [boardImage, setBoardImage] = useState('/Board-lvl1.png');
  const [availablePieces, setAvailablePieces] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
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

  const toggleCellLock = (row: number, col: number) => {
    const isLocked = lockedCells.some(cell => cell.row === row && cell.col === col);
    
    if (isLocked) {
      // Déverrouiller la cellule
      setLockedCells(lockedCells.filter(cell => !(cell.row === row && cell.col === col)));
    } else {
      // Verrouiller la cellule si elle contient une pièce
      if (grid[row][col]) {
        setLockedCells([...lockedCells, { row, col }]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/levels', {
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
          published,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du niveau');
      }

      router.push('/admin/levels');
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la création du niveau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Créer un niveau</h1>
          <Link 
            href="/admin/levels" 
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom du niveau</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="easy">Facile</option>
                  <option value="medium">Moyen</option>
                  <option value="hard">Difficile</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="boardImage" className="block text-sm font-medium text-gray-700 mb-1">Image du plateau</label>
                <input
                  id="boardImage"
                  type="text"
                  value={boardImage}
                  onChange={(e) => setBoardImage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publier le niveau</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Pièces disponibles</h3>
              
              {Object.entries(puzzlePiecesByType).map(([type, pieces]) => (
                <div key={type} className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2 capitalize">{type === 'debut' ? 'Départ' : type === 'fin' ? 'Arrivée' : type}</h4>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {pieces.map(piece => (
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
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Conception du niveau</h3>
            <p className="text-sm text-gray-600 mb-4">
              Placez les pièces sur la grille puis verrouillez-les en cliquant dessus avec la touche Shift enfoncée.
            </p>
            
            <GameBoard
              grid={grid}
              setGrid={setGrid}
              gridSize={5}
              onCheckPath={() => {}}
              validPath={[]}
              lockedCells={lockedCells}
              adjustments={defaultAdjustments}
              boardImage={boardImage}
              handleResetGrid={() => setGrid(Array(3).fill(null).map(() => Array(5).fill(null)))}
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
              href="/admin/levels" 
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
  );
}
