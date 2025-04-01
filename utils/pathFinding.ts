// BFS algorithm to find path from character to house
export const findPath = (grid: (string | null)[][]): boolean => {
  if (!grid || grid.length === 0) return false;
  
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Trouver les positions de départ et d'arrivée avec les nouveaux types
  let startPos: [number, number] | null = null;
  let endPos: [number, number] | null = null;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Recherche des pièces par leur préfixe
      if (grid[i][j]?.startsWith('debut_')) {
        startPos = [i, j];
      } else if (grid[i][j]?.startsWith('fin_')) {
        endPos = [i, j];
      }
    }
  }
  
  if (!startPos || !endPos) {
    return false; // Départ ou arrivée manquante
  }
  
  // BFS pour trouver un chemin
  const queue: [number, number][] = [startPos];
  const visited = new Set<string>();
  visited.add(`${startPos[0]},${startPos[1]}`);
  
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Haut, bas, gauche, droite
  
  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    
    // Si on a trouvé l'arrivée
    if (row === endPos[0] && col === endPos[1]) {
      return true; // Chemin trouvé
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
        }
      }
    }
  }
  
  return false; // Aucun chemin trouvé
};
