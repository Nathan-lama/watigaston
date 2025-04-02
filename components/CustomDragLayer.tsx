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
        justifyContent: 'center',
        filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25))', // Ajout d'une ombre plus prononcée pour l'élément en déplacement
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fond légèrement transparent
          borderRadius: '12px',
          padding: '5px',
          backdropFilter: 'blur(4px)', // Effet glassmorphism
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
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
            transform: `scale(${scale}) rotate(${item.rotation || 0}deg)`,
            transformOrigin: 'center',
            filter: 'brightness(1.05)', // Rendre l'image légèrement plus brillante pendant le drag
          }}
        />
      </div>
    </div>
  );
};

export default CustomDragLayer;
