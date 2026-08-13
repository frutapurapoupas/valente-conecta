// Caminho: C:\valente_conecta\app\api\cdl\relatorio\route.ts
//
// Metricas agregadas da cidade do representante do CDL — nunca dado
// individual/financeiro por usuario, so' totais (ver 034_cdl.sql,
// cdl_relatorios_ativo). Confirma que a cidade realmente tem essa
// capacidade ligada antes de responder.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const representanteId = request.nextUrl.searchParams.get('representanteId');
  if (!representanteId) return NextResponse.json({ success: false, error: 'representanteId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data: rep } = await supabase.from('cdl_representantes').select('cidade, ativo').eq('id', representanteId).maybeSingle();
  if (!rep || !rep.ativo) return NextResponse.json({ success: false, error: 'Representante não encontrado' }, { status: 404 });

  const { data: config } = await supabase.from('cidades_moeda_config').select('cdl_relatorios_ativo, moeda_nome').eq('cidade', rep.cidade).maybeSingle();
  if (!config?.cdl_relatorios_ativo) {
    return NextResponse.json({ success: false, error: 'Relatórios agregados não estão liberados pra essa cidade' }, { status: 403 });
  }

  const [{ count: totalUsuarios }, { data: transacoes }, { data: fornecedores }] = await Promise.all([
    supabase.from('usuarios').select('id', { count: 'exact', head: true }).ilike('cidade_base', rep.cidade),
    supabase.from('moeda_conecta_transacoes').select('valor, status').eq('cidade', rep.cidade).eq('cidade_destino', rep.cidade),
    supabase.from('usuarios').select('id').ilike('cidade_base', rep.cidade),
  ]);

  const concluidas = (transacoes || []).filter((t: any) => t.status === 'concluida');
  const totalCirculando = concluidas.reduce((sum: number, t: any) => sum + Number(t.valor || 0), 0);

  const idsUsuariosCidade = (fornecedores || []).map((u: any) => u.id);
  const { count: totalComercios } = idsUsuariosCidade.length
    ? await supabase.from('perfis_fornecedor').select('id', { count: 'exact', head: true }).in('usuario_id', idsUsuariosCidade)
    : { count: 0 };

  return NextResponse.json({
    success: true,
    data: {
      cidade: rep.cidade,
      moedaNome: config.moeda_nome,
      totalUsuarios: totalUsuarios || 0,
      totalTransacoesConcluidas: concluidas.length,
      totalCirculando,
      totalComercios: totalComercios || 0,
    },
  });
}
