// Caminho: C:\valente_conecta\app\api\catalogo\itens\route.ts
// CRUD generico de catalogo_itens, reutilizado por todos os modulos verticais.

import { NextRequest, NextResponse } from 'next/server';
import { listarItens, criarItem } from '@/lib/catalogo/catalogoService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modulo = searchParams.get('modulo') || undefined;
    const donoId = searchParams.get('dono_id') || undefined;
    const data = await listarItens(modulo, donoId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao listar itens do catálogo:', error);
    return NextResponse.json({ success: false, error: 'Erro ao listar itens' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.dono_id || !body.modulo || !body.categoria || !body.titulo) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios: dono_id, modulo, categoria, titulo' }, { status: 400 });
    }
    const data = await criarItem(body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao criar item do catálogo:', error);
    return NextResponse.json({ success: false, error: 'Erro ao criar item' }, { status: 500 });
  }
}
