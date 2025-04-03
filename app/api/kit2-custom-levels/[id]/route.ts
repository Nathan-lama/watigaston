import { NextRequest, NextResponse } from 'next/server';
import { 
  getCustomKit2LevelById, 
  updateCustomKit2Level, 
  deleteCustomKit2Level,
  isValidKit2Level 
} from '@/utils/kit2CustomLevels';

// GET /api/kit2-custom-levels/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const level = await getCustomKit2LevelById(id);
    
    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }
    
    return NextResponse.json(level);
  } catch (error) {
    console.error(`Error fetching kit2 level ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error fetching kit2 level' },
      { status: 500 }
    );
  }
}

// PUT /api/kit2-custom-levels/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const data = await request.json();
    
    if (!isValidKit2Level(data)) {
      return NextResponse.json(
        { error: 'Invalid kit2 level data' },
        { status: 400 }
      );
    }
    
    const success = await updateCustomKit2Level(id, data);
    
    if (!success) {
      return NextResponse.json({ error: 'Level not found or update failed' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating kit2 level ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error updating kit2 level' },
      { status: 500 }
    );
  }
}

// DELETE /api/kit2-custom-levels/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const success = await deleteCustomKit2Level(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Level not found or delete failed' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting kit2 level ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error deleting kit2 level' },
      { status: 500 }
    );
  }
}
