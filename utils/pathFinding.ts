// BFS algorithm to find path from character to house
export const findPath = (grid: (string | null)[][]): boolean => {
  if (!grid || grid.length === 0) return false;
  
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Find character and house positions
  let characterPos: [number, number] | null = null;
  let housePos: [number, number] | null = null;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 'character') {
        characterPos = [i, j];
      } else if (grid[i][j] === 'house') {
        housePos = [i, j];
      }
    }
  }
  
  if (!characterPos || !housePos) {
    return false; // Either character or house is missing
  }
  
  // BFS to find path
  const queue: [number, number][] = [characterPos];
  const visited = new Set<string>();
  visited.add(`${characterPos[0]},${characterPos[1]}`);
  
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, down, left, right
  
  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    
    // If we've found the house
    if (row === housePos[0] && col === housePos[1]) {
      return true; // Path found
    }
    
    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;
      
      // Check if new position is within grid bounds
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        const key = `${newRow},${newCol}`;
        
        // Check if not visited and is either road or house
        if (!visited.has(key) && 
            (grid[newRow][newCol] === 'road' || grid[newRow][newCol] === 'house')) {
          visited.add(key);
          queue.push([newRow, newCol]);
        }
      }
    }
  }
  
  return false; // No path found
};
