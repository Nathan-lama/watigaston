// Configuration des niveaux du jeu

export interface Level {
  id: number;
  name: string;
  grid: (string | null)[][];
  boardImage: string; // Chemin vers l'image du plateau
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
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

// Niveau vide 3x5 bien défini
const EMPTY_GRID: (string | null)[][] = createGrid(3, 5);

export const levels: Level[] = [
  {
    id: 1,
    name: "Niveau 1 - Initiation",
    grid: createGrid(3, 5), // Utiliser notre fonction de création
    boardImage: "/Board-lvl1.png",
    description: "Créez votre premier chemin ! Placez le Petit Chaperon Rouge et sa grand-mère, puis connectez-les avec des chemins.",
    difficulty: 'easy'
  },
  {
    id: 2,
    name: "Niveau 2 - Chemin simple",
    grid: createGrid(3, 5, [
      ['debut_1', 'puzzle_1', null, null, null],
      [null, 'puzzle_2', 'puzzle_3', null, null],
      [null, null, 'puzzle_4', 'puzzle_2', 'fin_1']
    ]),
    boardImage: "/Board-lvl1.png",
    description: "Complétez le chemin commencé pour permettre au Petit Chaperon Rouge d'atteindre sa destination.",
    difficulty: 'easy'
  },
  {
    id: 3,
    name: "Niveau 3 - Parcours défi",
    grid: createGrid(3, 5, [
      ['debut_1', null, null, null, 'puzzle_1'],
      [null, null, 'puzzle_3', null, 'puzzle_2'],
      ['puzzle_4', null, 'puzzle_1', null, 'fin_1']
    ]),
    boardImage: "/Board-lvl1.png",
    description: "Un niveau plus complexe avec des pièces déjà placées. Complétez le chemin pour gagner !",
    difficulty: 'medium'
  }
];

// Récupérer un niveau par son ID
export function getLevelById(id: number): Level | undefined {
  return levels.find(level => level.id === id);
}

// Récupérer un niveau par défaut avec garantie d'une bonne structure
export function getDefaultLevel(): Level {
  const defaultLevel = levels[0];
  return {
    ...defaultLevel,
    grid: createGrid(3, 5, defaultLevel.grid) // Garantir une bonne structure
  };
}
