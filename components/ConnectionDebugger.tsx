import { useEffect, useState } from 'react';
import { canConnect, getPieceConfig, Direction } from '@/utils/puzzleTypes';

interface ConnectionDebuggerProps {
  grid: (string | null)[][];
  cellDirections: Record<string, Direction[]>;
}

const ConnectionDebugger = ({ grid, cellDirections }: ConnectionDebuggerProps) => {
  const [connections, setConnections] = useState<{from: string, to: string, valid: boolean}[]>([]);
  
  useEffect(() => {
    if (!grid || !grid.length) return;
    
    const newConnections: {from: string, to: string, valid: boolean}[] = [];
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    
    // Structure pour représenter les mouvements possibles
    const moves: { dir: Direction, drow: number, dcol: number }[] = [
      { dir: 'N', drow: -1, dcol: 0 },
      { dir: 'S', drow: 1, dcol: 0 },
      { dir: 'E', drow: 0, dcol: 1 },
      { dir: 'W', drow: 0, dcol: -1 },
    ];
    
    // Vérifier les connections entre toutes les cellules adjacentes
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellType = grid[row][col];
        if (!cellType) continue;
        
        const piece1 = getPieceConfig(cellType);
        if (!piece1) continue;
        
        // Utiliser les directions personnalisées si disponibles
        const directions = cellDirections[`${row},${col}`] || piece1.directions;
        
        // Vérifier les connections dans toutes les directions possibles
        for (const { dir, drow, dcol } of moves) {
          const newRow = row + drow;
          const newCol = col + dcol;
          
          // Vérifier si la cellule adjacente est dans les limites
          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            const adjCellType = grid[newRow][newCol];
            if (!adjCellType) continue;
            
            const piece2 = getPieceConfig(adjCellType);
            if (!piece2) continue;
            
            // Utiliser les directions personnalisées pour la pièce adjacente si disponibles
            const adjDirections = cellDirections[`${newRow},${newCol}`] || piece2.directions;
            
            // Créer des objets temporaires avec les directions personnalisées
            const tempPiece1 = { ...piece1, directions };
            const tempPiece2 = { ...piece2, directions: adjDirections };
            
            // Vérifier si les pièces peuvent se connecter
            const isValid = canConnect(tempPiece1, tempPiece2, dir);
            
            newConnections.push({
              from: `${cellType} at [${row},${col}]`,
              to: `${adjCellType} at [${newRow},${newCol}]`,
              valid: isValid
            });
          }
        }
      }
    }
    
    setConnections(newConnections);
  }, [grid, cellDirections]);
  
  if (connections.length === 0) {
    return <div>Aucune connection à vérifier</div>;
  }
  
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium mb-2">Débogage des connections</h3>
      <div className="max-h-60 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">De</th>
              <th className="p-2 text-left">Vers</th>
              <th className="p-2 text-center">Statut</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((conn, idx) => (
              <tr key={idx} className={conn.valid ? 'bg-green-50' : 'bg-red-50'}>
                <td className="p-2 border-t">{conn.from}</td>
                <td className="p-2 border-t">{conn.to}</td>
                <td className="p-2 border-t text-center">
                  {conn.valid ? 
                    <span className="text-green-600">✓ Valide</span> : 
                    <span className="text-red-600">✗ Invalide</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConnectionDebugger;
