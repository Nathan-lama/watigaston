import DraggableItem from './DraggableItem';

const GAME_ITEMS = [
  { type: 'character', name: 'Chaperon Rouge', emoji: '🧍' },
  { type: 'house', name: 'Maison', emoji: '🏠' },
  { type: 'rock', name: 'Rocher', emoji: '🪨' },
  { type: 'tree', name: 'Arbre', emoji: '🌳' },
  { type: 'road', name: 'Route', emoji: '🛣️' },
];

const ItemsGallery = () => {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-lg shadow-lg border border-amber-200">
      <h2 className="text-xl font-bold mb-4 text-amber-800">Éléments de jeu</h2>
      <div className="grid grid-cols-2 gap-3">
        {GAME_ITEMS.map((item) => (
          <DraggableItem
            key={item.type}
            type={item.type}
            name={item.name}
            emoji={item.emoji}
          />
        ))}
      </div>
    </div>
  );
};

export default ItemsGallery;
