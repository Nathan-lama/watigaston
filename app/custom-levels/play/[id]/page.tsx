'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { findPath, PathPosition } from '@/utils/pathFinding';
import Link from 'next/link';
import GameBoard from '@/components/GameBoard';
import ItemsGallery from '@/components/ItemsGallery';
import CustomDragLayer from '@/components/CustomDragLayer';
import { defaultAdjustments } from '@/utils/pieceAdjustments';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { getPieceConfig } from '@/utils/puzzleTypes';

interface CustomLevel {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  grid: (string | null)[][];
  lockedCells: { row: number; col: number }[];
  availablePieces: string[];
}

export default function PlayCustomLevel() {
  const { id } = useParams();
  const router = useRouter();
  const [level, setLevel] = useState<CustomLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grid, setGrid] = useState<(string | null)[][]>([]);
  const [pathResult, setPathResult] = useState<string | null>(null);
  const [validPath, setValidPath] = useState<PathPosition[]>([]);
  const [usedPieces, setUsedPieces] = useState<string[]>([]);
  const [lockedPieces, setLockedPieces] = useState<string[]>([]);

  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const touchBackendOptions = { enableMouseEvents: true, enableTouchEvents: true, delay: 50, ignoreContextMenu: true };

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const response = await fetch(`/api/custom-levels/${id}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du niveau personnalisé');
        }

        const data = await response.json();
        console.log("Level data received:", data);

        // Validation
        if (!data.grid || !Array.isArray(data.grid) || data.grid.length === 0) {
          throw new Error('La grille du niveau est invalide ou vide');
        }

        // Set default values
        const safeLevel = {
          ...data,
          lockedCells: data.lockedCells || [],
          availablePieces: data.availablePieces || []
        };

        setLevel(safeLevel);
        setGrid([...safeLevel.grid.map(row => [...row])]);

        // Initialize used pieces
        const initialUsedPieces: string[] = [];
        safeLevel.grid.forEach(row => {
          row.forEach(cell => {
            if (cell && cell.startsWith('puzzle_')) {
              initialUsedPieces.push(cell);
            }
          });
        });
        setUsedPieces(initialUsedPieces);

        // Extract locked pieces
        const initialLockedPieces: string[] = [];
        if (safeLevel.grid && safeLevel.lockedCells) {
          safeLevel.lockedCells.forEach(cell => {
            const pieceType = safeLevel.grid[cell.row][cell.col];
            if (pieceType && pieceType.startsWith('puzzle_')) {
              initialLockedPieces.push(pieceType);
            }
          });
        }
        setLockedPieces(initialLockedPieces);
      } catch (error) {
        console.error('Error loading custom level:', error);
        setError(`Erreur: Impossible de charger le niveau personnalisé - ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLevel();
  }, [id]);

  const handleCheckPath = (cellDirections?: Record<string, Direction[]>) => {
    console.log("Vérification du chemin...");
    
    // Vérifier la présence des pièces essentielles
    let hasStart = false;
    let hasEnd = false;
    
    // Analyser la grille pour le diagnostic
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell?.startsWith('debut_')) {
          hasStart = true;
          console.log(`Pièce de départ trouvée en [${rowIndex},${colIndex}] : ${cell}`);
          const pieceConfig = getPieceConfig(cell);
          console.log(`Directions de départ: ${pieceConfig?.directions.join(', ')}`);
        }
        if (cell?.startsWith('fin_')) {
          hasEnd = true;
          console.log(`Pièce d'arrivée trouvée en [${rowIndex},${colIndex}] : ${cell}`);
          const pieceConfig = getPieceConfig(cell);
          console.log(`Directions d'arrivée: ${pieceConfig?.directions.join(', ')}`);
        }
      });
    });
    
    if (!hasStart) console.error("⚠️ Pas de pièce de départ!");
    if (!hasEnd) console.error("⚠️ Pas de pièce d'arrivée!");
    
    // Utiliser les directions personnalisées
    const path = findPath(grid, cellDirections || {});
    const hasValidPath = path.length > 0;
    
    setValidPath(path);
    setPathResult(
      hasValidPath 
        ? "Bravo ! Il existe un chemin valide du Petit Chaperon Rouge à la maison."
        : "Pas de chemin valide trouvé. Essayez encore !"
    );
  };

  const handleResetGrid = () => {
    if (!level) return;
    setGrid([...level.grid.map(row => [...row])]);
    setPathResult(null);
    setValidPath([]);
    
    // Réinitialiser les pièces utilisées
    const initialUsedPieces: string[] = [];
    level.grid.forEach(row => {
      row.forEach(cell => {
        if (cell && cell.startsWith('puzzle_')) {
          initialUsedPieces.push(cell);
        }
      });
    });
    setUsedPieces(initialUsedPieces);
  };

  const handlePiecePlaced = (pieceType: string) => {
    if (pieceType.startsWith('puzzle_')) {
      setUsedPieces(prev => [...prev, pieceType]);
    }
  };
  
  const handlePieceRemoved = (pieceType: string) => {
    if (pieceType.startsWith('puzzle_')) {
      setUsedPieces(prev => prev.filter(p => p !== pieceType));
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
      <CustomDragLayer adjustments={defaultAdjustments} />
      <div className="min-h-screen bg-blue-50 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-800">{level.name}</h1>
            <Link 
              href="/custom-levels" 
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Retour à la liste
            </Link>
          </div>

          <p className="text-gray-600 mb-4">{level.description}</p>
          
          {pathResult && (
            <div className={`p-6 mb-6 rounded-xl shadow-lg transform transition-all duration-500 ${
              pathResult.includes('Bravo') 
                ? 'bg-green-100 text-green-800 border border-green-300 animate-bounce' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              <div className="flex items-center">
                <span className="text-2xl mr-3">
                  {pathResult.includes('Bravo') ? '🎉' : '😕'}
                </span>
                <span className="font-medium text-lg">{pathResult}</span>
              </div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <GameBoard
                grid={grid}
                setGrid={setGrid}
                gridSize={grid[0]?.length || 5}
                onCheckPath={handleCheckPath}
                validPath={validPath}
                lockedCells={level.lockedCells || []}
                adjustments={defaultAdjustments}
                boardImage="/Board-lvl1.png"
                onPiecePlaced={handlePiecePlaced}
                onPieceRemoved={handlePieceRemoved}
                handleResetGrid={handleResetGrid}
              />
            </div>
            
            <div className="md:w-1/3">
              <ItemsGallery 
                availablePieces={level.availablePieces || []} 
                usedPieces={usedPieces}
                lockedPieces={lockedPieces}
              />
              
              <div className="mt-6 bg-white p-6 rounded-xl shadow-xl border border-blue-200 glass-card">
                <h2 className="text-xl font-bold mb-4 text-blue-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Instructions
                </h2>
                <div className="space-y-3">
                  <p className="mb-2 text-blue-700 flex items-start">
                    <span className="inline-block bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 font-bold">1</span>
                    Ajoutez des routes pour créer un chemin.
                  </p>
                  <p className="mb-2 text-blue-700 flex items-start">
                    <span className="inline-block bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 font-bold">2</span>
                    Cliquez sur "Vérifier le chemin" pour valider.
                  </p>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-blue-700 font-medium text-sm">Pour retirer un élément, cliquez simplement dessus.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
