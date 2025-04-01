import { useDrop } from 'react-dnd';

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

  const renderContent = () => {
    switch (content) {
      case 'character':
        return <span className="text-5xl select-none">🧍</span>;
      case 'house':
        return <span className="text-5xl select-none">🏠</span>;
      case 'rock':
        return <span className="text-5xl select-none">🪨</span>;
      case 'tree':
        return <span className="text-5xl select-none">🌳</span>;
      case 'road':
        return <span className="text-5xl select-none">🛣️</span>;
      default:
        return null;
    }
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
