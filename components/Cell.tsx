import { useDrop, useDrag } from 'react-dnd';
import Image from 'next/image';
import { PieceAdjustments, getAdjustmentForPiece } from '@/utils/pieceAdjustments';
import { Direction, rotateDirectionsClockwise, getPieceConfig } from '@/utils/puzzleTypes';
import DirectionVisualizer from './DirectionVisualizer';

interface CellProps {
  content: string | null;
  onDrop: (item: any) => void;
  position: { row: number; col: number };
  onClick?: () => void;
  transparent?: boolean;
  adjustments?: PieceAdjustments;
  cellSize?: number;
  isLocked?: boolean; // Nouvelle prop pour indiquer si la cellule est verrouillée
  directions?: Direction[]; // Nouvelle prop pour les directions
  onRotate?: (position: { row: number; col: number }) => void;
  showDirections?: boolean; // Ajouter cette prop
}

const Cell = ({ 
  content, 
  onDrop, 
  position, 
  onClick, 
  transparent = false, 
  adjustments,
  cellSize = 107,
  isLocked = false,
  directions,
  onRotate,
  showDirections = false // Ajouter cette prop
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
      position,
      directions
    } : null,
    // Ne permettre le drag que si il y a un contenu et que la cellule n'est pas verrouillée
    canDrag: !!content && !isLocked,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [content, position, isLocked, directions]); // Ajouter isLocked aux dépendances

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

  // Double-clic pour faire pivoter la pièce
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation pour éviter le clic simple
    
    if (isLocked || !content || !onRotate) return;
    
    const pieceConfig = getPieceConfig(content);
    if (!pieceConfig?.rotatable) return;
    
    onRotate(position);
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

    // Calculer la rotation en degrés pour l'affichage
    let rotationDegrees = 0;
    if (directions && content.startsWith('puzzle_')) {
      // On détermine la rotation en fonction des directions actuelles
      const defaultPiece = getPieceConfig(content);
      if (defaultPiece) {
        // On compare les directions actuelles avec les directions par défaut
        // pour déterminer la rotation
        
        // Exemple pour une pièce horizontale (E-W) qui devient verticale (N-S)
        if (defaultPiece.directions.includes('E') && defaultPiece.directions.includes('W')) {
          if (directions.includes('N') && directions.includes('S')) {
            rotationDegrees = 90;
          }
        }
        
        // Exemple pour une pièce en L (N-E) qui devient (E-S), (S-W), ou (W-N)
        else if (defaultPiece.directions.includes('N') && defaultPiece.directions.includes('E')) {
          if (directions.includes('E') && directions.includes('S')) rotationDegrees = 90;
          else if (directions.includes('S') && directions.includes('W')) rotationDegrees = 180; 
          else if (directions.includes('W') && directions.includes('N')) rotationDegrees = 270;
        }
        
        // Faire de même pour les autres types de pièces...
      }
    }

    return (
      <div
        ref={drag} // Permettre de draguer la pièce
        onDoubleClick={handleDoubleClick}
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
            transform: `scale(${scale}) rotate(${rotationDegrees}deg)`,
            transformOrigin: 'center',
            transition: 'transform 0.3s ease',
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
      
      {/* Visualiseur de directions - ajouté pour déboguer */}
      {showDirections && content && directions && (
        <div className="absolute top-0 right-0 z-20">
          <DirectionVisualizer directions={directions} size={30} />
        </div>
      )}
      
      {isOver && canDrop && (
        <div 
          className="absolute inset-0 bg-yellow-200 opacity-20 rounded-sm" 
          style={{ zIndex: 1 }}
        />
      )}

      {content && !isLocked && getPieceConfig(content)?.rotatable && (
        <div 
          className="absolute top-1 left-1 w-6 h-6 bg-gray-100 bg-opacity-70 rounded-full flex items-center justify-center z-10 hover:bg-opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            if (onRotate) onRotate(position);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Cell;
