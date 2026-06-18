import { NextRequest, NextResponse } from 'next/server';
import { LocalAdapter } from '@/lib/storage/localAdapter';

const storage = new LocalAdapter();

export async function GET() {
  try {
    const ingredients = await storage.getIngredients();
    return NextResponse.json({ success: true, data: ingredients });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao carregar' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newIngredient = await storage.createIngredient(body);
    return NextResponse.json({ success: true, data: newIngredient });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao criar' }, { status: 500 });
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
    const updated = await storage.updateIngredient(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID não fornecido' }, { status: 400 });
    }
    await storage.deleteIngredient(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao deletar' }, { status: 500 });
  }
}
