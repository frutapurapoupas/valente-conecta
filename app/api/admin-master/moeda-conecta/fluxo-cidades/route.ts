// Caminho: C:\valente_conecta\app\api\admin-master\moeda-conecta\fluxo-cidades\route.ts
//
// Fluxo liquido de Moeda Conecta entre cidades diferentes — ajuda o admin
// master a enxergar se alguma cidade esta perdendo capital pra outra
// (transacoes concluidas onde cidade != cidade_destino). Transacoes
// pendentes de moderacao aparecem separadas, ja que ainda nao afetaram
// saldo nenhum de fato.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createClient();
    const { data: transacoes, error } = await supabase
      .from('moeda_conecta_transacoes')
      .select('cidade, cidade_destino, valor, status')
      .neq('cidade', 'cidade_destino');
    if (error) throw error;

    const fluxoMapa = new Map<string, { origem: string; destino: string; total: number; quantidade: number }>();
    let pendentes = 0;
    let pendentesValor = 0;

    for (const t of transacoes || []) {
      if (t.cidade === t.cidade_destino) continue;
      if (t.status === 'pendente_moderacao') {
        pendentes++;
        pendentesValor += Number(t.valor);
        continue;
      }
      if (t.status !== 'concluida') continue;

      const chave = `${t.cidade}→${t.cidade_destino}`;
      const atual = fluxoMapa.get(chave) || { origem: t.cidade, destino: t.cidade_destino, total: 0, quantidade: 0 };
      atual.total += Number(t.valor);
      atual.quantidade += 1;
      fluxoMapa.set(chave, atual);
    }

    const fluxo = Array.from(fluxoMapa.values()).sort((a, b) => b.total - a.total);

    return NextResponse.json({ success: true, data: { fluxo, pendentesModeracao: pendentes, pendentesModeracaoValor: pendentesValor } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao calcular fluxo entre cidades' }, { status: 500 });
  }
}
