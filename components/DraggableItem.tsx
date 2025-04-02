import { useDrag } from 'react-dnd';
import Image from 'next/image';
import { useId } from 'react';
import { Direction, rotateDirectionsClockwise, getPieceConfig } from '@/utils/puzzleTypes';
import { useState } from 'react';

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

  // Mettre à jour l'objet item avec les directions actuelles
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'gameItem',
    item: { 
      type, 
      imagePath, 
      category, 
      uniqueId,
      directions, // Utiliser les directions après rotation
      rotation, // Ajouter la rotation actuelle
      fromGallery: true
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [type, imagePath, category, directions, rotation]); // Ajouter rotation aux dépendances

  // Couleurs différentes selon la catégorie avec des dégradés
  const getBorderColor = () => {
    switch (category) {
      case 'debut': return 'from-green-400 to-green-500 shadow-green-200';
      case 'fin': return 'from-red-400 to-red-500 shadow-red-200';
      case 'puzzle': return 'from-blue-300 to-blue-400 shadow-blue-200'; // Changé de amber à blue
      case 'obstacle': return 'from-purple-400 to-purple-500 shadow-purple-200'; 
      default: return 'from-gray-300 to-gray-400 shadow-gray-200'; // Changé par défaut aussi
    }
  };

  // Supprimer complètement la fonction renderDirections
  const renderDirections = () => {
    // Fonction vidée - ne plus afficher les directions
    return null;
  };

  return (
    <div
      className={`relative p-3 mb-3 rounded-xl text-center select-none transition-all duration-300 ${
        isDragging ? 'opacity-0' : 'hover:shadow-lg hover:-translate-y-1'
      } bg-gradient-to-br ${getBorderColor()}`}
      style={{ 
        touchAction: 'none',
        backgroundColor: 'white',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'transparent',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
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
        
        {/* Bouton de rotation moderne */}
        {getPieceConfig(type)?.rotatable && (
          <button 
            className="absolute -top-2 -right-2 bg-white hover:bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center shadow-md transition-all duration-200"
            onClick={handleRotate}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
      <div className="text-xs font-medium text-gray-700">{name}</div>
    </div>
  );
};

export default DraggableItem;
