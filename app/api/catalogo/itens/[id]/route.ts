// Caminho: C:\valente_conecta\app\api\catalogo\itens\[id]\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { obterItem, atualizarItem, removerItem } from '@/lib/catalogo/catalogoService';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await obterItem(params.id);
    if (!data) return NextResponse.json({ success: false, error: 'Item não encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao obter item do catálogo:', error);
    return NextResponse.json({ success: false, error: 'Erro ao obter item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    if (!body.dono_id) {
      return NextResponse.json({ success: false, error: 'dono_id é obrigatório' }, { status: 400 });
    }
    const { dono_id, ...patch } = body;
    const data = await atualizarItem(params.id, dono_id, patch);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao atualizar item do catálogo:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const donoId = searchParams.get('dono_id');
    if (!donoId) return NextResponse.json({ success: false, error: 'dono_id é obrigatório' }, { status: 400 });
    await removerItem(params.id, donoId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover item do catálogo:', error);
    return NextResponse.json({ success: false, error: 'Erro ao remover item' }, { status: 500 });
  }
}
