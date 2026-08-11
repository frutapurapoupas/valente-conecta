// Caminho: C:\valente_conecta\app\api\catalogo\interesses\route.ts
//
// Fluxo de "interesse pago": comprador manifesta interesse num item,
// backend calcula taxas (taxas_config) e assinatura ativa, fornecedor
// é notificado. Ver MODULO_MARKETPLACE_MONETIZACAO.md, secao 2.2.

import { NextRequest, NextResponse } from 'next/server';
import { criarInteresse, listarInteresses } from '@/lib/catalogo/catalogoService';
import { enviarPushParaUsuario } from '@/lib/push';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fornecedorId = searchParams.get('fornecedor_id') || undefined;
    const compradorId = searchParams.get('comprador_id') || undefined;
    const data = await listarInteresses({ fornecedorId, compradorId });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao listar interesses:', error);
    return NextResponse.json({ success: false, error: 'Erro ao listar interesses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.item_id || !body.comprador_id) {
      return NextResponse.json({ success: false, error: 'item_id e comprador_id são obrigatórios' }, { status: 400 });
    }
    const data = await criarInteresse(body.item_id, body.comprador_id);
    try {
      await enviarPushParaUsuario(data.fornecedor_id, {
        titulo: 'Novo interesse no seu anúncio',
        corpo: 'Alguém se interessou por um dos seus itens no Valente Conecta.',
      });
    } catch {
      // push é best-effort — não bloqueia a criação do interesse
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao criar interesse:', error);
    return NextResponse.json({ success: false, error: 'Erro ao registrar interesse' }, { status: 500 });
  }
}
