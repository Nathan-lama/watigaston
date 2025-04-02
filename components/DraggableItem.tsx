import { useDrag } from 'react-dnd';
import Image from 'next/image';
import { useId } from 'react';
import { Direction, rotateDirectionsClockwise, getPieceConfig } from '@/utils/puzzleTypes';
import { useState } from 'react';
// Import a simple div for now as a temporary replacement
// import DirectionVisualizer from './DirectionVisualizer';

interface DraggableItemProps {
  type: string;
  name: string;
  imagePath: string;
  category: string;
  directions?: Direction[];
}

const DraggableItem = ({ type, name, imagePath, category, directions: initialDirections }: DraggableItemProps) => {
  // Obtenir les directions par défaut de la pièce
  const defaultDirections = getPieceConfig(type)?.directions || [];
  
  // État pour les directions actuelles (pour prérotation)
  const [directions, setDirections] = useState<Direction[]>(initialDirections || defaultDirections);
  const [rotation, setRotation] = useState(0);

  // Générer un ID unique pour chaque instance d'une pièce
  const uniqueId = useId();

  // Fonction pour faire pivoter la pièce avant de la placer
  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDirections = rotateDirectionsClockwise(directions);
    setDirections(newDirections);
    setRotation((prev) => (prev + 90) % 360);
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'gameItem',
    // Inclure un ID unique pour chaque instance de pièce, ainsi que les directions
    item: { 
      type, 
      imagePath, 
      category, 
      uniqueId,
      directions, // Utiliser les directions rotatives
      // Marquer comme venant de la galerie = à cloner, pas à déplacer
      fromGallery: true
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [type, imagePath, category, directions]); // Ajouter directions aux dépendances

  // Couleurs différentes selon la catégorie
  const getBorderColor = () => {
    switch (category) {
      case 'debut': return 'border-green-400 hover:border-green-600';
      case 'fin': return 'border-red-400 hover:border-red-600';
      case 'puzzle': return 'border-amber-200 hover:border-amber-400';
      case 'obstacle': return 'border-purple-300 hover:border-purple-500'; // Nouvelle couleur pour les obstacles
      default: return 'border-amber-200 hover:border-amber-400';
    }
  };

  // Simplify the renderDirections function to avoid using the problematic component temporarily
  const renderDirections = () => {
    // Only show directions for puzzle pieces
    if (!directions || !directions.length || !type.startsWith('puzzle_')) {
      return null;
    }
    
    // Create a simplified direction visualizer to bypass the import issue
    return (
      <div className="mt-1 flex justify-center">
        <div className="text-xs text-gray-500">
          Directions: {directions.join(', ')}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`p-3 mb-3 bg-white border-2 ${getBorderColor()} rounded-lg text-center select-none shadow-sm transform transition-all duration-200 ${
        isDragging ? 'opacity-0' : 'hover:shadow-md'
      }`}
      style={{ touchAction: 'none' }}
    >
      <div className="mb-1 flex justify-center relative">
        <div ref={drag} className="cursor-grab">
          <Image 
            src={imagePath} 
            alt={name}
            width={80}
            height={80}
            className="object-contain transition-transform duration-300"
            draggable={false}
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        </div>
        
        {/* Bouton de rotation pour les pièces qui peuvent être pivotées */}
        {getPieceConfig(type)?.rotatable && (
          <button 
            className="absolute -top-2 -right-2 bg-gray-200 hover:bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
            onClick={handleRotate}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
      <div className="text-xs font-medium text-amber-800">{name}</div>
      {renderDirections()}
    </div>
  );
};

export default DraggableItem;
