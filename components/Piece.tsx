import { useDrag } from 'react-dnd';

interface PieceProps {
  type: string;
  isDraggable: boolean;
}

const Piece = ({ type, isDraggable }: PieceProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'piece',
    item: { type },
    canDrag: isDraggable,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const renderPiece = () => {
    switch (type) {
      case 'character':
        return <span className="text-2xl">🧍</span>;
      case 'house':
        return <span className="text-2xl">🏠</span>;
      case 'rock':
        return <span className="text-2xl">🪨</span>;
      case 'tree':
        return <span className="text-2xl">🌳</span>;
      case 'road':
        return <span className="text-2xl">🛣️</span>;
      default:
        return null;
    }
  };

  return (
    <div 
      ref={isDraggable ? drag : null}
      className={`cursor-pointer ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {renderPiece()}
    </div>
  );
};

export default Piece;
