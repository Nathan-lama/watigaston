// Types pour caractériser les pièces de puzzle

// Direction possible pour une pièce
export type Direction = 'N' | 'S' | 'E' | 'W';

// Configuration d'une pièce avec ses directions d'entrée/sortie
export interface PuzzlePieceConfig {
  type: string;
  name: string;
  directions: Direction[];  // Liste des directions où la pièce a des ouvertures
  imagePath: string;
  rotatable?: boolean;  // Indique si la pièce peut être pivotée
}

// Configuration pour toutes les pièces de puzzle
export const puzzlePieces: Record<string, PuzzlePieceConfig> = {
  // Pièces de départ (chaperon rouge) - sortie vers toutes les directions
  'debut_1': {
    type: 'debut_1',
    name: 'Départ',
    directions: ['N', 'S', 'E', 'W'],
    imagePath: '/kit1/debut/piece1.png'
  },
  
  // Pièces d'arrivée (maison) - entrée depuis toutes les directions
  'fin_1': {
    type: 'fin_1',
    name: 'Arrivée',
    directions: ['N', 'S', 'E', 'W'],
    imagePath: '/kit1/fin/piece1.png'
  },
  'fin_2': {
    type: 'fin_2',
    name: 'Maison',
    directions: ['N', 'S', 'E', 'W'],
    imagePath: '/kit1/fin/piece2.png'
  },
  
  // Pièces de chemins droits
  'puzzle_1': { 
    type: 'puzzle_1',
    name: 'Chemin horizontal',
    directions: ['E', 'W'],
    imagePath: '/kit1/puzzle/piece1.png'
  },
  'puzzle_2': { 
    type: 'puzzle_2',
    name: 'Chemin Sud-West',
    directions: ['S', 'W'],
    imagePath: '/kit1/puzzle/piece2.png'
  },
  
  // Pièces de virages
  'puzzle_3': { 
    type: 'puzzle_3',
    name: 'Virage Sud-West',
    directions: ['S', 'W'],
    imagePath: '/kit1/puzzle/piece3.png'
  },
  'puzzle_4': { 
    type: 'puzzle_4',
    name: 'Virage Nord-Ouest',
    directions: ['E', 'W'], 
    imagePath: '/kit1/puzzle/piece4.png'
  },
  'puzzle_5': { 
    type: 'puzzle_5',
    name: 'Virage Sud-Est',
    directions: ['S', 'W'], 
    imagePath: '/kit1/puzzle/piece5.png'
  },
  'puzzle_6': { 
    type: 'puzzle_6',
    name: 'Virage Sud-Ouest',
    directions: ['E', 'W'],
    imagePath: '/kit1/puzzle/piece6.png'
  },
  
  // Pièces de carrefour
  'puzzle_7': { 
    type: 'puzzle_7',
    name: 'Carrefour en T',
    directions: ['E', 'W'],
    imagePath: '/kit1/puzzle/piece7.png'
  },
  'puzzle_8': { 
    type: 'puzzle_8',
    name: 'Carrefour en croix',
    directions: ['E', 'W'],
    imagePath: '/kit1/puzzle/piece8.png'
  }
};

// Marquer toutes les pièces de puzzle comme pouvant être pivotées
Object.keys(puzzlePieces).forEach(key => {
  if (key.startsWith('puzzle_')) {
    puzzlePieces[key].rotatable = true;
  }
});

// Fonction pour récupérer la configuration d'une pièce
export function getPieceConfig(pieceType: string | null): PuzzlePieceConfig | null {
  if (!pieceType) return null;
  return puzzlePieces[pieceType] || null;
}

// Améliorer la fonction canConnect pour être plus tolérante avec les pièces de départ et d'arrivée
export function canConnect(
  piece1: PuzzlePieceConfig | null, 
  piece2: PuzzlePieceConfig | null, 
  direction: Direction
): boolean {
  if (!piece1 || !piece2) return false;
  
  // Obtenir la direction opposée (où on arrive dans la pièce suivante)
  const oppositeDirection = getOppositeDirection(direction);
  
  // Cas spécial pour les pièces de départ et d'arrivée qui peuvent se connecter dans toutes les directions
  const isStartOrEnd1 = piece1.type.startsWith('debut_') || piece1.type.startsWith('fin_');
  const isStartOrEnd2 = piece2.type.startsWith('debut_') || piece2.type.startsWith('fin_');
  
  // Si les deux pièces sont des pièces de départ/arrivée, elles peuvent toujours se connecter
  if (isStartOrEnd1 && isStartOrEnd2) return true;
  
  // Si pièce1 est un départ/arrivée, vérifier seulement que pièce2 a l'ouverture dans la direction opposée
  if (isStartOrEnd1) return piece2.directions.includes(oppositeDirection);
  
  // Si pièce2 est un départ/arrivée, vérifier seulement que pièce1 a l'ouverture dans la direction
  if (isStartOrEnd2) return piece1.directions.includes(direction);
  
  // Cas standard: vérifier les deux directions
  return piece1.directions.includes(direction) && piece2.directions.includes(oppositeDirection);
}

// Fonction pour déterminer si une pièce est un point de départ
export function isStartPiece(pieceType: string | null): boolean {
  return !!pieceType && pieceType.startsWith('debut_');
}

