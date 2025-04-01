import { useDragLayer } from 'react-dnd';
import Image from 'next/image';

const CustomDragLayer = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

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
        opacity: 0.9,
      }}
    >
      <Image 
        src={item.imagePath} 
        alt={item.type}
        width={90}
        height={90}
        className="object-contain"
      />
    </div>
  );
};

export default CustomDragLayer;
