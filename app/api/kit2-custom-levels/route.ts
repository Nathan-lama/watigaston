import { NextRequest, NextResponse } from 'next/server';
import { 
  getCustomKit2Levels, 
  createCustomKit2Level, 
  isValidKit2Level 
} from '@/utils/kit2CustomLevels';
import { createDefaultUser } from '@/utils/createDefaultUser';
import { prisma } from '@/utils/db';

// GET /api/kit2-custom-levels
export async function GET() {
  try {
    const levels = await getCustomKit2Levels();
    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching kit2 custom levels:', error);
    return NextResponse.json(
      { error: 'Error fetching kit2 custom levels' },
      { status: 500 }
    );
  }
}

// POST /api/kit2-custom-levels
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Ensure prisma client is properly initialized
    if (!prisma.kit2Level) {
      return NextResponse.json(
        { error: 'Database model not available - Kit2Level model may not be defined in schema' },
        { status: 500 }
      );
    }
    
    // Validate the data with detailed error reporting
    const validationResult = isValidKit2Level(data);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: 'Invalid kit2 level data', details: validationResult.errors },
        { status: 400 }
      );
    }
    
    // Get or create default user
    const userId = await createDefaultUser();
    console.log('Using user ID for kit2 level creation:', userId);
    
    // Log the data before creating the level
    console.log('Creating kit2 level with data:', {
      name: data.name,
      description: data.description,
      difficulty: data.difficulty,
      startPosition: data.startPosition,
      targetPosition: data.targetPosition,
      gridSize: data.grid ? `${data.grid.length}x${data.grid[0]?.length}` : 'undefined',
      lockedCellsCount: data.lockedCells ? data.lockedCells.length : 0
    });
    
    try {
      // Try creating the level directly through the Prisma client
      const newLevel = await prisma.kit2Level.create({
        data: {
          name: data.name,
          description: data.description || '',
          difficulty: data.difficulty || 'medium',
          grid: data.grid,
          lockedCells: data.lockedCells || [],
          targetPosition: data.targetPosition,
          startPosition: data.startPosition,
          userId: userId
        }
      });
      
      return NextResponse.json({ id: newLevel.id, success: true }, { status: 201 });
    } catch (prismaError) {
      console.error('Prisma error creating level:', prismaError);
      return NextResponse.json(
        { error: 'Database error creating level', details: prismaError instanceof Error ? prismaError.message : String(prismaError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating kit2 custom level:', error);
    return NextResponse.json(
      { 
        error: 'Error creating kit2 custom level', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