// Fonction pour déterminer si une pièce est un point d'arrivée
export function isEndPiece(pieceType: string | null): boolean {
  return !!pieceType && pieceType.startsWith('fin_');
}

// Fonction pour obtenir la direction de sortie d'une pièce de départ
export function getStartPieceDirection(pieceType: string | null): Direction | null {
  if (!isStartPiece(pieceType)) return null;
  const config = getPieceConfig(pieceType);
  // Pour simplifier, on considère que le départ peut se connecter dans n'importe quelle direction
  return config?.directions[0] || null;
}

// Fonction pour obtenir la direction d'entrée d'une pièce d'arrivée
export function getEndPieceDirection(pieceType: string | null): Direction | null {
  if (!isEndPiece(pieceType)) return null;
  const config = getPieceConfig(pieceType);
  // Pour simplifier, on considère que l'arrivée peut recevoir depuis n'importe quelle direction
  return config?.directions[0] || null;
}

// Fonction pour obtenir toutes les directions possibles d'une pièce
export function getAllDirections(pieceType: string | null): Direction[] {
  const config = getPieceConfig(pieceType);
  return config?.directions || [];
}

// Fonction pour obtenir la direction opposée
export function getOppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case 'N': return 'S';
    case 'S': return 'N';
    case 'E': return 'W';
    case 'W': return 'E';
  }
}

// Rotation des directions: fait tourner les directions dans le sens horaire
export function rotateDirectionsClockwise(directions: Direction[]): Direction[] {
  return directions.map(dir => {
    switch (dir) {
      case 'N': return 'E';
      case 'E': return 'S';
      case 'S': return 'W';
      case 'W': return 'N';
      default: return dir;
    }
  });
}

// Rotation des directions: fait tourner les directions dans le sens anti-horaire
export function rotateDirectionsCounterClockwise(directions: Direction[]): Direction[] {
  return directions.map(dir => {
    switch (dir) {
      case 'N': return 'W';
      case 'W': return 'S';
      case 'S': return 'E';
      case 'E': return 'N';
      default: return dir;
    }
  });
}

// Fonction pour vérifier la cohérence des définitions de pièces
export function checkPieceConsistency() {
  console.log("=== VÉRIFICATION DE LA COHÉRENCE DES PIÈCES ===");
  
  // Vérifier les pièces de virage
  const virages = [
    { type: 'puzzle_3', expected: ['N', 'E'] },
    { type: 'puzzle_4', expected: ['N', 'W'] },
    { type: 'puzzle_5', expected: ['S', 'E'] },
    { type: 'puzzle_6', expected: ['S', 'W'] }
  ];
  
  virages.forEach(virage => {
    const piece = puzzlePieces[virage.type];
    
    if (!piece) {
      console.error(`❌ Pièce ${virage.type} introuvable!`);
      return;
    }
    
    const dirs = [...piece.directions].sort();
    const expected = [...virage.expected].sort();
    
    const isCorrect = dirs.length === expected.length && 
                      dirs.every((dir, i) => dir === expected[i]);
    
    console.log(`${isCorrect ? '✅' : '❌'} ${virage.name} (${virage.type}): `);
    console.log(`  Directions actuelles: [${piece.directions.join(', ')}]`);
    console.log(`  Directions attendues: [${virage.expected.join(', ')}]`);
    
    if (!isCorrect) {
      console.error(`❌ ERREUR: Les directions ne correspondent pas pour ${virage.type}!`);
    }
  });
  
  // Vérifier les autres types de pièces
  console.log("\nAutres pièces:");
  Object.entries(puzzlePieces).forEach(([key, piece]) => {
    if (!key.startsWith('puzzle_') || [3, 4, 5, 6].includes(parseInt(key.split('_')[1]))) {
      return; // Ignorer les pièces déjà vérifiées
    }
    
    console.log(`- ${piece.name} (${key}): [${piece.directions.join(', ')}]`);
  });
  
  console.log("\nPièces de départ/arrivée:");
  Object.entries(puzzlePieces).forEach(([key, piece]) => {
    if (key.startsWith('debut_') || key.startsWith('fin_')) {
      console.log(`- ${piece.name} (${key}): [${piece.directions.join(', ')}]`);
    }
  });
}

// Exemple d'utilisation facile dans la console
export function testExample() {
  console.log("=== EXEMPLE D'UTILISATION DES OUTILS DE DÉBOGAGE ===");
  console.log("\n1. Pour tester un chemin manuellement:");
  console.log("testPath(grid, [[2,4], [1,4], [1,3], [1,2], [1,1], [1,0]])");
  
  console.log("\n2. Pour vérifier les connexions entre pièces:");
  console.log("testConnection('puzzle_6', 'debut_1', 'S')");
  
  console.log("\n3. Pour vérifier la cohérence des types de pièces:");
  console.log("checkPieceConsistency()");
  
  console.log("\n4. Pour déboguer l'ensemble du chemin:");
  console.log("debugPath([2,4], [1,0], grid)");
}

// Exposer aux outils de développement
if (typeof window !== 'undefined') {
  (window as any).checkPieceConsistency = checkPieceConsistency;
  (window as any).testExample = testExample;
}
