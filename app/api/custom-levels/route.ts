import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { createDefaultUser } from '@/utils/createDefaultUser';

// GET /api/custom-levels - Get all custom levels
export async function GET() {
  try {
    const levels = await prisma.level.findMany({
      where: { published: false }, // Only fetch custom levels
      orderBy: { id: 'asc' },
    });
    
    // Transform database format to component-expected format
    const transformedLevels = levels.map(level => ({
      id: level.id,
      name: level.name,
      description: level.description || '',
      difficulty: level.difficulty,
      boardImage: level.boardImage,
      grid: level.gridData, // Map gridData to grid
      lockedCells: level.lockedCellsData, // Map lockedCellsData to lockedCells
      availablePieces: level.availablePieces
    }));
    
    return NextResponse.json(transformedLevels);
  } catch (error) {
    console.error('Error fetching custom levels:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des niveaux personnalisés' }, { status: 500 });
  }
}

// POST /api/custom-levels - Create a new custom level
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create default user if needed and get its ID
    let userId;
    try {
      userId = await createDefaultUser();
      console.log("Using default user ID:", userId);
    } catch (error) {
      console.error("Error getting default user:", error);
      return NextResponse.json({ 
        error: 'Erreur lors de la création de l\'utilisateur par défaut', 
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
    
    // Log the received data for debugging
    console.log('Creating custom level:', {
      name: data.name,
      description: data.description || '',
      difficulty: data.difficulty,
      userId
    });
    
    const level = await prisma.level.create({
      data: {
        name: data.name,
        description: data.description || '',
        difficulty: data.difficulty,
        boardImage: data.boardImage || '/Board-lvl1.png',
        gridData: data.grid,
        lockedCellsData: data.lockedCells,
        availablePieces: data.availablePieces,
        published: false, // Custom levels are not published
        userId, // Use the default user ID
      },
    });
    
    console.log('Level created successfully:', level.id);
    return NextResponse.json(level, { status: 201 });
  } catch (error) {
    console.error('Error creating custom level:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la création du niveau personnalisé', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
