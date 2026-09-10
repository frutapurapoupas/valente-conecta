// Caminho: C:\valente_conecta\app\api\saude-fila\[unidadeId]\repasse\route.ts
//
// Repasse da comissao sobre pagamentos em dinheiro pra plataforma (ver
// unidade_saude_config.comissao_pagamento_dinheiro_pct). Nao ha' gateway
// de pagamento real ligado nisso -- e' so' o registro de "a unidade
// confirmou que já mandou" (mesmo espirito das outras conciliacoes
// manuais que ja existem no projeto, ex: "Comprei com fornecedor
// não-usuário" na carteira). So' o diretor pode ver/confirmar.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { nivelDoUsuarioNaUnidade } from '@/lib/saude/nivelAcesso';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createAdminClient();
  const nivel = await nivelDoUsuarioNaUnidade(supabase, params.unidadeId, usuarioId);
  if (nivel !== 'administrar') return NextResponse.json({ success: false, error: 'Só o diretor pode ver o repasse.' }, { status: 403 });

  const { data: config } = await supabase.from('unidade_saude_config').select('comissao_pagamento_dinheiro_pct').eq('unidade_id', params.unidadeId).maybeSingle();
  const pct = Number(config?.comissao_pagamento_dinheiro_pct || 0);

  // So' pagamento em DINHEIRO entra aqui -- pagamento online ja' teve a
  // comissao descontada automaticamente na hora via marketplace_fee (ver
  // app/api/saude-fila/entrar/route.ts), contar de novo seria cobrar
  // duas vezes.
  const { data: pendentes } = await supabase
    .from('fila_saude_senhas')
    .select('id, numero, valor_pagamento, created_at')
    .eq('unidade_id', params.unidadeId)
    .eq('status_pagamento', 'pago')
    .eq('forma_pagamento', 'dinheiro')
    .order('created_at', { ascending: true });

  const totalRecebido = (pendentes || []).reduce((s, p) => s + Number(p.valor_pagamento || 0), 0);
  const comissaoDevida = totalRecebido * (pct / 100);

  return NextResponse.json({ success: true, data: { pendentes: pendentes || [], pct, totalRecebido, comissaoDevida } });
}

export async function POST(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

    const supabase = createAdminClient();
    const nivel = await nivelDoUsuarioNaUnidade(supabase, params.unidadeId, usuarioId);
    if (nivel !== 'administrar') return NextResponse.json({ success: false, error: 'Só o diretor pode confirmar o repasse.' }, { status: 403 });

    const { data, error } = await supabase
      .from('fila_saude_senhas')
      .update({ status_pagamento: 'repassado' })
      .eq('unidade_id', params.unidadeId)
      .eq('status_pagamento', 'pago')
      .eq('forma_pagamento', 'dinheiro')
      .select('id');
    if (error) throw error;

    return NextResponse.json({ success: true, quantidade: data?.length || 0 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
