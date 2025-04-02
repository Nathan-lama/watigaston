import { getPieceConfig, canConnect, Direction } from './puzzleTypes';

// Fonction globale pour tester si deux pièces peuvent se connecter
export function testConnection(piece1Type: string, piece2Type: string, direction: Direction): boolean {
  const piece1 = getPieceConfig(piece1Type);
  const piece2 = getPieceConfig(piece2Type);
  
  console.log(`Test de connection entre ${piece1Type} et ${piece2Type} dans la direction ${direction}`);
  console.log(`Pièce 1 (${piece1Type}): directions = ${piece1?.directions.join(', ')}`);
  console.log(`Pièce 2 (${piece2Type}): directions = ${piece2?.directions.join(', ')}`);
  
  const result = canConnect(piece1, piece2, direction);
  console.log(`Résultat: ${result ? '✅ CONNECTÉ' : '❌ NON CONNECTÉ'}`);
  
  return result;
}

// Exposer la fonction globalement pour l'utiliser dans la console
if (typeof window !== 'undefined') {
  (window as any).testConnection = testConnection;
}

// Fonction pour simuler la recherche de chemin sur une grille simplifiée
export function debugPath(startPos: [number, number], endPos: [number, number], grid: string[][]) {
  console.log("== SIMULATION DE RECHERCHE DE CHEMIN ==");
  
  console.log("Configuration de la grille:");
  grid.forEach((row, i) => {
    console.log(`Ligne ${i}: ${row.join(' | ')}`);
  });
  
  console.log(`Départ: [${startPos[0]},${startPos[1]}] = ${grid[startPos[0]][startPos[1]]}`);
  console.log(`Arrivée: [${endPos[0]},${endPos[1]}] = ${grid[endPos[0]][endPos[1]]}`);
  
  // Vérifier chaque connexion directe
  const directions: [string, number, number][] = [
    ['N', -1, 0],
    ['S', 1, 0],
    ['E', 0, 1],
    ['W', 0, -1]
  ];
  
  console.log("\nTest des connexions:");
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (!grid[row][col]) continue;
      
      const piece1 = getPieceConfig(grid[row][col]);
      if (!piece1) continue;
      
      console.log(`\nPièce en [${row},${col}]: ${grid[row][col]} - Directions: ${piece1.directions.join(',')}`);
      
      for (const [dir, drow, dcol] of directions) {
        const newRow = row + drow;
        const newCol = col + dcol;
        
        if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) continue;
        if (!grid[newRow][newCol]) continue;
        
        const piece2 = getPieceConfig(grid[newRow][newCol]);
        if (!piece2) continue;
        
        const canConnectResult = canConnect(piece1, piece2, dir as Direction);
        console.log(`  → [${newRow},${newCol}] ${grid[newRow][newCol]} via ${dir}: ${canConnectResult ? '✓' : '✗'}`);
      }
    }
  }
  
  return "Simulation terminée - Vérifiez la console";
}

// Exposer la fonction globalement
if (typeof window !== 'undefined') {
  (window as any).debugPath = debugPath;
}

