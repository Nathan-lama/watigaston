import { useDrop } from 'react-dnd';
import Image from 'next/image';

interface CellProps {
  content: string | null;
  onDrop: (item: any) => void;
  position: { row: number; col: number };
  onClick?: () => void;
  transparent?: boolean;
}

const Cell = ({ content, onDrop, position, onClick, transparent = false }: CellProps) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'gameItem',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  // Fonction pour obtenir le chemin de l'image basé sur le type de contenu
  const getImagePath = (content: string): string => {
    if (content.startsWith('debut_')) {
      const pieceNumber = content.split('_')[1];
      return `/kit1/debut/piece${pieceNumber}.png`;
    } else if (content.startsWith('fin_')) {
      const pieceNumber = content.split('_')[1];
      return `/kit1/fin/piece${pieceNumber}.png`;
    } else if (content.startsWith('puzzle_')) {
      const pieceNumber = content.split('_')[1];
      return `/kit1/puzzle/piece${pieceNumber}.png`;
    }
    return ''; // Fallback si le format ne correspond pas
  };

  const renderContent = () => {
    if (!content) return null;
    
    const imagePath = getImagePath(content);
    if (!imagePath) return null;
    
    return (
      <Image 
        src={imagePath}
        alt={content}
        width={70}
        height={70}
        className="object-contain"
      />
    );
  };

  // Style dynamique selon l'état du drop et si la cellule doit être transparente
  let cellStyle = '';
  
  if (transparent) {
    cellStyle = isOver && canDrop 
      ? 'bg-yellow-100 bg-opacity-30' 
      : canDrop 
        ? 'bg-blue-100 bg-opacity-20' 
        : content ? 'bg-transparent' : 'hover:bg-white hover:bg-opacity-10';
  } else {
    cellStyle = isOver && canDrop 
      ? 'bg-yellow-50 border-yellow-400' 
      : canDrop 
        ? 'bg-blue-50 border-blue-300' 
        : 'bg-amber-50 border-amber-300';
  }

  return (
    <div
      ref={drop}
      className={`flex items-center justify-center cursor-pointer ${cellStyle} ${transparent ? '' : 'border-[0.5px]'}`}
      onClick={onClick}
      style={{ 
        margin: 0, 
        padding: 0,
        height: '100%',
        width: '100%',
        // Ajouter une bordure subtile pendant le survol pour voir les cellules
        border: isOver ? '1px dashed rgba(255, 215, 0, 0.5)' : 'none'
      }}
    >
      {renderContent()}
    </div>
  );
};

export default Cell;
