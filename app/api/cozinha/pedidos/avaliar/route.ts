// Caminho: C:\valente_conecta\app\api\cozinha\pedidos\avaliar\route.ts
//
// Pesquisa de satisfacao pos-entrega (087_cozinha_checkout_pedidos.sql,
// tabela cozinha_avaliacoes). So' pode avaliar pedido ja entregue; unique
// em pedido_id impede avaliar duas vezes.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pedidoId = String(body.pedidoId || '').trim();
    const estrelas = parseInt(body.estrelas, 10);
    const motivo = body.motivo ? String(body.motivo).trim() : null;

    if (!pedidoId) return NextResponse.json({ success: false, error: 'pedidoId é obrigatório' }, { status: 400 });
    if (!Number.isFinite(estrelas) || estrelas < 1 || estrelas > 5) {
      return NextResponse.json({ success: false, error: 'Estrelas deve ser um número entre 1 e 5' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: pedido } = await supabase.from('cozinha_pedidos').select('id, status').eq('id', pedidoId).maybeSingle();
    if (!pedido) return NextResponse.json({ success: false, error: 'Pedido não encontrado' }, { status: 404 });
    if (pedido.status !== 'entregue') {
      return NextResponse.json({ success: false, error: 'Só é possível avaliar pedidos já entregues' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('cozinha_avaliacoes')
      .insert({ pedido_id: pedidoId, estrelas, motivo })
      .select('*')
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        return NextResponse.json({ success: false, error: 'Você já avaliou este pedido' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro ao salvar avaliação da Cozinha:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar avaliação' }, { status: 500 });
  }
}
