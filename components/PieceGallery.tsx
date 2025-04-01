import Piece from '@/components/Piece';

interface PieceGalleryProps {
  availablePieces: Record<string, number>;
  setAvailablePieces: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const PieceGallery = ({ availablePieces, setAvailablePieces }: PieceGalleryProps) => {
  return (
    <div className="bg-amber-100 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-amber-800">Available Pieces</h2>
      <div className="flex flex-wrap gap-4">
        {Object.entries(availablePieces).map(([type, count]) => (
          <div key={type} className="flex flex-col items-center">
            <Piece type={type} isDraggable={count > 0} />
            <span className="mt-1 text-sm">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieceGallery;
