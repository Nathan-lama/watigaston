import * as sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Alternative direct database access for when prisma client has issues
export async function createKit2LevelDirect(levelData: any, userId: string): Promise<number> {
  // Open the database
  const db = await open({
    filename: './prisma/dev.db',
    driver: sqlite3.Database
  });
  
  try {
    // Create the level using SQL
    const result = await db.run(
      `INSERT INTO Kit2Level (name, description, difficulty, grid, lockedCells, targetPosition, startPosition, userId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        levelData.name,
        levelData.description || '',
        levelData.difficulty || 'medium',
        JSON.stringify(levelData.grid),
        JSON.stringify(levelData.lockedCells || []),
        JSON.stringify(levelData.targetPosition),
        JSON.stringify(levelData.startPosition),
        userId,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );
    
    return result.lastID;
  } finally {
    await db.close();
  }
}
