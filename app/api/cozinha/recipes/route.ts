import { NextRequest, NextResponse } from 'next/server';
import { LocalAdapter } from '@/lib/storage/localAdapter';

const storage = new LocalAdapter();

export async function GET() {
  try {
    const recipes = await storage.getRecipes();
    return NextResponse.json({ success: true, data: recipes });
  } catch (error) {
    console.error('GET Recipes Error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao carregar receitas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newRecipe = await storage.createRecipe(body);
    return NextResponse.json({ success: true, data: newRecipe });
  } catch (error) {
    console.error('POST Recipe Error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao criar receita' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID não fornecido' }, { status: 400 });
    }
    const body = await request.json();
    const updated = await storage.updateRecipe(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT Recipe Error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar receita' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID não fornecido' }, { status: 400 });
    }
    await storage.deleteRecipe(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Recipe Error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao deletar receita' }, { status: 500 });
  }
}
