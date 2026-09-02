// Caminho: C:\valente_conecta\app\api\catalogo\interesses\[id]\concluir\route.ts
//
// Lojista marca um interesse como concluído (negócio fechado com o
// comprador) -- é o gatilho que libera a avaliação (ver
// 096_avaliacoes.sql). Dispara push pro comprador com link direto pra
// tela de avaliação, mesmo padrão do cron de pesquisa de satisfação da
// Cozinha (app/api/cozinha/cron/pesquisa-satisfacao/route.ts), só que
// disparado na hora — aqui "concluído" já é uma ação humana explícita do
// lojista, não precisa de job agendado detectando o momento certo.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const fornecedorId = String(body.fornecedorId || '').trim();
    if (!fornecedorId) return NextResponse.json({ success: false, error: 'fornecedorId é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { data: interesse } = await supabase.from('interesses').select('*').eq('id', params.id).maybeSingle();
    if (!interesse) return NextResponse.json({ success: false, error: 'Interesse não encontrado' }, { status: 404 });
    if (interesse.fornecedor_id !== fornecedorId) return NextResponse.json({ success: false, error: 'Esse interesse não é seu' }, { status: 403 });
    if (interesse.concluido_em) return NextResponse.json({ success: false, error: 'Esse interesse já foi marcado como concluído' }, { status: 409 });

    const { data, error } = await supabase
      .from('interesses')
      .update({ concluido_em: new Date().toISOString(), concluido_por: fornecedorId })
      .eq('id', params.id)
      .select('*')
      .single();
    if (error) throw error;

    await enviarPushParaUsuario(interesse.comprador_id, {
      titulo: 'Como foi sua experiência?',
      corpo: 'Avalie em poucos segundos e ajude outras pessoas da região.',
      url: `/catalogo/avaliar/${interesse.id}`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao concluir interesse' }, { status: 500 });
  }
}
