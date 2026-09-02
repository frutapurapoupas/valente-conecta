// Caminho: C:\valente_conecta\app\api\catalogo\interesses\[id]\avaliar\route.ts
//
// Comprador avalia (até 5 estrelas + comentário opcional) um interesse já
// marcado como concluído pelo lojista (ver 096_avaliacoes.sql). Mesmo
// padrão de app/api/cozinha/pedidos/avaliar/route.ts: só aceita se já
// concluído, unique(interesse_id) impede avaliar 2x.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const estrelas = parseInt(body.estrelas, 10);
    const comentario = body.comentario ? String(body.comentario).trim() : null;

    if (!Number.isFinite(estrelas) || estrelas < 1 || estrelas > 5) {
      return NextResponse.json({ success: false, error: 'Estrelas deve ser um número entre 1 e 5' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: interesse } = await supabase.from('interesses').select('*').eq('id', params.id).maybeSingle();
    if (!interesse) return NextResponse.json({ success: false, error: 'Interesse não encontrado' }, { status: 404 });
    if (!interesse.concluido_em) {
      return NextResponse.json({ success: false, error: 'Esse interesse ainda não foi concluído pelo lojista' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('catalogo_avaliacoes')
      .insert({
        interesse_id: interesse.id,
        item_id: interesse.item_id,
        fornecedor_id: interesse.fornecedor_id,
        comprador_id: interesse.comprador_id,
        estrelas,
        comentario,
      })
      .select('*')
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        return NextResponse.json({ success: false, error: 'Você já avaliou esse atendimento' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro ao salvar avaliação da vitrine:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar avaliação' }, { status: 500 });
  }
}
