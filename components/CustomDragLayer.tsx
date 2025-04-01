import { useDragLayer } from 'react-dnd';
import Image from 'next/image';
import { PieceAdjustments, getAdjustmentForPiece } from '@/utils/pieceAdjustments';
import { useEffect } from 'react';

interface CustomDragLayerProps {
  adjustments?: PieceAdjustments;
}

const CustomDragLayer = ({ adjustments }: CustomDragLayerProps) => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  // Ajouter du logging pour déboguer
  useEffect(() => {
    if (isDragging && item) {
      console.log("DragLayer - item en déplacement:", item);
    }
  }, [isDragging, item]);

  if (!isDragging || !currentOffset || !item) {
    return null;
  }

  // Appliquer l'échelle appropriée si disponible
  const pieceAdjustment = adjustments ? getAdjustmentForPiece(item.type, adjustments) : undefined;
  const scale = pieceAdjustment?.scale || 1;
  const cellSize = adjustments?.board.cellSize || 107; // Modifié de 80 à 107
  const baseSize = cellSize * 0.95; // Utiliser 95% comme dans Cell.tsx
  const size = Math.round(baseSize * scale);

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: currentOffset.x,
        top: currentOffset.y,
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Image 
        src={item.imagePath || '/placeholder.png'} 
        alt={item.type || 'piece'}
        width={size}
        height={size}
        priority
        style={{ 
          objectFit: 'contain',
          transform: `scale(${scale})`, // Appliquer l'échelle directement
          transformOrigin: 'center'
        }}
      />
    </div>
  );
};

export default CustomDragLayer;
