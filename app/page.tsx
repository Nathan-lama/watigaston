'use client';

import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import GameBoard from '@/components/GameBoard';
import ItemsGallery from '@/components/ItemsGallery';
import CustomDragLayer from '@/components/CustomDragLayer';
import { findPath } from '@/utils/pathFinding';

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
  delayTouchStart: 50,
};

// Options pour HTML5Backend
const html5Options = {
  enableMouseEvents: true,
  enableTouchEvents: true,
  enableHoverOutsideTarget: true,
  enableKeyboardEvents: true,
};

export default function Home() {
  const [gridSize, setGridSize] = useState(5); // Colonnes
  const [grid, setGrid] = useState<(string | null)[][]>(SAMPLE_LEVEL);
  const [pathResult, setPathResult] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  
  // Vérifier si c'est un appareil tactile lors du chargement côté client
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);
  
  const handleCheckPath = () => {
    const hasValidPath = findPath(grid);
    setPathResult(
      hasValidPath 
        ? "Bravo ! Il existe un chemin valide du Petit Chaperon Rouge à la maison."
        : "Pas de chemin valide trouvé. Essayez encore !"
    );
  };
  
  const handleResetGrid = () => {
    setGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
    setPathResult(null);
  };
  
  const handleLoadLevel = () => {
    setGrid(SAMPLE_LEVEL);
    setPathResult(null);
  };

  return (
    <DndProvider 
      backend={isTouch ? TouchBackend : HTML5Backend} 
      options={isTouch ? touchBackendOptions : html5Options}
    >
      <CustomDragLayer />
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
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <GameBoard 
                grid={grid} 
                setGrid={setGrid} 
                gridSize={gridSize} 
                onCheckPath={handleCheckPath}
              />
              
              <div className="mt-6 flex gap-3 justify-center">
                <button 
                  onClick={handleResetGrid}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-5 rounded-full transform transition-transform hover:scale-105 shadow-md"
                >
                  Réinitialiser
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
