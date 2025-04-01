'use client';

import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import GameBoard from '@/components/GameBoard';
import ItemsGallery from '@/components/ItemsGallery';
import CustomDragLayer from '@/components/CustomDragLayer';
import LevelSelector from '@/components/LevelSelector';
import { findPath } from '@/utils/pathFinding';
import { defaultAdjustments, PieceAdjustments } from '@/utils/pieceAdjustments';
import { Level, getDefaultLevel, getLevelById } from '@/utils/levels';

// Fonction pour détecter si l'appareil utilise un écran tactile
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Niveau d'exemple vide 3x5
const SAMPLE_LEVEL = Array(3).fill(null).map(() => Array(5).fill(null));
// Vous pouvez ajouter des pièces prédéfinies si nécessaire
// SAMPLE_LEVEL[0][0] = 'debut_1';
// SAMPLE_LEVEL[2][4] = 'fin_1';

// Options pour TouchBackend
const touchBackendOptions = {
  enableMouseEvents: true, // Permet l'utilisation de la souris même sur un appareil tactile
  enableTouchEvents: true,
  delay: 50, // Réduire le délai
  ignoreContextMenu: true,
};

// Options pour HTML5Backend pour désactiver l'aperçu par défaut
const html5Options = {
  enableMouseEvents: true,
};

// Création d'une grille vide bien définie
const createEmptyGrid = (rows: number, cols: number): (string | null)[][] => {
  return Array(rows).fill(null).map(() => Array(cols).fill(null));
};

