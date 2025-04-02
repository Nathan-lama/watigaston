import DraggableItem from './DraggableItem';
import { puzzlePieces } from '@/utils/puzzleTypes';

interface ItemsGalleryProps {
  availablePieces?: string[]; // Make it optional
  showStartEnd?: boolean;
}

const ItemsGallery = ({ availablePieces = [], showStartEnd = false }: ItemsGalleryProps) => {
  // Provide a default empty array if availablePieces is undefined
  const piecesToShow = availablePieces || [];
  
  // Now safely use the piecesToShow array
  const filteredPieces = Object.values(puzzlePieces).filter(piece => 
    piecesToShow.includes(piece.type)
  );

  // Filtrer les pièces de début et de fin si nécessaire
  const startEndPieces = showStartEnd 
    ? Object.values(puzzlePieces).filter(piece => 
        piece.type.startsWith('debut_') || piece.type.startsWith('fin_')
      )
    : [];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-lg shadow-lg border border-amber-200">
      {/* Section des pièces de chemin */}
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
