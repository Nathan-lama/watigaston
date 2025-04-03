// Define the structure and content of Kit2 game levels

export interface Kit2Level {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  grid: (string | null)[][];
  lockedCells: {row: number; col: number}[];
  targetPosition: {row: number; col: number};
  startPosition: {row: number; col: number};
}

// Default levels for Kit2 mode
export const kit2Levels: Kit2Level[] = [
  {
    id: 1,
    name: "Niveau 1 - Initiation",
    description: "Programmer les mouvements de Gaston pour atteindre la maison",
    difficulty: "easy",
    grid: [
      [null, null, null, null, 'fin_1'],
      [null, 'obstacle_1', null, 'obstacle_2', null],
      ['debut_1', null, null, null, null]
    ],
    lockedCells: [
      {row: 0, col: 4}, // House
      {row: 1, col: 1}, // Obstacle 1
      {row: 1, col: 3}, // Obstacle 2
      {row: 2, col: 0}  // Start
    ],
    targetPosition: {row: 0, col: 4},
    startPosition: {row: 2, col: 0}
  },
  {
    id: 2,
    name: "Niveau 2 - Parcours",
    description: "Un chemin plus complexe avec plus d'obstacles",
    difficulty: "medium",
    grid: [
      [null, 'obstacle_1', null, 'fin_1', null],
      ['debut_1', null, null, 'obstacle_2', null],
      [null, null, 'obstacle_3', null, null]
    ],
    lockedCells: [
      {row: 0, col: 1}, // Obstacle 1
      {row: 0, col: 3}, // House
      {row: 1, col: 0}, // Start
      {row: 1, col: 3}, // Obstacle 2
      {row: 2, col: 2}  // Obstacle 3
    ],
    targetPosition: {row: 0, col: 3},
    startPosition: {row: 1, col: 0}
  },
  {
    id: 3,
    name: "Niveau 3 - Labyrinthe",
    description: "Un vrai défi: trouve le chemin dans ce labyrinthe!",
    difficulty: "hard",
    grid: [
      ['obstacle_1', 'obstacle_2', null, 'fin_1', null],
      [null, 'obstacle_3', null, 'obstacle_1', null],
      ['debut_1', null, 'obstacle_2', null, 'obstacle_3']
    ],
    lockedCells: [
      {row: 0, col: 0}, // Obstacle 1
      {row: 0, col: 1}, // Obstacle 2
      {row: 0, col: 3}, // House
      {row: 1, col: 1}, // Obstacle 3
      {row: 1, col: 3}, // Obstacle 1
      {row: 2, col: 0}, // Start
      {row: 2, col: 2}, // Obstacle 2
      {row: 2, col: 4}  // Obstacle 3
    ],
    targetPosition: {row: 0, col: 3},
    startPosition: {row: 2, col: 0}
  }
];

// Get level by ID
export function getKit2LevelById(id: number): Kit2Level {
  const level = kit2Levels.find(level => level.id === id);
  if (!level) {
    return kit2Levels[0]; // Default to first level if not found
  }
  return level;
}

// Get default level
export function getDefaultKit2Level(): Kit2Level {
  return kit2Levels[0];
}