// Version améliorée de verifySimplePath pour tester un chemin spécifique
export function verifySimplePath(
  grid: (string | null)[][], 
  cellDirections?: Record<string, Direction[]>,
  manualPath?: {row: number, col: number}[]
) {
  console.log("=== VÉRIFICATION MANUELLE DU CHEMIN ===");
  console.log("Grid:", grid);
  console.log("Directions personnalisées:", cellDirections);
  
  // Si un chemin manuel est fourni, l'utiliser
  if (manualPath && manualPath.length >= 2) {
    console.log("Analyse du chemin fourni:", manualPath);
    
    // Vérifier chaque segment du chemin
    for (let i = 0; i < manualPath.length - 1; i++) {
      const current = manualPath[i];
      const next = manualPath[i + 1];
      
      // Déterminer la direction
      let direction: Direction | null = null;
      if (next.row < current.row) direction = 'N';
      else if (next.row > current.row) direction = 'S';
      else if (next.col > current.col) direction = 'E';
      else if (next.col < current.col) direction = 'W';
      
      if (!direction) {
        console.error(`Impossible de déterminer la direction entre [${current.row},${current.col}] et [${next.row},${next.col}]`);
        return false;
      }
      
      // Vérifier les pièces aux deux positions
      const currentPieceType = grid[current.row]?.[current.col];
      const nextPieceType = grid[next.row]?.[next.col];
      
      if (!currentPieceType || !nextPieceType) {
        console.error(`Une des positions du chemin est vide: [${current.row},${current.col}] ou [${next.row},${next.col}]`);
        return false;
      }
      
      // Obtenir les configurations des pièces
      const currentPiece = getPieceConfig(currentPieceType);
      const nextPiece = getPieceConfig(nextPieceType);
      
      if (!currentPiece || !nextPiece) {
        console.error(`Configuration non trouvée pour l'une des pièces: ${currentPieceType} ou ${nextPieceType}`);
        return false;
      }
      
      // Obtenir les directions personnalisées si disponibles
      const currentDirs = cellDirections?.[`${current.row},${current.col}`] || currentPiece.directions;
      const nextDirs = cellDirections?.[`${next.row},${next.col}`] || nextPiece.directions;
      
      console.log(`Segment ${i+1}: [${current.row},${current.col}] ${currentPieceType} -> [${next.row},${next.col}] ${nextPieceType} (direction: ${direction})`);
      console.log(`  Pièce actuelle: directions = ${currentDirs.join(', ')}`);
      console.log(`  Pièce suivante: directions = ${nextDirs.join(', ')}`);
      
      // Vérifier si la connexion est possible
      const oppositeDir = getOppositeDirection(direction);
      const canConnectResult = currentDirs.includes(direction) && nextDirs.includes(oppositeDir);
      
      console.log(`  Connexion ${direction} -> ${oppositeDir}: ${canConnectResult ? '✅ VALIDE' : '❌ INVALIDE'}`);
      
      if (!canConnectResult) {
        if (!currentDirs.includes(direction)) {
          console.error(`  La pièce [${current.row},${current.col}] n'a pas d'ouverture vers ${direction}`);
        }
        if (!nextDirs.includes(oppositeDir)) {
          console.error(`  La pièce [${next.row},${next.col}] n'a pas d'ouverture vers ${oppositeDir}`);
        }
        return false;
      }
    }
    
    console.log("✅ CHEMIN MANUELLEMENT VÉRIFIÉ ET VALIDE!");
    return true;
  }
  
  console.log("VÉRIFICATION MANUELLE DU CHEMIN");
  
  // Localiser début et fin
  let startPos: [number, number] | null = null;
  let endPos: [number, number] | null = null;
  
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j]?.startsWith('debut_')) {
        startPos = [i, j];
      } else if (grid[i][j]?.startsWith('fin_')) {
        endPos = [i, j];
      }
    }
  }
  
  if (!startPos || !endPos) {
    console.error("Pas de début ou de fin trouvé");
    return false;
  }
  
  console.log(`Départ: [${startPos[0]},${startPos[1]}]`);
  console.log(`Arrivée: [${endPos[0]},${endPos[1]}]`);
  
  // Créer un plan du chemin à tester
  const pathToCheck: [number, number, Direction][] = [
    // Exemple: 
    // [ligne, colonne, direction à tester]
    // [startPos[0], startPos[1], 'N'], // De début vers le Nord
    // ...etc
  ];
  
  // Vérifier manuellement ce chemin
  for (const [row, col, dir] of pathToCheck) {
    const pieceType = grid[row][col];
    if (!pieceType) {
      console.error(`Case vide à [${row},${col}]`);
      return false;
    }
    
    const piece = getPieceConfig(pieceType);
    if (!piece) {
      console.error(`Config non trouvée pour ${pieceType}`);
      return false;
    }
    
    // Obtenir les directions avec rotations si définies
    const directions = cellDirections && cellDirections[`${row},${col}`] || piece.directions;
    
    if (!directions.includes(dir)) {
      console.error(`Pièce [${row},${col}] n'a pas d'ouverture en ${dir}`);
      return false;
    }
    
    console.log(`[${row},${col}] -> ${dir}: OK`);
  }
  
  return true;
}

// Ajouter une fonction utilitaire facile à utiliser dans la console
export function testPath(grid: (string | null)[][], path: number[][]) {
  const formattedPath = path.map(coords => ({ row: coords[0], col: coords[1] }));
  return verifySimplePath(grid, undefined, formattedPath);
}

// Exposer aux outils de développement
if (typeof window !== 'undefined') {
  (window as any).verifySimplePath = verifySimplePath;
  (window as any).testPath = testPath;
}

