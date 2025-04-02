import DraggableItem from './DraggableItem';
import { puzzlePieces } from '@/utils/puzzleTypes';

interface ItemsGalleryProps {
  availablePieces?: string[];
  showStartEnd?: boolean;
  usedPieces?: string[];  // Pièces utilisées
  lockedPieces?: string[]; // Nouvelle prop pour les pièces verrouillées
}

const ItemsGallery = ({ 
  availablePieces = [], 
  showStartEnd = false,
  usedPieces = [],
  lockedPieces = [] // Valeur par défaut: tableau vide
}: ItemsGalleryProps) => {
  // Provide a default empty array if availablePieces is undefined
  const piecesToShow = availablePieces || [];
  
  // Filtrer les pièces disponibles pour ce niveau en excluant celles déjà utilisées
  const filteredPieces = Object.values(puzzlePieces).filter(piece => 
    piecesToShow.includes(piece.type) && !usedPieces.includes(piece.type)
  );

  // Filtrer les pièces de début et de fin si nécessaire
  const startEndPieces = showStartEnd 
    ? Object.values(puzzlePieces).filter(piece => 
        piece.type.startsWith('debut_') || piece.type.startsWith('fin_')
      )
    : [];

  // Modifier pour afficher uniquement les pièces utilisées qui ne sont pas verrouillées
  const usedButNotLocked = usedPieces.filter(pieceType => 
    !lockedPieces.includes(pieceType)
  );

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-lg shadow-lg border border-amber-200">
      <div>
        <h2 className="text-xl font-bold mb-3 text-amber-800">Pièces disponibles</h2>
        {filteredPieces.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredPieces.map((piece) => (
              <DraggableItem
                key={piece.type}
                type={piece.type}
                name={piece.name}
                imagePath={piece.imagePath}
                category="puzzle"
                directions={piece.directions}
              />
            ))}
          </div>
        ) : (
          <p className="text-amber-700 text-sm italic">Aucune pièce disponible pour ce niveau</p>
        )}
        
        {/* N'afficher les pièces utilisées que si elles ne sont pas verrouillées */}
        {usedButNotLocked.length > 0 && (
          <div className="mt-4 border-t border-amber-200 pt-3">
            <h3 className="text-sm font-medium text-amber-700 mb-2">Pièces déjà utilisées</h3>
            <div className="grid grid-cols-2 gap-3 opacity-50">
              {usedButNotLocked.map(pieceType => {
                const piece = puzzlePieces[pieceType];
                if (!piece) return null;
                
                return (
                  <div 
                    key={piece.type} 
                    className="p-3 bg-white border-2 border-gray-300 rounded-lg text-center cursor-not-allowed"
                  >
                    <div className="mb-1 flex justify-center">
                      <img 
                        src={piece.imagePath}
                        alt={piece.name}
                        style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                      />
                    </div>
                    <div className="text-xs font-medium text-gray-500">{piece.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Section des pièces de début/fin si activée */}
      {showStartEnd && startEndPieces.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-3 text-amber-800">Début et Fin</h2>
          <div className="grid grid-cols-2 gap-3">
            {startEndPieces.map((piece) => (
              <DraggableItem
                key={piece.type}
                type={piece.type}
                name={piece.name}
                imagePath={piece.imagePath}
                category={piece.type.startsWith('debut_') ? 'debut' : 'fin'}
                directions={piece.directions}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsGallery;
