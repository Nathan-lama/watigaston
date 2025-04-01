import { useDrop, useDrag } from 'react-dnd';
import Image from 'next/image';
import { PieceAdjustments, getAdjustmentForPiece } from '@/utils/pieceAdjustments';

interface CellProps {
  content: string | null;
  onDrop: (item: any) => void;
  position: { row: number; col: number };
  onClick?: () => void;
  transparent?: boolean;
  adjustments?: PieceAdjustments;
  cellSize?: number;
  isLocked?: boolean; // Nouvelle prop pour indiquer si la cellule est verrouillée
}

const Cell = ({ 
  content, 
  onDrop, 
  position, 
  onClick, 
  transparent = false, 
  adjustments,
  cellSize = 107,
  isLocked = false
}: CellProps) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'gameItem',
    // Ne pas accepter les drops sur des cellules qui contiennent déjà une pièce ou qui sont verrouillées
    canDrop: () => content === null && !isLocked,
    drop: (item) => {
      // Ne pas permettre le drop sur les cellules verrouillées
      if (isLocked) {
        console.log('Cette cellule est verrouillée et ne peut pas être modifiée');
        return;
      }
      
      // Vérifications supplémentaires
      if (!item) {
        console.error('Dropped item is undefined');
        return;
      }
      
      if (typeof onDrop !== 'function') {
        console.error('onDrop is not a function');
        return;
      }
      
      try {
        console.log("Drop sur cellule:", position, "avec item:", item);
        onDrop(item);
      } catch (error) {
        console.error('Error in onDrop callback:', error);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [content, onDrop, isLocked]); // Ajouter isLocked aux dépendances

  // Mise à jour du useDrag pour ne pas permettre le drag des cellules verrouillées
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'gameItem',
    item: content && !isLocked ? { 
      type: content, 
      // Inclure la source pour savoir que ça vient d'une cellule existante
      isFromCell: true,
      position 
    } : null,
    // Ne permettre le drag que si il y a un contenu et que la cellule n'est pas verrouillée
    canDrag: !!content && !isLocked,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [content, position, isLocked]); // Ajouter isLocked aux dépendances

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
    } else if (content.startsWith('obstacle_')) {
      const pieceNumber = content.split('_')[1];
      return `/kit1/obstacles/obstacle${pieceNumber}.png`;
    }
    return ''; // Fallback si le format ne correspond pas
  };

  const renderContent = () => {
    if (!content) return null;

    const imagePath = getImagePath(content);
    if (!imagePath) return null;

    // Obtenir les ajustements pour cette pièce spécifique
    const pieceAdjustment = adjustments ? getAdjustmentForPiece(content, adjustments) : undefined;

    // Valeurs par défaut si aucun ajustement n'est trouvé
    const offsetX = pieceAdjustment?.offsetX || 0;
    const offsetY = pieceAdjustment?.offsetY || 0;
    const scale = pieceAdjustment?.scale || 1;

    // Calculer la taille de l'image en fonction de l'échelle et de la taille de la cellule
    const baseImageSize = cellSize * 0.95; // 95% de la taille de la cellule pour maximiser l'espace
    const imageSize = Math.round(baseImageSize * scale);

    return (
      <div
        ref={drag} // Permettre de draguer la pièce
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
          zIndex: 3,
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          opacity: isDragging ? 0 : 1, // Masquer la pièce d'origine pendant le drag
        }}
      >
        <Image 
          src={imagePath}
          alt={content}
          width={imageSize}
          height={imageSize}
          priority
          style={{ 
            objectFit: 'contain',
            width: '100%',
            height: '100%',
            transform: `scale(${scale})`,
            transformOrigin: 'center',
          }}
        />
      </div>
    );
  };

  // Style dynamique selon l'état du drop - Ajouter un style visuel pour cellules déjà occupées
  let cellStyle = '';
  
  if (transparent) {
    cellStyle = isOver && canDrop 
      ? 'bg-yellow-100 bg-opacity-30' 
      : canDrop 
        ? 'bg-blue-100 bg-opacity-20' 
        : content 
          ? isLocked 
            ? 'bg-transparent cursor-not-allowed' // Curseur différent pour cellules verrouillées
            : 'bg-transparent' 
          : 'hover:bg-white hover:bg-opacity-10';
  } else {
    cellStyle = isOver && canDrop 
      ? 'bg-yellow-50 border-yellow-400' 
      : canDrop 
        ? 'bg-blue-50 border-blue-300' 
        : content ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-300';
  }
  
  const handleClick = () => {
    // Ne pas permettre le clic sur les cellules verrouillées
    if (isLocked) {
      console.log('Cette cellule est verrouillée et ne peut pas être supprimée');
      return;
    }
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={drop}
      className={`cursor-pointer ${cellStyle} ${transparent ? '' : 'border-[0.5px]'} cell-debug ${isLocked ? 'locked-cell' : ''}`}
      onClick={handleClick}
      style={{ 
        margin: 0, 
        padding: 0,
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        border: isOver ? '1px dashed rgba(255, 215, 0, 0.5)' : (
          isLocked && content ? '1px solid rgba(255, 0, 0, 0.2)' : (
            process.env.NODE_ENV === 'development' ? '1px dashed rgba(255, 0, 0, 0.1)' : 'none'
          )
        ),
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Ajouter un indicateur visuel subtil pour les cellules verrouillées */}
      {isLocked && content && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full z-10 opacity-70"></div>
      )}
      
      {renderContent()}
      
      {isOver && canDrop && (
        <div 
          className="absolute inset-0 bg-yellow-200 opacity-20 rounded-sm" 
          style={{ zIndex: 1 }}
        />
      )}
    </div>
  );
};

export default Cell;
