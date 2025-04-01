import { useDragLayer } from 'react-dnd';

// Composant qui affiche un aperçu personnalisé pendant le drag
const CustomDragLayer = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  const getEmoji = (type: string) => {
    switch (type) {
      case 'character': return '🧍';
      case 'house': return '🏠';
      case 'rock': return '🪨';
      case 'tree': return '🌳';
      case 'road': return '🛣️';
      default: return '❓';
    }
  };

  if (!isDragging || !currentOffset) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: currentOffset.x,
        top: currentOffset.y,
        transform: 'translate(-50%, -50%)',
        opacity: 0.8,
      }}
    >
      <div className="text-5xl">{getEmoji(item.type)}</div>
    </div>
  );
};

export default CustomDragLayer;
