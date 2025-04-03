import { prisma } from './db';

// Configuration des niveaux du jeu

export interface Level {
  id: number;
  name: string;
  grid: (string | null)[][];
  // Nouvelle propriété pour stocker les positions des cellules verrouillées
  lockedCells: {row: number, col: number}[];
  boardImage: string; // Chemin vers l'image du plateau
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  // Ajouter la liste des pièces disponibles pour ce niveau
  availablePieces: string[];
}

// Fonction de sécurité pour créer une grille valide
const createGrid = (rows: number, cols: number, initialValues?: (string | null)[][]): (string | null)[][] => {
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
  
  // Si on a des valeurs initiales, les copier
  if (initialValues) {
    for (let i = 0; i < Math.min(rows, initialValues.length); i++) {
      for (let j = 0; j < Math.min(cols, initialValues[i]?.length || 0); j++) {
        grid[i][j] = initialValues[i][j];
      }
    }
  }
  
  return grid;
};

// Fonction d'aide pour générer automatiquement les cellules verrouillées à partir d'une grille
function generateLockedCells(grid: (string | null)[][]): {row: number, col: number}[] {
  const locked: {row: number, col: number}[] = [];
  
  // Parcourir la grille et ajouter chaque cellule non vide aux cellules verrouillées
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== null) {
        locked.push({ row: rowIndex, col: colIndex });
      }
    });
  });
  
  return locked;
}

// Données en mémoire pour la compatibilité avec l'existant
export const levels: Level[] = [
  {
    id: 1,
    name: "Niveau 1 - Initiation",
    grid: createGrid(3, 5, [
        [null, null, null, null, null],
        ['fin_2', null, null, 'puzzle_1', null],
        [null, 'obstacle_1', null, null, 'debut_1']
      ]),
    // Ajouter les cellules verrouillées
    lockedCells: [
      {row: 1, col: 0}, // fin_2
      {row: 1, col: 3}, // puzzle_1
      {row: 2, col: 1}, // obstacle_1
      {row: 2, col: 4}, // debut_1
    ],
    boardImage: "/Board-lvl1.png",
    description: "Créez votre premier chemin !",
    difficulty: 'easy',
    // Pièces disponibles pour le niveau 1
    availablePieces: ['puzzle_2', 'puzzle_4', 'puzzle_6'],
  },
  {
    id: 2,
    name: "Niveau 2 - Chemin simple",
    grid: createGrid(3, 5, [
      ['debut_1', 'puzzle_1', null, null, null],
      [null, 'puzzle_2', 'puzzle_3', null, null],
      [null, null, 'puzzle_4', 'puzzle_2', 'fin_1']
    ]),
    // Générer automatiquement les cellules verrouillées pour ce niveau
    lockedCells: generateLockedCells(createGrid(3, 5, [
      ['debut_1', 'puzzle_1', null, null, null],
      [null, 'puzzle_2', 'puzzle_3', null, null],
      [null, null, 'puzzle_4', 'puzzle_2', 'fin_1']
    ])),
    boardImage: "/Board-lvl1.png",
    description: "Complétez le chemin commencé pour permettre a Gaston d'atteindre sa destination.",
    difficulty: 'easy',
    // Pièces disponibles pour le niveau 2
    availablePieces: ['puzzle_1', 'puzzle_4', 'puzzle_5', 'puzzle_6'],
  },
  {
    id: 3,
    name: "Niveau 3 - Parcours défi",
    grid: createGrid(3, 5, [
      ['debut_1', null, null, null, 'puzzle_1'],
      [null, null, 'puzzle_3', null, 'puzzle_2'],
      ['puzzle_4', null, 'puzzle_1', null, 'fin_1']
    ]),
    lockedCells: generateLockedCells(createGrid(3, 5, [
      ['debut_1', null, null, null, 'puzzle_1'],
      [null, null, 'puzzle_3', null, 'puzzle_2'],
      ['puzzle_4', null, 'puzzle_1', null, 'fin_1']
    ])),
    boardImage: "/Board-lvl1.png",
    description: "Un niveau plus complexe avec des pièces déjà placées. Complétez le chemin pour gagner !",
    difficulty: 'medium',
    // Pièces disponibles pour le niveau 3
    availablePieces: ['puzzle_1', 'puzzle_2', 'puzzle_3', 'puzzle_6']
  }
];

// Récupérer tous les niveaux depuis la base de données
export async function getAllLevels(): Promise<Level[]> {
  try {
    const dbLevels = await prisma.level.findMany({
      where: { published: true },
      orderBy: { id: 'asc' },
    });
    
    return dbLevels.map(level => ({
      id: level.id,
      name: level.name,
      description: level.description || '',
      difficulty: level.difficulty as 'easy' | 'medium' | 'hard',
      boardImage: level.boardImage,
      grid: level.gridData as (string | null)[][],
      lockedCells: level.lockedCellsData as { row: number; col: number }[],
      availablePieces: level.availablePieces as string[], // Parse JSON
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des niveaux:', error);
    // Fallback aux niveaux en mémoire
    return levels;
  }
}

// Récupérer un niveau par son ID
export async function getLevelById(id: number): Promise<Level | undefined> {
  try {
    const level = await prisma.level.findUnique({
      where: { id },
    });
    
    if (!level) {
      // Fallback au niveau en mémoire
      return levels.find(l => l.id === id);
    }
    
    return {
      id: level.id,
      name: level.name,
      description: level.description || '',
      difficulty: level.difficulty as 'easy' | 'medium' | 'hard',
      boardImage: level.boardImage,
      grid: level.gridData as (string | null)[][],
      lockedCells: level.lockedCellsData as { row: number; col: number }[],
      availablePieces: level.availablePieces as string[], // Parse JSON
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération du niveau ${id}:`, error);
    // Fallback au niveau en mémoire
    return levels.find(l => l.id === id);
  }
}

// Récupérer un niveau par défaut avec garantie d'une bonne structure et cellules verrouillées
export function getDefaultLevel(): Level {
  const defaultLevel = levels[0];
  return {
    ...defaultLevel,
    grid: createGrid(3, 5, defaultLevel.grid), // Garantir une bonne structure
    // Assurer que les cellules verrouillées sont copiées
    lockedCells: [...defaultLevel.lockedCells] 
  };
}
