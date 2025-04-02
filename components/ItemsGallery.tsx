import DraggableItem from './DraggableItem';
import { puzzlePieces } from '@/utils/puzzleTypes';

const ItemsGallery = () => {
  // Filtre les pièces de type puzzle uniquement
  const puzzleOnlyPieces = Object.values(puzzlePieces).filter(piece => 
    piece.type.startsWith('puzzle_')
  );

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-lg shadow-lg border border-amber-200">
      {/* Section des pièces de chemin uniquement */}
      <div>
        <h2 className="text-xl font-bold mb-3 text-amber-800">Pièces de chemin</h2>
        <div className="grid grid-cols-2 gap-3">
          {puzzleOnlyPieces.map((piece) => (
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
      </div>
    </div>
  );
};

export default ItemsGallery;
