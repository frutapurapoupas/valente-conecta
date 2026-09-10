// Caminho: C:\valente_conecta\app\api\saude-fila\[unidadeId]\config\route.ts
//
// Configuracao da unidade (ver 108_fila_saude_prontuario.sql,
// unidade_saude_config) -- por enquanto so' a comissao sobre pagamento em
// dinheiro. So' o diretor (nivel 'administrar') pode mudar.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { nivelDoUsuarioNaUnidade } from '@/lib/saude/nivelAcesso';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  const supabase = createAdminClient();
  const { data } = await supabase.from('unidade_saude_config').select('*').eq('unidade_id', params.unidadeId).maybeSingle();
  const { data: unidade } = await supabase.from('unidades_saude').select('mp_conectado_em').eq('id', params.unidadeId).maybeSingle();
  return NextResponse.json({
    success: true,
    data: data || { unidade_id: params.unidadeId, comissao_pagamento_dinheiro_pct: 0, retencao_prontuario: 'permanente' },
    mpConectado: Boolean(unidade?.mp_conectado_em),
  });
}

export async function PATCH(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

    const supabase = createAdminClient();
    const nivel = await nivelDoUsuarioNaUnidade(supabase, params.unidadeId, usuarioId);
    if (nivel !== 'administrar') return NextResponse.json({ success: false, error: 'Só o diretor pode alterar essa configuração.' }, { status: 403 });

    const patch: Record<string, any> = { unidade_id: params.unidadeId, updated_at: new Date().toISOString() };
    if (body.comissaoPct !== undefined) patch.comissao_pagamento_dinheiro_pct = Number(body.comissaoPct) || 0;
    if (body.retencaoProntuario !== undefined) patch.retencao_prontuario = body.retencaoProntuario === 'x_anos' ? 'x_anos' : 'permanente';
    if (body.anosRetencao !== undefined) patch.anos_retencao = Number(body.anosRetencao) || null;

    const { data, error } = await supabase.from('unidade_saude_config').upsert(patch, { onConflict: 'unidade_id' }).select('*').single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
