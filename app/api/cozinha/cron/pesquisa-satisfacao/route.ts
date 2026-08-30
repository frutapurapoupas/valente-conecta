// Caminho: C:\valente_conecta\app\api\cozinha\cron\pesquisa-satisfacao\route.ts
//
// Dispara a pesquisa de satisfacao 1h depois do pedido ser entregue.
// Chamado pelo job pg_cron criado em 088_entrega_avulsa.sql (a cada
// 15min, direto do Postgres via pg_net) -- NAO pelo cron da Vercel, que no
// plano Hobby (atual, ate o lancamento) so' roda 1x/dia. Mesmo padrao de
// autenticacao/idempotencia de app/api/pdv/cron/lembrete-estoque/route.ts.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 });
  }

  const supabase = createClient();
  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: pedidos, error } = await supabase
    .from('cozinha_pedidos')
    .select('id, cliente_usuario_id, entregue_em')
    .eq('status', 'entregue')
    .is('pesquisa_satisfacao_enviada_em', null)
    .lte('entregue_em', umaHoraAtras);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  let enviados = 0;
  for (const pedido of pedidos || []) {
    try {
      if (pedido.cliente_usuario_id) {
        await enviarPushParaUsuario(pedido.cliente_usuario_id, {
          titulo: 'Como foi seu pedido?',
          corpo: 'Avalie em poucos segundos e ajude a Chef Neide a melhorar.',
          url: `/cozinha/pedido/${pedido.id}/avaliar`,
        });
        enviados += 1;
      }
    } finally {
      // Marca enviado mesmo sem cliente_usuario_id (sem push possivel) --
      // senao o job reprocessaria o mesmo pedido pra sempre a cada 15min.
      await supabase.from('cozinha_pedidos').update({ pesquisa_satisfacao_enviada_em: new Date().toISOString() }).eq('id', pedido.id);
    }
  }

  return NextResponse.json({ success: true, verificados: (pedidos || []).length, enviados });
}
