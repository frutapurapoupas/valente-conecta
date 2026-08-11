// Caminho: C:\valente_conecta\app\api\fiado\cron\lembretes\route.ts
//
// Disparado diariamente pelo Vercel Cron (ver vercel.json). Avisa por push
// o cliente que tem fiado vencendo em 3 dias, em 1 dia, e no dia do
// vencimento — e marca como 'vencido' quem passou da data sem pagar.
// No maximo um lembrete por divida por dia (lembrete_enviado_em).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

const DIAS_DE_AVISO = [3, 1, 0];

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const supabase = createClient();
    const hoje = new Date();
    const hojeStr = hoje.toISOString().slice(0, 10);

    const { data: dividas, error } = await supabase
      .from('fiado_dividas')
      .select('*, fiado_clientes(nome, cliente_usuario_id)')
      .in('status', ['pendente', 'parcial']);
    if (error) throw error;

    let lembretesEnviados = 0;
    let marcadosVencidos = 0;

    for (const divida of dividas || []) {
      const vencimento = new Date(divida.data_vencimento + 'T00:00:00');
      const diffDias = Math.round((vencimento.getTime() - new Date(hojeStr + 'T00:00:00').getTime()) / 86400000);

      if (diffDias < 0) {
        await supabase.from('fiado_dividas').update({ status: 'vencido' }).eq('id', divida.id);
        marcadosVencidos += 1;
        continue;
      }

      const jaAvisadoHoje = divida.lembrete_enviado_em === hojeStr;
      const cliente = (divida as any).fiado_clientes;
      if (!jaAvisadoHoje && DIAS_DE_AVISO.includes(diffDias) && cliente?.cliente_usuario_id) {
        const saldo = Number(divida.valor_total) - Number(divida.valor_pago);
        const mensagem =
          diffDias === 0
            ? `Vence hoje: saldo de R$ ${saldo.toFixed(2)} no fiado.`
            : `Vence em ${diffDias} dia${diffDias > 1 ? 's' : ''}: saldo de R$ ${saldo.toFixed(2)} no fiado.`;

        try {
          await enviarPushParaUsuario(cliente.cliente_usuario_id, {
            titulo: 'Lembrete de pagamento — Valente Conecta',
            corpo: mensagem,
            url: '/pdv/fiado',
          });
          lembretesEnviados += 1;
        } catch {
          // segue sem quebrar o loop
        }

        await supabase.from('fiado_dividas').update({ lembrete_enviado_em: hojeStr }).eq('id', divida.id);
      }
    }

    return NextResponse.json({ success: true, dividasVerificadas: (dividas || []).length, lembretesEnviados, marcadosVencidos });
  } catch (error: any) {
    console.error('Erro no cron de lembretes de fiado:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno.' }, { status: 500 });
  }
}
