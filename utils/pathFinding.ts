// BFS algorithm to find path from character to house
export interface PathPosition {
  row: number;
  col: number;
}

export const findPath = (grid: (string | null)[][]): PathPosition[] => {
  if (!grid || grid.length === 0) return [];
  
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Trouver les positions de départ et d'arrivée
  let startPos: [number, number] | null = null;
  let endPos: [number, number] | null = null;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j]?.startsWith('debut_')) {
        startPos = [i, j];
      } else if (grid[i][j]?.startsWith('fin_')) {
        endPos = [i, j];
      }
    }
  }
  
  if (!startPos || !endPos) {
    return []; // Départ ou arrivée manquante
  }
  
  // BFS pour trouver un chemin
  const queue: [number, number][] = [startPos];
  const visited = new Set<string>();
  visited.add(`${startPos[0]},${startPos[1]}`);
  
  // Pour reconstruire le chemin
  const parent = new Map<string, [number, number]>();
  
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Haut, bas, gauche, droite
  
  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    
    // Si on a trouvé l'arrivée
    if (row === endPos[0] && col === endPos[1]) {
      // Reconstruire le chemin
      return reconstructPath(parent, startPos, endPos);
    }
    
    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;
      
      // Vérifier si la nouvelle position est dans les limites
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        const key = `${newRow},${newCol}`;
        const cell = grid[newRow][newCol];
        
        // Considérer les pièces de puzzle ou d'arrivée comme faisant partie du chemin
        // Ignorer les obstacles (ils bloquent le chemin)
        if (!visited.has(key) && 
            cell !== null && 
            !cell.startsWith('obstacle_') && 
            (cell.startsWith('puzzle_') || cell.startsWith('fin_'))) {
          visited.add(key);
          queue.push([newRow, newCol]);
          parent.set(key, [row, col]);
        }
      }
    }
  }
  
  return []; // Aucun chemin trouvé
};

// Fonction pour reconstruire le chemin à partir des parents
function reconstructPath(
  parent: Map<string, [number, number]>, 
  start: [number, number], 
  end: [number, number]
): PathPosition[] {
  const path: PathPosition[] = [];
  let current = end;
  
  // Ajouter la fin au chemin
  path.unshift({ row: current[0], col: current[1] });
  
  // Reconstruire le chemin en remontant les parents
  while (current[0] !== start[0] || current[1] !== start[1]) {
    const key = `${current[0]},${current[1]}`;
    current = parent.get(key)!;
    path.unshift({ row: current[0], col: current[1] });
  }
  
  return path;
}
