// Caminho: C:\valente_conecta\app\api\saude-fila\[unidadeId]\minha-posicao\route.ts
//
// Posicao do proprio paciente na fila (quantas senhas de prioridade igual
// ou maior estao na frente). Sem "tempo estimado" -- nao ha' historico de
// tempo medio real pra calcular isso sem inventar numero.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  const { searchParams } = new URL(request.url);
  const senhaId = searchParams.get('senhaId');
  if (!senhaId) return NextResponse.json({ success: false, error: 'senhaId é obrigatório' }, { status: 400 });

  const supabase = createAdminClient();
  const { data: minhaSenha, error: erroSenha } = await supabase
    .from('fila_saude_senhas')
    .select('*')
    .eq('id', senhaId)
    .eq('unidade_id', params.unidadeId)
    .maybeSingle();
  if (erroSenha) return NextResponse.json({ success: false, error: erroSenha.message }, { status: 500 });
  if (!minhaSenha) return NextResponse.json({ success: false, error: 'Senha não encontrada' }, { status: 404 });

  const avisoReordenacao = Boolean(minhaSenha.aviso_reordenacao);
  if (avisoReordenacao) {
    await supabase.from('fila_saude_senhas').update({ aviso_reordenacao: false }).eq('id', senhaId);
  }

  if (minhaSenha.status === 'em_atendimento' || minhaSenha.status === 'concluido') {
    return NextResponse.json({ success: true, data: { senha: minhaSenha, pessoasNaFrente: 0, avisoReordenacao } });
  }

  const { count } = await supabase
    .from('fila_saude_senhas')
    .select('*', { count: 'exact', head: true })
    .eq('unidade_id', params.unidadeId)
    .in('status', ['aguardando', 'presente'])
    .lt('prioridade_tier', minhaSenha.prioridade_tier);

  const { count: mesmoTierAntes } = await supabase
    .from('fila_saude_senhas')
    .select('*', { count: 'exact', head: true })
    .eq('unidade_id', params.unidadeId)
    .in('status', ['aguardando', 'presente'])
    .eq('prioridade_tier', minhaSenha.prioridade_tier)
    .lt('created_at', minhaSenha.created_at);

  return NextResponse.json({
    success: true,
    data: { senha: minhaSenha, pessoasNaFrente: (count || 0) + (mesmoTierAntes || 0), avisoReordenacao },
  });
}
