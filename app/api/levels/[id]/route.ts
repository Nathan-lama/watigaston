import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth-options';

// Correct type definition for route params in App Router
type RouteParams = { params: { id: string } };

// GET /api/levels/[id] - Récupérer un niveau spécifique
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = context.params;
    const levelId = parseInt(id);
    
    const level = await prisma.level.findUnique({
      where: { id: levelId },
    });
    
    if (!level) {
      return NextResponse.json({ error: 'Niveau non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json(level);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération du niveau' }, { status: 500 });
  }
}

// PUT /api/levels/[id] - Mettre à jour un niveau
export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = context.params;
    const levelId = parseInt(id);
    const data = await request.json();
    
    const level = await prisma.level.update({
      where: { id: levelId },
      data: {
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        boardImage: data.boardImage,
        gridData: data.grid,
        lockedCellsData: data.lockedCells,
        availablePieces: data.availablePieces,
        published: data.published || false,
      },
    });
    
    return NextResponse.json(level);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du niveau' }, { status: 500 });
  }
}

// DELETE /api/levels/[id] - Supprimer un niveau
export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = context.params;
    const levelId = parseInt(id);
    
    await prisma.level.delete({
      where: { id: levelId },
    });
    
    return NextResponse.json({ message: 'Niveau supprimé avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression du niveau' }, { status: 500 });
  }
}
