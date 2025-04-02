import DraggableItem from './DraggableItem';
import { puzzlePieces } from '@/utils/puzzleTypes';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl shadow-xl border border-blue-200 overflow-hidden"
    >
      <div>
        <h2 className="text-xl font-bold mb-4 text-blue-800 border-b border-blue-200 pb-2">
          Pièces disponibles
        </h2>
        {filteredPieces.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredPieces.map((piece, index) => (
              <motion.div
                key={piece.type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <DraggableItem
                  type={piece.type}
                  name={piece.name}
                  imagePath={piece.imagePath}
                  category="puzzle"
                  directions={piece.directions}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-blue-700 text-sm italic bg-blue-50 p-3 rounded-lg">
            Aucune pièce disponible pour ce niveau
          </p>
        )}
        
        {/* N'afficher les pièces utilisées que si elles ne sont pas verrouillées */}
        {usedButNotLocked.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 border-t border-blue-200 pt-4"
          >
            <h3 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pièces déjà utilisées
            </h3>
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
          </motion.div>
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
    </motion.div>
  );
};

export default ItemsGallery;
