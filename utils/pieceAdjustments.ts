// Configuration des ajustements de position et taille pour chaque pièce
export interface PieceAdjustment {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface PieceAdjustments {
  // Ajustements globaux pour le plateau
  board: {
    scale: number;
    gridGap: number;
    cellSize: number; // Nouvelle propriété: taille des cellules en pixels
  };
  // Ajustements par type de pièce
  pieces: {
    [key: string]: PieceAdjustment;
  };
}

// Configuration par défaut des ajustements
export const defaultAdjustments: PieceAdjustments = {
  board: {
    scale: 1.2,
    gridGap: 0,
    cellSize: 107,
  },
  pieces: {
    // Pièces de début - échelle modifiée à 1.1
    'debut_1': { offsetX: 0, offsetY: 0, scale: 1.09 },
    
    // Pièces de fin - échelle modifiée à 1.1
    'fin_1': { offsetX: 0, offsetY: 0, scale: 1.09 },
    'fin_2': { offsetX: 0, offsetY: 0, scale: 1.09 },

    
    // Pièces de chemin - toutes avec la même valeur d'échelle 1.1
    'puzzle_1': { offsetX: 0, offsetY: 0, scale: 1.09 },
    'puzzle_2': { offsetX: 0, offsetY: 0, scale: 1.09 },
    'puzzle_3': { offsetX: 0, offsetY: 0, scale: 1.09 },
    'puzzle_4': { offsetX: 0, offsetY: 0, scale: 1.09 },
    'puzzle_5': { offsetX: 0, offsetY: 0, scale: 1.09 },
    'puzzle_6': { offsetX: 0, offsetY: 0, scale: 1.09 },
    'puzzle_7': { offsetX: 0, offsetY: 0, scale: 1.09 },
    'puzzle_8': { offsetX: 0, offsetY: 0, scale: 1.09 },
    
    // Obstacles - ajout des ajustements pour les obstacles
    'obstacle_1': { offsetX: 0, offsetY: 0, scale: 1 },
    'obstacle_2': { offsetX: 0, offsetY: 0, scale: 1 },
    'obstacle_3': { offsetX: 0, offsetY: 0, scale: 1 },
    'obstacle_4': { offsetX: 0, offsetY: 0, scale: 1 },  }
};

// Helper function to get adjustment for a piece
export const getAdjustmentForPiece = (pieceType: string, adjustments: PieceAdjustments): PieceAdjustment => {
  // Si c'est une pièce de type puzzle et qu'elle n'existe pas encore dans les ajustements,
  // utiliser les valeurs de puzzle_1 comme référence
  if (pieceType.startsWith('puzzle_') && !adjustments.pieces[pieceType] && adjustments.pieces['puzzle_1']) {
    return {...adjustments.pieces['puzzle_1']};
  }
  
  // Si c'est un obstacle et qu'il n'existe pas encore dans les ajustements,
  // utiliser les valeurs de obstacle_1 comme référence
  if (pieceType.startsWith('obstacle_') && !adjustments.pieces[pieceType] && adjustments.pieces['obstacle_1']) {
    return {...adjustments.pieces['obstacle_1']};
  }
  
  // Sinon retourner l'ajustement existant ou des valeurs par défaut
  return adjustments.pieces[pieceType] || { offsetX: 0, offsetY: 0, scale: 1 };
};
