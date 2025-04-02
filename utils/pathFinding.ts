import { Direction, canConnect, getPieceConfig, getAllDirections, getOppositeDirection, isStartPiece, isEndPiece } from './puzzleTypes';

export interface PathPosition {
  row: number;
  col: number;
}

// Structure pour représenter une position sur la grille avec une direction
interface DirectedPosition {
  row: number;
  col: number;
  fromDirection: Direction | null; // Direction de provenance
}

// Ajouter un paramètre pour les directions des cellules après rotation
export const findPath = (
  grid: (string | null)[][], 
  cellDirections: Record<string, Direction[]> = {}
): PathPosition[] => {
  if (!grid || grid.length === 0) return [];
  
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Trouver les positions de départ et d'arrivée
  let startPos: [number, number] | null = null;
  let endPos: [number, number] | null = null;
  let startPieceType: string | null = null;
  let endPieceType: string | null = null;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const pieceType = grid[i][j];
      if (isStartPiece(pieceType)) {
        startPos = [i, j];
        startPieceType = pieceType;
      } else if (isEndPiece(pieceType)) {
        endPos = [i, j];
        endPieceType = pieceType;
      }
    }
  }
  
  if (!startPos || !endPos) {
    console.log("Pas de position de départ ou d'arrivée trouvée");
    return [];
  }
  
  console.log("=== DÉBUT RECHERCHE DE CHEMIN ===");
  console.log("CellDirections reçues:", cellDirections);
  console.log(`Position de départ: [${startPos?.[0]},${startPos?.[1]}], type: ${startPieceType}`);
  console.log(`Position d'arrivée: [${endPos?.[0]},${endPos?.[1]}], type: ${endPieceType}`);
  
  // PROBLÈME: Nous n'explorons pas correctement depuis le départ
  // Initialiser la file d'attente avec juste une position de départ
  const queue: DirectedPosition[] = [{ 
    row: startPos[0], 
    col: startPos[1], 
    fromDirection: null
  }];
  
  const visited = new Set<string>();
  visited.add(`${startPos[0]},${startPos[1]}`);
  
  const parent = new Map<string, { row: number, col: number, fromDirection: Direction | null }>();
  
  // Structure pour représenter les mouvements possibles
  const moves: { dir: Direction, drow: number, dcol: number }[] = [
    { dir: 'N', drow: -1, dcol: 0 },  // Nord (haut)
    { dir: 'S', drow: 1, dcol: 0 },   // Sud (bas)
    { dir: 'E', drow: 0, dcol: 1 },   // Est (droite)
    { dir: 'W', drow: 0, dcol: -1 }   // Ouest (gauche)
  ];
  
  // DEBUG: Ajout des informations sur les pièces de départ et d'arrivée
  console.log(`Départ [${startPos[0]},${startPos[1]}]: ${startPieceType}`);
  console.log(`Arrivée [${endPos[0]},${endPos[1]}]: ${endPieceType}`);
  
  // Simplification de l'algorithme pour mieux trouver le chemin
  while (queue.length > 0) {
    const current = queue.shift()!;
    const { row, col, fromDirection } = current;
    
    console.log(`\nExploration de [${row},${col}], depuis: ${fromDirection || 'départ'}`);
    
    // Si on a trouvé l'arrivée
    if (row === endPos[0] && col === endPos[1]) {
      console.log("✅ ARRIVÉE TROUVÉE !");
      return reconstructPath(parent, startPos, endPos);
    }
    
    // Récupérer la configuration de la pièce actuelle
    const currentPieceType = grid[row][col];
    const currentPiece = getPieceConfig(currentPieceType);
    
    if (!currentPiece) {
      console.log(`❌ Pas de configuration pour: ${currentPieceType}`);
      continue;
    }
    
    // IMPORTANT: Utiliser les directions personnalisées si elles existent
    const currentDirections = cellDirections[`${row},${col}`] || currentPiece.directions;
    console.log(`Pièce actuelle: ${currentPiece.type}, directions: ${currentDirections.join(', ')}`);
    
    // CORRECTION: Logique pour déterminer quelles directions de sortie sont possibles
    let possibleExits = [...currentDirections];
    
    // Si nous sommes entrés par une direction spécifique (non nul si ce n'est pas le départ)
    if (fromDirection) {
      // CORRECTION IMPORTANTE: fromDirection est la direction par laquelle nous sommes entrés 
      // dans cette pièce (pas celle par laquelle nous sommes sortis de la précédente)
      
      // Vérifier que la pièce a bien une ouverture dans la direction d'entrée
      if (!currentDirections.includes(fromDirection)) {
        console.log(`❌ Anomalie: Pièce sans entrée dans la direction ${fromDirection}`);
        continue;
      }
      
      // Pour les virages (2 directions seulement), déterminer la direction de sortie
      if (currentDirections.length === 2) {
        // Dans un virage, on ne peut sortir que par l'autre direction
        possibleExits = currentDirections.filter(dir => dir !== fromDirection);
        console.log(`🔄 VIRAGE: Entrée par ${fromDirection}, sortie possible: ${possibleExits.join(', ')}`);
      } else {
        // Pour les carrefours (3+ directions), on peut sortir par toutes les directions sauf celle d'entrée
        possibleExits = currentDirections.filter(dir => dir !== fromDirection);
        console.log(`🔀 CARREFOUR: Entrée par ${fromDirection}, sorties possibles: ${possibleExits.join(', ')}`);
      }
    }
    
    // Explorer toutes les directions de sortie possibles
    for (const dir of possibleExits) {
      // Trouver les coordonnées de la prochaine cellule
      const move = moves.find(m => m.dir === dir);
      if (!move) continue;
      
      const { drow, dcol } = move;
      const newRow = row + drow;
      const newCol = col + dcol;
      
      console.log(`  Direction ${dir}: exploration de [${newRow},${newCol}]`);
      
      // Vérifier les limites
      if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
        console.log(`    ❌ Hors limites`);
        continue;
      }
      
      // Vérifier si déjà visitée
      const key = `${newRow},${newCol}`;
      if (visited.has(key)) {
        console.log(`    ❌ Déjà visitée`);
        continue;
      }
      
      // Vérifier si la cellule contient une pièce
      const nextPieceType = grid[newRow][newCol];
      if (!nextPieceType) {
        console.log(`    ❌ Case vide`);
        continue;
      }
      
      // Ignorer les obstacles
      if (nextPieceType.startsWith('obstacle_')) {
        console.log(`    ❌ Obstacle`);
        continue;
      }
      
      // Récupérer la configuration de la pièce suivante
      const nextPiece = getPieceConfig(nextPieceType);
      if (!nextPiece) {
        console.log(`    ❌ Configuration non trouvée`);
        continue;
      }
      
      // Vérifier si la connexion est possible
      const nextDirections = cellDirections[`${newRow},${newCol}`] || nextPiece.directions;
      const oppositeDir = getOppositeDirection(dir);
      
      console.log(`    Pièce: ${nextPieceType}, directions: [${nextDirections.join(', ')}]`);
      console.log(`    Doit avoir une entrée en ${oppositeDir} (opposé de ${dir})`);
      
      if (nextDirections.includes(oppositeDir)) {
        console.log(`    ✅ Connexion valide! [${newRow},${newCol}] ajoutée à la queue`);
        visited.add(key);
        // CORRECTION: Stocker correctement la direction par laquelle on entre dans la cellule suivante
        queue.push({ row: newRow, col: newCol, fromDirection: oppositeDir });
        parent.set(key, { row, col, fromDirection });
      } else {
        console.log(`    ❌ Connexion invalide: pas d'entrée en ${oppositeDir}`);
      }
    }
  }
  
  console.log("❌ AUCUN CHEMIN TROUVÉ");
  return [];
};

// Fonction pour reconstruire le chemin
function reconstructPath(
  parent: Map<string, { row: number, col: number, fromDirection: Direction | null }>,
  start: [number, number],
  end: [number, number]
): PathPosition[] {
  const path: PathPosition[] = [];
  let current = { row: end[0], col: end[1] };
  
  // Ajouter la fin au chemin
  path.unshift(current);
  
  // Reconstruire le chemin en remontant les parents
  while (current.row !== start[0] || current.col !== start[1]) {
    const key = `${current.row},${current.col}`;
    const parent_node = parent.get(key);
    
    if (!parent_node) break; // Sécurité
    
    current = { row: parent_node.row, col: parent_node.col };
    path.unshift(current);
  }
  
  return path;
}
