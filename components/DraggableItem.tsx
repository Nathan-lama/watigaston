import { useDrag } from 'react-dnd';
import Image from 'next/image';
import { useId } from 'react';

interface DraggableItemProps {
  type: string;
  name: string;
  imagePath: string;
  category: string;
}

const DraggableItem = ({ type, name, imagePath, category }: DraggableItemProps) => {
  // Générer un ID unique pour chaque instance d'une pièce
  const uniqueId = useId();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'gameItem',
    // Inclure un ID unique pour chaque instance de pièce
    item: { 
      type, 
      imagePath, 
      category, 
      uniqueId,
      // Marquer comme venant de la galerie = à cloner, pas à déplacer
      fromGallery: true
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

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

  return (
    <div
      ref={drag}
      className={`p-3 mb-3 bg-white border-2 ${getBorderColor()} rounded-lg text-center cursor-grab select-none shadow-sm transform transition-all duration-200 ${
        isDragging ? 'opacity-0' : 'hover:shadow-md' // Rendre invisible pendant le drag
      }`}
      style={{ touchAction: 'none' }}
    >
      <div className="mb-1 flex justify-center">
        <Image 
          src={imagePath} 
          alt={name}
          width={80}
          height={80}
          className="object-contain cursor-grab"
          draggable={false}
        />
      </div>
      <div className="text-xs font-medium text-amber-800">{name}</div>
    </div>
  );
};

export default DraggableItem;
