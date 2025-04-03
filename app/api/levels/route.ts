import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth-options'; // Update this import

// GET /api/levels - Récupérer tous les niveaux
export async function GET() {
  try {
    const levels = await prisma.level.findMany({
      orderBy: {
        id: 'asc',
      },
    });
    
    return NextResponse.json(levels);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des niveaux' }, { status: 500 });
  }
}

// POST /api/levels - Créer un nouveau niveau
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();
    
    // Créer le niveau dans la base de données
    const level = await prisma.level.create({
      data: {
        name: data.name,
        description: data.description || '',
        difficulty: data.difficulty,
        boardImage: data.boardImage || '/Board-lvl1.png',
        gridData: data.grid,
        lockedCellsData: data.lockedCells,
        availablePieces: data.availablePieces,
        published: data.published || false,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json(level, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du niveau:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du niveau' }, { status: 500 });
  }
}
