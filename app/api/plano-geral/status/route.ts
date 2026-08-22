// Caminho: C:\valente_conecta\app\api\plano-geral\status\route.ts
//
// Devolve o nivel atual do usuario e quanto ele ja usou de cada servico no
// periodo corrente — pra tela mostrar "você usou 3 de 5 esse mês" sem
// precisar consumir cota (so' leitura). Replica a mesma logica de validade
// da RPC (055_plano_geral.sql): assinatura paga vencida cai pro gratis.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const SERVICOS = ['carona_desbloqueio', 'fila_hospital', 'mototaxi', 'agua_gas', 'academia', 'busca_google'] as const;

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('plano_geral, plano_geral_valido_ate')
    .eq('id', usuarioId)
    .maybeSingle();

  let tier = usuario?.plano_geral || 'gratis';
  if (tier !== 'gratis' && usuario?.plano_geral_valido_ate && new Date(usuario.plano_geral_valido_ate) < new Date()) {
    tier = 'gratis';
  }

  const { data: limites } = await supabase.from('plano_geral_limites').select('*').eq('tier', tier);
  const limitesPorServico = new Map((limites || []).map((l: any) => [l.servico, l]));

  const hoje = new Date();
  const chaveMensal = hoje.toISOString().slice(0, 7);
  const chaveDiaria = hoje.toISOString().slice(0, 10);

  const { data: usos } = await supabase
    .from('plano_geral_uso')
    .select('servico, periodo_chave, contagem')
    .eq('usuario_id', usuarioId)
    .in('periodo_chave', [chaveMensal, chaveDiaria]);

  const usoPorServico = new Map((usos || []).map((u: any) => [`${u.servico}:${u.periodo_chave}`, u.contagem]));

  const servicos = SERVICOS.map((servico) => {
    const config = limitesPorServico.get(servico);
    const periodo = config?.periodo || (servico === 'busca_google' ? 'diario' : 'mensal');
    const chave = periodo === 'diario' ? chaveDiaria : chaveMensal;
    const limite = config?.limite ?? null;
    const usado = usoPorServico.get(`${servico}:${chave}`) || 0;
    return {
      servico,
      periodo,
      limite,
      usado,
      restante: limite === null ? null : Math.max(0, limite - usado),
    };
  });

  return NextResponse.json({ success: true, data: { tier, validoAte: usuario?.plano_geral_valido_ate || null, servicos } });
}
