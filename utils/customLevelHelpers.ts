import { Level } from '@/utils/levels';

// Validate a level to ensure it has all required properties and proper structure
export function validateLevel(level: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required properties
  if (!level.name) errors.push('Level name is missing');
  if (!level.difficulty) errors.push('Level difficulty is missing');
  
  // Check grid structure
  if (!level.grid) {
    errors.push('Level grid is missing');
  } else if (!Array.isArray(level.grid)) {
    errors.push('Level grid is not an array');
  } else if (level.grid.length === 0) {
    errors.push('Level grid is empty');
  } else if (!Array.isArray(level.grid[0])) {
    errors.push('Level grid rows are not arrays');
  }
  
  // Check lockedCells
  if (!level.lockedCells) {
    errors.push('Level lockedCells is missing');
  } else if (!Array.isArray(level.lockedCells)) {
    errors.push('Level lockedCells is not an array');
  }
  
  // Check availablePieces
  if (!level.availablePieces) {
    errors.push('Level availablePieces is missing');
  } else if (!Array.isArray(level.availablePieces)) {
    errors.push('Level availablePieces is not an array');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Create a default structure for a level if any part is missing
export function ensureValidLevel(level: any): Level {
  const defaultLevel: Level = {
    id: level?.id || 0,
    name: level?.name || 'Niveau sans nom',
    description: level?.description || '',
    difficulty: level?.difficulty || 'easy',
    boardImage: level?.boardImage || '/Board-lvl1.png',
    grid: Array.isArray(level?.grid) && level.grid.length > 0 && Array.isArray(level.grid[0]) 
      ? level.grid 
      : Array(3).fill(null).map(() => Array(5).fill(null)),
    lockedCells: Array.isArray(level?.lockedCells) ? level.lockedCells : [],
    availablePieces: Array.isArray(level?.availablePieces) ? level.availablePieces : [],
  };
  
  return defaultLevel;
}

// Log level data for debugging
export function debugLevel(level: any): void {
  console.log('==================== DEBUG LEVEL ====================');
  console.log('Level ID:', level?.id);
  console.log('Name:', level?.name);
  console.log('Difficulty:', level?.difficulty);
  console.log('Grid structure:', Array.isArray(level?.grid) ? `${level.grid.length} rows × ${level.grid[0]?.length || 0} cols` : 'Invalid grid');
  console.log('LockedCells count:', Array.isArray(level?.lockedCells) ? level.lockedCells.length : 'Invalid lockedCells');
  console.log('AvailablePieces count:', Array.isArray(level?.availablePieces) ? level.availablePieces.length : 'Invalid availablePieces');
  
  // Validation
  const { valid, errors } = validateLevel(level);
  console.log('Is valid level:', valid);
  if (!valid) {
    console.error('Validation errors:', errors);
  }
  console.log('====================================================');
}
