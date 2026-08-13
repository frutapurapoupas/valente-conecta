// Caminho: C:\valente_conecta\app\api\moeda-conecta\transferir\route.ts
//
// Transferencia real de Moeda Conecta, via RPC atomica (ver
// 031_moeda_conecta_real.sql). Aceita o codigo "MC-<usuarioId>|<CIDADE>"
// (gerado em /carteira, "Receber") como destino, ou destinatarioId direto.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function parseCodigo(codigo: string) {
  const raw = String(codigo || '').trim();
  const normalizado = raw.replace(/^MC-/, '');
  const [usuarioId, cidade] = normalizado.split('|');
  return { usuarioId: (usuarioId || '').trim(), cidade: (cidade || '').trim().toUpperCase() };
}

const MENSAGENS_ERRO: Record<string, string> = {
  'Saldo insuficiente': 'Saldo insuficiente para essa transferência',
  'Remetente e destinatario nao podem ser o mesmo usuario': 'Você não pode transferir para si mesmo',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const remetenteId = String(body.remetenteId || '').trim();
    const valor = Number(body.valor);
    const descricao = String(body.descricao || '').trim() || 'Transferência Moeda Conecta';
    const tipo = ['transferencia', 'pagamento_comercio', 'recarga'].includes(body.tipo) ? body.tipo : 'transferencia';

    if (!remetenteId) return NextResponse.json({ success: false, error: 'remetenteId é obrigatório' }, { status: 400 });
    if (!Number.isFinite(valor) || valor <= 0) return NextResponse.json({ success: false, error: 'Valor inválido' }, { status: 400 });

    let destinatarioId = String(body.destinatarioId || '').trim();
    let cidade = String(body.cidade || '').trim().toUpperCase();
    if (!destinatarioId && body.destinatarioCodigo) {
      const parsed = parseCodigo(body.destinatarioCodigo);
      destinatarioId = parsed.usuarioId;
      if (!cidade) cidade = parsed.cidade;
    }
    if (!destinatarioId) return NextResponse.json({ success: false, error: 'Código de destino inválido' }, { status: 400 });

    const supabase = createClient();
    if (!cidade) {
      const { data: remetente } = await supabase.from('usuarios').select('cidade_base').eq('id', remetenteId).maybeSingle();
      cidade = String(remetente?.cidade_base || '').trim().toUpperCase();
    }
    if (!cidade) return NextResponse.json({ success: false, error: 'Não foi possível determinar sua cidade' }, { status: 400 });

    const { data, error } = await supabase.rpc('moeda_conecta_transferir_v2', {
      p_remetente_id: remetenteId,
      p_destinatario_id: destinatarioId,
      p_cidade: cidade,
      p_valor: valor,
      p_tipo: tipo,
      p_descricao: descricao,
    });
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    const mensagem = MENSAGENS_ERRO[error.message] || error.message || 'Erro ao processar transferência';
    return NextResponse.json({ success: false, error: mensagem }, { status: 400 });
  }
}
