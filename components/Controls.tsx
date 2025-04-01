interface ControlsProps {
  checkPath: () => void;
  resetGame: () => void;
}

const Controls = ({ checkPath, resetGame }: ControlsProps) => {
  return (
    <div className="bg-amber-100 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-amber-800">Controls</h2>
      <div className="flex gap-3">
        <button 
          onClick={checkPath}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Check Path
        </button>
        <button 
          onClick={resetGame}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default Controls;
