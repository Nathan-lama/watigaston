import { useDrag } from 'react-dnd';

interface DraggableItemProps {
  type: string;
  name: string;
  emoji: string;
}

const DraggableItem = ({ type, name, emoji }: DraggableItemProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'gameItem',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-3 mb-3 bg-white border-2 border-amber-200 rounded-lg text-center cursor-grab select-none shadow-sm ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 hover:border-amber-400 hover:shadow-md'
      } transform transition-all duration-200`}
      style={{ touchAction: 'none' }}
    >
      <div className="text-4xl mb-1">{emoji}</div>
      <div className="text-xs font-medium text-amber-800">{name}</div>
    </div>
  );
};

export default DraggableItem;
