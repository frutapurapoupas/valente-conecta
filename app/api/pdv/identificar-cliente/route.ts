// Caminho: C:\valente_conecta\app\api\pdv\identificar-cliente\route.ts
//
// Le o codigo do Cartao Valente (MC-{usuarioId}|{CIDADE}, mesmo formato
// escaneado hoje em /carteira "Pagar" -- ver app/api/moeda-conecta/
// transferir/route.ts) e devolve os dados publicos do usuario + o fiado
// que ELE TEM COM ESSE LOJISTA especificamente (fiado_clientes.dono_id),
// nunca com outra loja -- mantem a mesma regra de privacidade que ja
// existe hoje no PDV de fiado.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

function parseCodigo(codigo: string) {
  const raw = String(codigo || '').trim();
  const normalizado = raw.replace(/^MC-/, '');
  const [usuarioId] = normalizado.split('|');
  return (usuarioId || '').trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get('codigo');
  const donoId = searchParams.get('donoId');
  if (!codigo || !donoId) {
    return NextResponse.json({ success: false, error: 'codigo e donoId são obrigatórios' }, { status: 400 });
  }

  const usuarioId = parseCodigo(codigo);
  if (!usuarioId) {
    return NextResponse.json({ success: false, error: 'Código inválido' }, { status: 400 });
  }

  const supabase = createClient();

  const { data: usuario, error: erroUsuario } = await supabase
    .from('usuarios')
    .select('id, nome, whatsapp, foto_url')
    .eq('id', usuarioId)
    .maybeSingle();
  if (erroUsuario) return NextResponse.json({ success: false, error: erroUsuario.message }, { status: 500 });
  if (!usuario) return NextResponse.json({ success: false, error: 'Cliente não encontrado' }, { status: 404 });

  const { data: clienteFiado } = await supabase
    .from('fiado_clientes')
    .select('id, limite_credito')
    .eq('dono_id', donoId)
    .eq('cliente_usuario_id', usuarioId)
    .maybeSingle();

  let fiado: { clienteId: string; limiteCredito: number; saldoDevedor: number } | null = null;
  if (clienteFiado) {
    const { data: dividas } = await supabase
      .from('fiado_dividas')
      .select('valor_total, valor_pago, status')
      .eq('cliente_id', clienteFiado.id)
      .neq('status', 'pago');
    const saldoDevedor = (dividas || []).reduce((soma, d) => soma + (Number(d.valor_total) - Number(d.valor_pago)), 0);
    fiado = { clienteId: clienteFiado.id, limiteCredito: Number(clienteFiado.limite_credito), saldoDevedor };
  }

  return NextResponse.json({ success: true, usuario, fiado });
}
