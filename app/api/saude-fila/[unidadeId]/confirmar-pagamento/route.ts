// Caminho: C:\valente_conecta\app\api\saude-fila\[unidadeId]\confirmar-pagamento\route.ts
//
// Atendente confirma que recebeu o pagamento em dinheiro (ver proposta
// "Modo Valente Facil", item 5). Repasse de comissao pra plataforma (se o
// admin master configurar uma em unidade_saude_config) fica pra uma
// proxima rodada -- aqui so' registra que o dinheiro foi recebido.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { nivelDoUsuarioNaUnidade, podeAtender } from '@/lib/saude/nivelAcesso';
import { avisarPagamentoConfirmado } from '@/lib/saude/avisos';

export async function POST(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  try {
    const body = await request.json();
    const senhaId = String(body.senhaId || '').trim();
    const usuarioId = String(body.usuarioId || '').trim();
    if (!senhaId || !usuarioId) return NextResponse.json({ success: false, error: 'senhaId e usuarioId são obrigatórios' }, { status: 400 });

    const supabase = createAdminClient();
    const nivel = await nivelDoUsuarioNaUnidade(supabase, params.unidadeId, usuarioId);
    if (!podeAtender(nivel)) return NextResponse.json({ success: false, error: 'Sem permissão pra confirmar pagamento nessa unidade.' }, { status: 403 });

    const { data, error } = await supabase
      .from('fila_saude_senhas')
      .update({ status_pagamento: 'pago' })
      .eq('id', senhaId)
      .eq('unidade_id', params.unidadeId)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: 'Senha não encontrada' }, { status: 404 });

    await avisarPagamentoConfirmado(data.usuario_id, params.unidadeId, data.id);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
