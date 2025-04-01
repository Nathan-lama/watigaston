import { useDrag } from 'react-dnd';
import Image from 'next/image';

interface DraggableItemProps {
  type: string;
  name: string;
  imagePath: string;
  category: string;
}

const DraggableItem = ({ type, name, imagePath, category }: DraggableItemProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'gameItem',
    item: { type, imagePath, category },
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
      default: return 'border-amber-200 hover:border-amber-400';
    }
  };

  return (
    <div
      ref={drag}
      className={`p-3 mb-3 bg-white border-2 ${getBorderColor()} rounded-lg text-center cursor-grab select-none shadow-sm transform transition-all duration-200 ${
        isDragging ? 'opacity-20' : 'hover:shadow-md'
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
