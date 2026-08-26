// Caminho: C:\valente_conecta\app\api\agua-gas\cron\lembretes-taxa\route.ts
//
// Disparado diariamente pelo Vercel Cron (ver vercel.json). Reforça, todo
// dia, o push de quem ficou devendo a taxa de uso de um pedido expresso de
// Agua e Gas pago em dinheiro (ver lib/aguaGas/taxaUso.ts) -- ao contrário
// do lembrete único do Moto Táxi, aqui o pedido do dono do produto foi
// explícito: "a plataforma ficará com esses usuários devedores em
// observação e emitirá push regulares para cobrança". No máximo um
// lembrete por taxa por dia (lembrete_enviado_em).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const supabase = createClient();
    const hojeStr = new Date().toISOString().slice(0, 10);

    const { data: taxas, error } = await supabase
      .from('agua_gas_taxas_uso')
      .select('id, papel, usuario_id, valor, lembrete_enviado_em')
      .eq('status', 'pendente')
      .not('usuario_id', 'is', null);
    if (error) throw error;

    let lembretesEnviados = 0;

    for (const taxa of taxas || []) {
      if (taxa.lembrete_enviado_em === hojeStr) continue;

      const quemE = taxa.papel === 'cliente' ? 'desse pedido de água/gás' : 'desse pedido de água/gás como fornecedor';
      try {
        await enviarPushParaUsuario(taxa.usuario_id as string, {
          titulo: 'Lembrete — taxa de uso pendente (Água e Gás)',
          corpo: `Ainda falta pagar R$ ${Number(taxa.valor).toFixed(2)} da taxa de uso do app ${quemE}. Com um plano pago essa taxa não é cobrada.`,
          url: `/agua-gas/taxas?destaque=${taxa.id}`,
        });
        lembretesEnviados += 1;
      } catch {
        // segue sem quebrar o loop
      }

      await supabase.from('agua_gas_taxas_uso').update({ lembrete_enviado_em: hojeStr }).eq('id', taxa.id);
    }

    return NextResponse.json({ success: true, taxasVerificadas: (taxas || []).length, lembretesEnviados });
  } catch (error: any) {
    console.error('Erro no cron de lembretes de taxa de Água e Gás:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno.' }, { status: 500 });
  }
}
