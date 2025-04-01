import DraggableItem from './DraggableItem';

// Configuration des pièces par catégorie
const PUZZLE_PIECES = [
  // Pièces de début
  { type: 'debut_1', name: 'Départ 1', imagePath: '/kit1/debut/piece1.png', category: 'debut' },
  // Ajoutez d'autres pièces de début si nécessaire
  
  // Pièces de fin
  { type: 'fin_1', name: 'Arrivée 1', imagePath: '/kit1/fin/piece1.png', category: 'fin' },
  // Ajoutez d'autres pièces de fin si nécessaire
  
  // Pièces de puzzle (chemin)
  { type: 'puzzle_1', name: 'Chemin 1', imagePath: '/kit1/puzzle/piece1.png', category: 'puzzle' },
  { type: 'puzzle_2', name: 'Chemin 2', imagePath: '/kit1/puzzle/piece2.png', category: 'puzzle' },
  { type: 'puzzle_3', name: 'Chemin 3', imagePath: '/kit1/puzzle/piece3.png', category: 'puzzle' },
  { type: 'puzzle_4', name: 'Chemin 4', imagePath: '/kit1/puzzle/piece4.png', category: 'puzzle' },
  // Ajoutez d'autres pièces de puzzle si nécessaire
];

const ItemsGallery = () => {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-lg shadow-lg border border-amber-200">
      {/* Section des pièces de départ */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-amber-800">Points de départ</h2>
        <div className="grid grid-cols-2 gap-3">
          {PUZZLE_PIECES.filter(p => p.category === 'debut').map((piece) => (
            <DraggableItem
              key={piece.type}
              type={piece.type}
              name={piece.name}
              imagePath={piece.imagePath}
              category={piece.category}
            />
          ))}
        </div>
      </div>
      
      {/* Section des pièces d'arrivée */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-amber-800">Points d'arrivée</h2>
        <div className="grid grid-cols-2 gap-3">
          {PUZZLE_PIECES.filter(p => p.category === 'fin').map((piece) => (
            <DraggableItem
              key={piece.type}
              type={piece.type}
              name={piece.name}
              imagePath={piece.imagePath}
              category={piece.category}
            />
          ))}
        </div>
      </div>
      
      {/* Section des pièces de chemin */}
      <div>
        <h2 className="text-xl font-bold mb-3 text-amber-800">Pièces de chemin</h2>
        <div className="grid grid-cols-2 gap-3">
          {PUZZLE_PIECES.filter(p => p.category === 'puzzle').map((piece) => (
            <DraggableItem
              key={piece.type}
              type={piece.type}
              name={piece.name}
              imagePath={piece.imagePath}
              category={piece.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemsGallery;