export default function Home() {
  const [gridSize, setGridSize] = useState(5); // Colonnes
  const [grid, setGrid] = useState<(string | null)[][]>(createEmptyGrid(3, 5));
  const [pathResult, setPathResult] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [showAdjustmentTools, setShowAdjustmentTools] = useState(false);
  
  // Nouvel état pour les ajustements des pièces
  const [adjustments, setAdjustments] = useState<PieceAdjustments>(defaultAdjustments);
  // État pour suivre la pièce actuellement en cours d'ajustement
  const [currentPiece, setCurrentPiece] = useState<string>('puzzle_1');
  
  // Nouveau état pour gérer le niveau actuel
  const [currentLevel, setCurrentLevel] = useState<Level>(getDefaultLevel());
  
  // Vérifier si c'est un appareil tactile lors du chargement côté client
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);
  
  // Initialiser la grille au chargement du niveau avec plus de sécurité
  useEffect(() => {
    if (!currentLevel) {
      console.error("Current level is undefined");
      setGrid(createEmptyGrid(3, 5));
      return;
    }
    
    try {
      // Vérifier que la grille du niveau est valide
      if (Array.isArray(currentLevel.grid) && 
          currentLevel.grid.length > 0 && 
          Array.isArray(currentLevel.grid[0])) {
        
        // Créer une copie profonde de la grille
        const newGrid = JSON.parse(JSON.stringify(currentLevel.grid));
        console.log("Initialisation de la grille:", newGrid);
        
        setGrid(newGrid);
      } else {
        console.error("Invalid level grid structure");
        setGrid(createEmptyGrid(3, 5));
      }
    } catch (error) {
      console.error("Error initializing grid:", error);
      setGrid(createEmptyGrid(3, 5));
    }
    
    setPathResult(null);
  }, [currentLevel]);
  
  const handleCheckPath = () => {
    const hasValidPath = findPath(grid);
    setPathResult(
      hasValidPath 
        ? "Bravo ! Il existe un chemin valide du Petit Chaperon Rouge à la maison."
        : "Pas de chemin valide trouvé. Essayez encore !"
    );
  };
  
  const handleResetGrid = () => {
    // Réinitialiser la grille au niveau actuel
    setGrid([...currentLevel.grid.map(row => [...row])]);
    setPathResult(null);
  };
  
  const handleLoadLevel = () => {
    setGrid(SAMPLE_LEVEL);
    setPathResult(null);
  };

  // Fonction pour exporter les ajustements au format JSON
  const exportAdjustments = () => {
    const dataStr = JSON.stringify(adjustments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'piece_adjustments.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Fonction pour mettre à jour un ajustement spécifique
  const updatePieceAdjustment = (piece: string, property: keyof PieceAdjustment, value: number) => {
    setAdjustments(prev => {
      const newAdjustments = {
        ...prev,
        pieces: {
          ...prev.pieces,
          [piece]: {
            ...prev.pieces[piece],
            [property]: value
          }
        }
      };
      console.log(`Ajustement de ${piece}.${property} à ${value}`, newAdjustments);
      return newAdjustments;
    });
  };
  
  // Fonction pour mettre à jour un ajustement global du plateau
  const updateBoardAdjustment = (property: keyof typeof adjustments.board, value: number) => {
    setAdjustments(prev => {
      const newAdjustments = {
        ...prev,
        board: {
          ...prev.board,
          [property]: value
        }
      };
      console.log(`Ajustement du plateau.${property} à ${value}`, newAdjustments);
      return newAdjustments;
    });
  };

  // Fonction pour appliquer les mêmes ajustements à toutes les pièces de puzzle
  const applyToAllPuzzlePieces = () => {
    // Récupérer les ajustements de la pièce actuelle
    const currentAdjustment = adjustments.pieces[currentPiece];
    
    // Créer un nouvel objet d'ajustements
    const newPieces = { ...adjustments.pieces };
    
    // Appliquer les mêmes ajustements à toutes les pièces de puzzle
    Object.keys(newPieces).forEach(key => {
      if (key.startsWith('puzzle_')) {
        newPieces[key] = { ...currentAdjustment };
      }
    });
    
    // Mettre à jour l'état des ajustements
    setAdjustments(prev => ({
      ...prev,
      pieces: newPieces
    }));
    
    console.log('Mêmes ajustements appliqués à toutes les pièces de puzzle:', currentAdjustment);
  };

  // Fonction pour gérer la sélection d'un nouveau niveau
  const handleLevelSelect = (level: Level) => {
    setCurrentLevel(level);
  };

  return (
    <DndProvider 
      backend={isTouch ? TouchBackend : HTML5Backend} 
      options={isTouch ? touchBackendOptions : html5Options}
    >
      <CustomDragLayer adjustments={adjustments} />
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-green-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-center text-amber-800">Le Petit Chaperon Rouge</h1>
          
          {pathResult && (
            <div className={`p-4 mb-6 rounded-lg shadow-md ${
              pathResult.includes('Bravo') 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {pathResult}
            </div>
          )}
          
          <div className="flex justify-end mb-4 space-x-3">
            <button 
              onClick={() => setShowAdjustmentTools(!showAdjustmentTools)}
              className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1 px-3 rounded"
            >
              {showAdjustmentTools ? "Masquer les réglages" : "Réglages avancés"}
            </button>
          </div>
          
          {/* Intégrer le sélecteur de niveau */}
          <div className="mb-6">
            <LevelSelector currentLevelId={currentLevel.id} onSelectLevel={handleLevelSelect} />
          </div>
          
          {showAdjustmentTools && (
            <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold">Ajustement des pièces</h3>
                <button 
                  onClick={exportAdjustments}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Exporter les réglages
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Réglages du plateau</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between">
                        <label className="text-xs text-gray-700">Échelle du plateau</label>
                        <span className="text-xs font-mono bg-gray-100 px-1 rounded">{adjustments.board.scale.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1.2" 
                        max="2" 
                        step="0.01"
                        value={adjustments.board.scale}
                        className="w-full"
                        onChange={(e) => updateBoardAdjustment('scale', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <label className="text-xs text-gray-700">Taille des cellules (px)</label>
                        <span className="text-xs font-mono bg-gray-100 px-1 rounded">{adjustments.board.cellSize}</span>
                      </div>
                      <input 
                        type="range" 
                        min="107" 
                        max="120" 
                        step="0.5"
                        value={adjustments.board.cellSize}
                        className="w-full"
                        onChange={(e) => updateBoardAdjustment('cellSize', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <label className="text-xs text-gray-700">Espacement de la grille (px)</label>
                        <span className="text-xs font-mono bg-gray-100 px-1 rounded">{adjustments.board.gridGap}</span>
                      </div>
                      <input 
                        type="range" 
                        min="-5" 
                        max="5" 
                        step="1"
                        value={adjustments.board.gridGap}
                        className="w-full"
                        onChange={(e) => updateBoardAdjustment('gridGap', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Pièce à ajuster</h4>
                  <select 
                    className="w-full p-2 border rounded mb-2 text-sm"
                    value={currentPiece}
                    onChange={(e) => setCurrentPiece(e.target.value)}
                  >
                    {Object.keys(adjustments.pieces).map(piece => (
                      <option key={piece} value={piece}>{piece}</option>
                    ))}
                  </select>
                  
                  {/* Ajouter un bouton pour appliquer à toutes les pièces de puzzle */}
                  {currentPiece.startsWith('puzzle_') && (
                    <button
                      onClick={applyToAllPuzzlePieces}
                      className="w-full mb-3 py-1 px-2 bg-green-100 text-green-800 text-xs font-medium rounded border border-green-200 hover:bg-green-200"
                    >
                      Appliquer ces réglages à toutes les pièces de puzzle
                    </button>
                  )}
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between">
                        <label className="text-xs text-gray-700">Décalage X</label>
                        <span className="text-xs font-mono bg-gray-100 px-1 rounded">{adjustments.pieces[currentPiece]?.offsetX}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="-20" 
                        max="20" 
                        step="1"
                        value={adjustments.pieces[currentPiece]?.offsetX || 0}
                        className="w-full"
                        onChange={(e) => updatePieceAdjustment(currentPiece, 'offsetX', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <label className="text-xs text-gray-700">Décalage Y</label>
                        <span className="text-xs text-gray-500">{adjustments.pieces[currentPiece]?.offsetY}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="-20" 
                        max="20" 
                        step="1"
                        value={adjustments.pieces[currentPiece]?.offsetY || 0}
                        className="w-full"
                        onChange={(e) => updatePieceAdjustment(currentPiece, 'offsetY', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <label className="text-xs text-gray-700">Échelle</label>
                        <span className="text-xs text-gray-500">{adjustments.pieces[currentPiece]?.scale.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2.5" // Augmenté à 2.5 pour permettre des pièces plus grandes
                        step="0.05" // Augmenté pour des ajustements plus rapides
                        value={adjustments.pieces[currentPiece]?.scale || 1}
                        className="w-full"
                        onChange={(e) => updatePieceAdjustment(currentPiece, 'scale', parseFloat(e.target.value))}
                      />
                      <div className="flex justify-between mt-1">
                        <button 
                          onClick={() => updatePieceAdjustment(currentPiece, 'scale', (adjustments.pieces[currentPiece]?.scale || 1) - 0.1)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                        >
                          -
                        </button>
                        <span className="text-xs">Taille</span>
                        <button 
                          onClick={() => updatePieceAdjustment(currentPiece, 'scale', (adjustments.pieces[currentPiece]?.scale || 1) + 0.1)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-40">
                <pre>{JSON.stringify(adjustments, null, 2)}</pre>
              </div>

              {/* Ajouter des boutons d'essai rapide pour vérifier que les ajustements fonctionnent */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button 
                  onClick={() => updateBoardAdjustment('scale', 1.1)}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                >
                  Zoomer plateau +10%
                </button>
                <button 
                  onClick={() => updateBoardAdjustment('scale', 0.9)}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                >
                  Dézoomer plateau -10%
                </button>
                <button 
                  onClick={() => updateBoardAdjustment('cellSize', adjustments.board.cellSize + 10)}
                  className="px-2 py-1 bg-purple-500 text-white text-xs rounded"
                >
                  Agrandir cellules +10px
                </button>
                <button 
                  onClick={() => updateBoardAdjustment('cellSize', adjustments.board.cellSize - 10)}
                  className="px-2 py-1 bg-purple-500 text-white text-xs rounded"
                >
                  Réduire cellules -10px
                </button>
                <button 
                  onClick={() => updatePieceAdjustment(currentPiece, 'scale', 1.2)}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                >
                  Agrandir pièce
                </button>
                <button 
                  onClick={() => updatePieceAdjustment(currentPiece, 'offsetX', 10)}
                  className="px-2 py-1 bg-yellow-500 text-white text-xs rounded"
                >
                  Décaler à droite
                </button>
                <button 
                  onClick={() => updatePieceAdjustment(currentPiece, 'scale', 1.5)}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                >
                  Agrandir +50%
                </button>
                <button 
                  onClick={() => updatePieceAdjustment(currentPiece, 'scale', 2.0)}
                  className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                >
                  Agrandir +100%
                </button>
                <button 
                  onClick={() => updatePieceAdjustment(currentPiece, 'scale', 0.8)}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                >
                  Réduire -20%
                </button>
              </div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <GameBoard 
                grid={grid} 
                setGrid={setGrid} 
                gridSize={gridSize} 
                onCheckPath={handleCheckPath}
                adjustments={adjustments}
                boardImage={currentLevel.boardImage}
              />
              
              <div className="mt-6 flex gap-3 justify-center">
                <button 
                  onClick={handleResetGrid}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-5 rounded-full transform transition-transform hover:scale-105 shadow-md"
                >
                  Réinitialiser niveau
                </button>
                <button 
                  onClick={handleLoadLevel}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-5 rounded-full transform transition-transform hover:scale-105 shadow-md"
                >
                  Charger niveau
                </button>
              </div>
            </div>
            
            <div className="md:w-1/3">
              <ItemsGallery />
              
              <div className="mt-6 bg-white p-5 rounded-lg shadow-lg border border-amber-200">
                <h2 className="text-xl font-bold mb-4 text-amber-800">Instructions</h2>
                <p className="mb-2 text-amber-700">1. Placez le Petit Chaperon Rouge et la maison sur la grille.</p>
                <p className="mb-2 text-amber-700">2. Ajoutez des routes pour créer un chemin.</p>
                <p className="mb-2 text-amber-700">3. Placez des obstacles (arbres, rochers) pour compliquer le jeu.</p>
                <p className="mb-2 text-amber-700">4. Cliquez sur "Vérifier le chemin" pour voir si un chemin valide existe.</p>
                <p className="text-amber-700 font-medium">⚠️ Pour retirer un élément, cliquez dessus.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DndProvider>
  );
}
