import { prisma } from './db';
import { Kit2Level } from './kit2Levels';

// Custom level interface extending Kit2Level
export interface CustomKit2Level extends Kit2Level {
  userId: string;
}

// Check if a level is valid with better error reporting
export function isValidKit2Level(level: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!level) {
    errors.push('Level data is null or undefined');
    return { valid: false, errors };
  }
  
  if (!level.name || typeof level.name !== 'string') {
    errors.push('Level name is required and must be a string');
  }
  
  if (level.description !== undefined && typeof level.description !== 'string') {
    errors.push('Level description must be a string if provided');
  }
  
  if (!level.grid) {
    errors.push('Grid is required');
  } else if (!Array.isArray(level.grid)) {
    errors.push('Grid must be an array');
  } else if (level.grid.length === 0) {
    errors.push('Grid cannot be empty');
  }
  
  if (!level.lockedCells) {
    errors.push('LockedCells is required');
  } else if (!Array.isArray(level.lockedCells)) {
    errors.push('LockedCells must be an array');
  }
  
  if (!level.targetPosition) {
    errors.push('TargetPosition is required');
  } else {
    if (typeof level.targetPosition !== 'object') {
      errors.push('TargetPosition must be an object');
    } else {
      if (typeof level.targetPosition.row !== 'number') {
        errors.push('TargetPosition.row must be a number');
      }
      if (typeof level.targetPosition.col !== 'number') {
        errors.push('TargetPosition.col must be a number');
      }
    }
  }
  
  if (!level.startPosition) {
    errors.push('StartPosition is required');
  } else {
    if (typeof level.startPosition !== 'object') {
      errors.push('StartPosition must be an object');
    } else {
      if (typeof level.startPosition.row !== 'number') {
        errors.push('StartPosition.row must be a number');
      }
      if (typeof level.startPosition.col !== 'number') {
        errors.push('StartPosition.col must be a number');
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Get default empty grid for a new level
export function getEmptyKit2Grid(): (string | null)[][] {
  return [
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null]
  ];
}

// Create a new custom Kit2 level in the database with improved error handling
export async function createCustomKit2Level(
  level: Partial<CustomKit2Level>,
  userId: string
): Promise<number> {
  try {
    // Validate required fields
    const validationResult = isValidKit2Level(level);
    if (!validationResult.valid) {
      throw new Error(`Invalid level data: ${validationResult.errors.join(', ')}`);
    }

    console.log('Creating Kit2 level with data:', {
      name: level.name,
      description: level.description || '',
      difficulty: level.difficulty || 'medium',
      startPosition: level.startPosition,
      targetPosition: level.targetPosition,
      grid: level.grid ? `${level.grid.length} rows x ${level.grid[0]?.length || 0} cols` : 'undefined',
      lockedCells: level.lockedCells ? `${level.lockedCells.length} cells` : 'undefined'
    });

    // Check if prisma.kit2Level exists
    if (!prisma.kit2Level) {
      throw new Error('prisma.kit2Level is undefined. Make sure your Prisma schema includes the Kit2Level model and you have generated the client.');
    }

    const newLevel = await prisma.kit2Level.create({
      data: {
        name: level.name!,
        description: level.description || '',
        difficulty: level.difficulty || 'medium',
        grid: level.grid!,
        lockedCells: level.lockedCells || [],
        targetPosition: level.targetPosition!,
        startPosition: level.startPosition!,
        userId: userId
      }
    });

    return newLevel.id;
  } catch (error) {
    console.error('Error creating custom Kit2 level:', error);
    throw error;
  }
}

// Get all custom Kit2 levels for a user
export async function getCustomKit2Levels(userId?: string): Promise<CustomKit2Level[]> {
  try {
    const where = userId ? { userId } : {};
    const levels = await prisma.kit2Level.findMany({
      where,
      orderBy: { id: 'asc' }
    });

    return levels.map(level => ({
      id: level.id,
      name: level.name,
      description: level.description || '',
      difficulty: level.difficulty as 'easy' | 'medium' | 'hard',
      grid: level.grid as (string | null)[][],
      lockedCells: level.lockedCells as { row: number; col: number }[],
      targetPosition: level.targetPosition as { row: number; col: number },
      startPosition: level.startPosition as { row: number; col: number },
      userId: level.userId
    }));
  } catch (error) {
    console.error('Error getting custom Kit2 levels:', error);
    return [];
  }
}

// Get a custom Kit2 level by ID
export async function getCustomKit2LevelById(id: number): Promise<CustomKit2Level | null> {
  try {
    const level = await prisma.kit2Level.findUnique({
      where: { id }
    });

    if (!level) return null;

    return {
      id: level.id,
      name: level.name,
      description: level.description || '',
      difficulty: level.difficulty as 'easy' | 'medium' | 'hard',
      grid: level.grid as (string | null)[][],
      lockedCells: level.lockedCells as { row: number; col: number }[],
      targetPosition: level.targetPosition as { row: number; col: number },
      startPosition: level.startPosition as { row: number; col: number },
      userId: level.userId
    };
  } catch (error) {
    console.error(`Error getting Kit2 level with ID ${id}:`, error);
    return null;
  }
}

// Update a custom Kit2 level
export async function updateCustomKit2Level(
  id: number,
  level: Partial<CustomKit2Level>
): Promise<boolean> {
  try {
    await prisma.kit2Level.update({
      where: { id },
      data: {
        name: level.name,
        description: level.description,
        difficulty: level.difficulty,
        grid: level.grid,
        lockedCells: level.lockedCells,
        targetPosition: level.targetPosition,
        startPosition: level.startPosition
      }
    });
    return true;
  } catch (error) {
    console.error(`Error updating Kit2 level with ID ${id}:`, error);
    return false;
  }
}

// Delete a custom Kit2 level
export async function deleteCustomKit2Level(id: number): Promise<boolean> {
  try {
    await prisma.kit2Level.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    console.error(`Error deleting Kit2 level with ID ${id}:`, error);
    return false;
  }
}