// Fonction pour déboguer spécifiquement la connexion entre debut_1 et puzzle_6
export function debugPuzzle6Issue(grid: (string | null)[][], cellDirections: Record<string, Direction[]> = {}) {
  console.log("=== DÉBOGAGE SPÉCIFIQUE DU PROBLÈME PUZZLE_6 et DEBUT_1 ===");
  
  // Localiser debut_1 et puzzle_6
  let debutPos: [number, number] | null = null;
  let puzzle6Pos: [number, number] | null = null;
  
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === 'debut_1') debutPos = [i, j];
      if (grid[i][j] === 'puzzle_6') puzzle6Pos = [i, j];
    }
  }
  
  if (!debutPos || !puzzle6Pos) {
    console.log("❌ Impossible de trouver debut_1 ou puzzle_6 dans la grille");
    return;
  }
  
  console.log(`debut_1 trouvé en [${debutPos[0]},${debutPos[1]}]`);
  console.log(`puzzle_6 trouvé en [${puzzle6Pos[0]},${puzzle6Pos[1]}]`);
  
  // Obtenir les directions
  const debutDirs = cellDirections[`${debutPos[0]},${debutPos[1]}`] || 
                   getPieceConfig('debut_1')?.directions || [];
  
  const puzzle6Dirs = cellDirections[`${puzzle6Pos[0]},${puzzle6Pos[1]}`] || 
                     getPieceConfig('puzzle_6')?.directions || [];
  
  console.log(`Directions de debut_1: ${debutDirs.join(', ')}`);
  console.log(`Directions de puzzle_6: ${puzzle6Dirs.join(', ')}`);
  
  // Vérifier toutes les connexions possibles
  const directions: Direction[] = ['N', 'S', 'E', 'W'];
  
  console.log("\nTest de toutes les connexions possibles:");
  for (const dir of directions) {
    const oppositeDir = getOppositeDirection(dir);
    console.log(`debut_1 → puzzle_6 via ${dir}:`);
    console.log(`  debut_1 a ouverture ${dir}? ${debutDirs.includes(dir) ? '✓' : '✗'}`);
    console.log(`  puzzle_6 a ouverture ${oppositeDir}? ${puzzle6Dirs.includes(oppositeDir) ? '✓' : '✗'}`);
    console.log(`  Connexion valide? ${debutDirs.includes(dir) && puzzle6Dirs.includes(oppositeDir) ? '✓' : '✗'}`);
  }
  
  console.log("\nTest de toutes les connexions possibles avec les pièces inversées:");
  for (const dir of directions) {
    const oppositeDir = getOppositeDirection(dir);
    console.log(`puzzle_6 → debut_1 via ${dir}:`);
    console.log(`  puzzle_6 a ouverture ${dir}? ${puzzle6Dirs.includes(dir) ? '✓' : '✗'}`);
    console.log(`  debut_1 a ouverture ${oppositeDir}? ${debutDirs.includes(oppositeDir) ? '✓' : '✗'}`);
    console.log(`  Connexion valide? ${puzzle6Dirs.includes(dir) && debutDirs.includes(oppositeDir) ? '✓' : '✗'}`);
  }
  
  console.log("\nRecréation de la situation exacte du problème:");
  console.log("Nous sommes dans debut_1, sortons vers le Nord pour atteindre puzzle_6");
  
  // Vérifier si debut_1 a une sortie vers le Nord
  const canExitNorth = debutDirs.includes('N');
  console.log(`  debut_1 peut sortir vers le Nord? ${canExitNorth ? '✓' : '✗'}`);
  
  if (canExitNorth) {
    // Vérifier si puzzle_6 a une entrée depuis le Sud
    const canEnterFromSouth = puzzle6Dirs.includes('S');
    console.log(`  puzzle_6 peut être entré depuis le Sud? ${canEnterFromSouth ? '✓' : '✗'}`);
    
    if (canEnterFromSouth) {
      // Vérifier les sorties possibles depuis puzzle_6 après être entré par le Sud
      const possibleExits = puzzle6Dirs.filter(dir => dir !== 'S');
      console.log(`  Sorties possibles depuis puzzle_6 après être entré par le Sud: ${possibleExits.join(', ')}`);
    }
  }

  return "Analyse complète - vérifiez les logs";
}

// Exposer aux outils de développement
if (typeof window !== 'undefined') {
  (window as any).debugPuzzle6Issue = debugPuzzle6Issue;
}
