// Caminho: C:\valente_conecta\app\api\moeda-conecta\compensacao-fornecedor\route.ts
//
// Portador do credito solicita compensacao em real pra um fornecedor que
// ainda nao e' usuario do app (comprou usando Moeda Conecta informalmente,
// fornecedor aceitou a negociacao). RPC ja debita o saldo do portador na
// hora (reserva o valor) — ver 036_bonus_indicacao_e_compensacao.sql.
// GET lista as solicitacoes do portador (extrato pessoal dele).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const portadorId = request.nextUrl.searchParams.get('portadorId');
  if (!portadorId) return NextResponse.json({ success: false, error: 'portadorId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('compensacoes_fornecedor')
    .select('*')
    .eq('portador_id', portadorId)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const portadorId = String(body.portadorId || '').trim();
    const fornecedorNome = String(body.fornecedorNome || '').trim();
    const fornecedorWhatsapp = String(body.fornecedorWhatsapp || '').trim();
    const valor = Number(body.valor);
    const descricao = String(body.descricao || '').trim();

    if (!portadorId) return NextResponse.json({ success: false, error: 'portadorId é obrigatório' }, { status: 400 });
    if (!fornecedorNome) return NextResponse.json({ success: false, error: 'Nome do fornecedor é obrigatório' }, { status: 400 });
    if (!Number.isFinite(valor) || valor <= 0) return NextResponse.json({ success: false, error: 'Valor inválido' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase.rpc('moeda_conecta_solicitar_compensacao_v1', {
      p_portador_id: portadorId,
      p_fornecedor_nome: fornecedorNome,
      p_fornecedor_whatsapp: fornecedorWhatsapp || null,
      p_valor: valor,
      p_descricao: descricao || null,
    });
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao solicitar compensação' }, { status: 400 });
  }
}
