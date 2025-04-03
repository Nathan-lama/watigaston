'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import GameBoard from '@/components/GameBoard';
import { defaultAdjustments } from '@/utils/pieceAdjustments';
import CustomDragLayer from '@/components/CustomDragLayer';
import { getEmptyKit2Grid } from '@/utils/kit2CustomLevels';
import { puzzlePieces } from '@/utils/puzzleTypes';
import DraggableItem from '@/components/DraggableItem';

// Types for the form
type Direction = 'up' | 'down' | 'left' | 'right';
type Command = Direction | 'action';
type Position = { row: number; col: number };

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

export default function CreateKit2CustomLevel() {
  const router = useRouter();
  const [isTouch, setIsTouch] = useState(isTouchDevice());
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  
  // Grid state
  const [grid, setGrid] = useState<(string | null)[][]>(getEmptyKit2Grid());
  const [lockedCells, setLockedCells] = useState<{row: number, col: number}[]>([]);
  const [startPosition, setStartPosition] = useState<Position | null>(null);
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Enhance validation with clearer error messages
  const validateForm = (): boolean => {
    // Reset previous errors
    setError(null);
    
    // Validate name
    if (!name.trim()) {
      setError('Le nom du niveau est obligatoire');
      return false;
    }
    
    // Check if we have a start position
    if (!startPosition) {
      setError('Vous devez placer une position de départ (début_1) sur le plateau');
      return false;
    }
    
    // Check if we have a target position
    if (!targetPosition) {
      setError('Vous devez placer une position d\'arrivée (fin_1) sur le plateau');
      return false;
    }
    
    // Check if the grid is valid
    if (!grid || grid.length === 0) {
      setError('La grille de jeu est invalide');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    // Validate the form
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare the data
      const levelData = {
        name,
        description,
        difficulty,
        grid,
        lockedCells,
        startPosition,
        targetPosition
      };
      
      console.log("Sending data:", JSON.stringify(levelData, null, 2));
  
      const response = await fetch('/api/kit2-custom-levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(levelData)
      });
      
      // Check if the request was successful
      if (!response.ok) {
        // Try to read error details from the response
        let errorDetails = '';
        try {
          const errorJson = await response.json();
          errorDetails = errorJson.details 
            ? (Array.isArray(errorJson.details) ? errorJson.details.join(', ') : errorJson.details)
            : errorJson.error || 'Unknown error';
        } catch {
          errorDetails = `HTTP ${response.status} error`;
        }
        
        throw new Error(`Error creating level: ${errorDetails}`);
      }
      
      const data = await response.json();
      console.log("Success response:", data);
      
      router.push('/kit2/custom-levels');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(`${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGridUpdate = (newGrid: (string | null)[][]) => {
    setGrid(newGrid);
    
    // Scan the grid to find and update start and target positions
    for (let row = 0; row < newGrid.length; row++) {
      for (let col = 0; col < newGrid[row].length; col++) {
        const cell = newGrid[row][col];
        
        if (cell?.startsWith('debut_')) {
          setStartPosition({ row, col });
          // Lock the start position
          if (!lockedCells.some(pos => pos.row === row && pos.col === col)) {
            setLockedCells([...lockedCells, { row, col }]);
          }
        }
        
        if (cell?.startsWith('fin_')) {
          setTargetPosition({ row, col });
          // Lock the target position
          if (!lockedCells.some(pos => pos.row === row && pos.col === col)) {
            setLockedCells([...lockedCells, { row, col }]);
          }
        }
        
        // Lock obstacles too
        if (cell?.startsWith('obstacle_')) {
          if (!lockedCells.some(pos => pos.row === row && pos.col === col)) {
            setLockedCells([...lockedCells, { row, col }]);
          }
        }
      }
    }
  };

  return (
    <DndProvider backend={isTouch ? TouchBackend : HTML5Backend} options={isTouch ? touchBackendOptions : undefined}>
      <CustomDragLayer adjustments={defaultAdjustments} />
      <div className="min-h-screen bg-blue-50 p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-800">Créer un niveau Kit2 personnalisé</h1>
            <Link 
              href="/kit2/custom-levels" 
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Retour à la liste
            </Link>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}
          
          <div className="bg-white p-6 rounded-xl shadow-xl mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du niveau</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ex: Mon niveau Kit2"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Une petite description du niveau..."
                  />
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md mb-4">
                  <h3 className="font-medium text-blue-800 mb-2">État du niveau</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>
                      <span className="font-medium">Départ:</span> {startPosition ? `[${startPosition.row}, ${startPosition.col}]` : 'Non placé'}
                    </p>
                    <p>
                      <span className="font-medium">Arrivée:</span> {targetPosition ? `[${targetPosition.row}, ${targetPosition.col}]` : 'Non placée'}
                    </p>
                    <p>
                      <span className="font-medium">Obstacles:</span> {lockedCells.filter(cell => 
                        grid[cell.row][cell.col]?.startsWith('obstacle_')
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-xl mb-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Conception du plateau</h2>
            <p className="text-gray-600 mb-4">
              Placez le départ (Gaston), l'arrivée (maison), et des obstacles sur le plateau.
              Ces éléments seront verrouillés pour le joueur qui devra programmer le chemin de Gaston.
            </p>
            
            <div className="mb-6">
              <GameBoard
                grid={grid}
                setGrid={handleGridUpdate}
                gridSize={5}
                onCheckPath={() => {}}
                validPath={[]}
                lockedCells={lockedCells}
                adjustments={defaultAdjustments}
                boardImage="/Board-lvl1.png"
                handleResetGrid={() => setGrid(getEmptyKit2Grid())}
              />
            </div>
            
            {/* Add piece palette for placement */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Pièces disponibles à placer</h3>
              <div className="flex flex-wrap gap-3 mb-4">
                {/* Group pieces by category for better organization */}
                <div className="w-full">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Points de départ et d'arrivée</h4>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {Object.values(puzzlePieces)
                      .filter(piece => piece.type.startsWith('debut_') || piece.type.startsWith('fin_'))
                      .map((piece) => (
                        <div key={piece.type} className="piece-container">
                          <DraggableItem
                            type={piece.type}
                            name={piece.name}
                            imagePath={piece.imagePath}
                            category={piece.type.split('_')[0]}
                            directions={piece.directions}
                          />
                          <p className="text-xs text-center mt-1">{piece.name}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>
                
                <div className="w-full">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Obstacles</h4>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {Object.values(puzzlePieces)
                      .filter(piece => piece.type.startsWith('obstacle_'))
                      .map((piece) => (
                        <div key={piece.type} className="piece-container">
                          <DraggableItem
                            type={piece.type}
                            name={piece.name}
                            imagePath={piece.imagePath}
                            category={'obstacle'}
                            directions={piece.directions}
                          />
                          <p className="text-xs text-center mt-1">{piece.name}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-3 border border-yellow-100 rounded-md mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Placez d'abord les points de départ et d'arrivée, puis ajoutez des obstacles si nécessaire.
                  Ces éléments seront verrouillés pour le joueur.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Link
              href="/kit2/custom-levels"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Création en cours...' : 'Créer le niveau'}
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
