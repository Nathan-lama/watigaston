import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/db';

// GET /api/custom-levels/[id] - Fetch a custom level by ID
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  // First await the params to follow Next.js recommended practice
  const params = await Promise.resolve(context.params);
  const { id } = params;
  
  try {
    const levelId = parseInt(id);

    const level = await prisma.level.findUnique({
      where: { id: levelId },
    });

    if (!level) {
      return NextResponse.json({ error: 'Niveau non trouvé' }, { status: 404 });
    }

    // Transform the database format to the format expected by components
    return NextResponse.json({
      id: level.id,
      name: level.name,
      description: level.description || '',
      difficulty: level.difficulty,
      boardImage: level.boardImage,
      grid: level.gridData, // Map gridData to grid for the frontend
      lockedCells: level.lockedCellsData, // Map lockedCellsData to lockedCells
      availablePieces: level.availablePieces
    });
  } catch (error) {
    console.error('Error fetching custom level:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération du niveau personnalisé' }, { status: 500 });
  }
}

// PUT /api/custom-levels/[id] - Update a custom level by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // First await the params to follow Next.js recommended practice
  params = await Promise.resolve(params);
  const { id } = params;
  
  try {
    const levelId = parseInt(id);
    const data = await request.json();

    const updatedLevel = await prisma.level.update({
      where: { id: levelId },
      data: {
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        gridData: data.grid,
        lockedCellsData: data.lockedCells,
        availablePieces: data.availablePieces,
      },
    });

    // Return the transformed data to match frontend expectations
    return NextResponse.json({
      id: updatedLevel.id,
      name: updatedLevel.name,
      description: updatedLevel.description || '',
      difficulty: updatedLevel.difficulty,
      boardImage: updatedLevel.boardImage,
      grid: updatedLevel.gridData,
      lockedCells: updatedLevel.lockedCellsData,
      availablePieces: updatedLevel.availablePieces
    });
  } catch (error) {
    console.error('Error updating custom level:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du niveau personnalisé' }, { status: 500 });
  }
}

// DELETE /api/custom-levels/[id] - Delete a custom level by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // First await the params to follow Next.js recommended practice
  params = await Promise.resolve(params);
  const { id } = params;
  
  try {
    const levelId = parseInt(id);
    
    await prisma.level.delete({
      where: { id: levelId },
    });
    
    return NextResponse.json({ message: 'Niveau supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting custom level:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du niveau personnalisé' }, { status: 500 });
  }
}
