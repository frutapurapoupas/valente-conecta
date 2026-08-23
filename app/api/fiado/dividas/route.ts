// Caminho: C:\valente_conecta\app\api\fiado\dividas\route.ts
//
// Lançar um débito de fiado. Antes de criar, checa se o saldo em aberto do
// cliente + a compra nova estoura o limite de crédito (fiado_clientes.limite_credito)
// — bloqueia com 409 a menos que o lojista mande forcarLimite=true (ele
// conhece o cliente, o sistema só avisa). Ao criar, dispara push pro
// cliente (se ele tiver usuario+inscrição de push resolvidos) com o valor
// da compra e o saldo total em aberto — pedido explícito do usuário do projeto.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { criarDividaFiado } from '@/lib/fiado';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const donoId = searchParams.get('donoId');
  const clienteId = searchParams.get('clienteId');
  if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  let query = supabase.from('fiado_dividas').select('*, fiado_clientes(nome, telefone)').eq('dono_id', donoId).order('created_at', { ascending: false });
  if (clienteId) query = query.eq('cliente_id', clienteId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.donoId || !body.clienteId || !body.valorTotal || !body.dataVencimento) {
      return NextResponse.json({ success: false, error: 'donoId, clienteId, valorTotal e dataVencimento são obrigatórios' }, { status: 400 });
    }

    const resultado = await criarDividaFiado({
      donoId: body.donoId,
      clienteId: body.clienteId,
      valorTotal: Number(body.valorTotal),
      dataVencimento: body.dataVencimento,
      itens: body.itens,
      observacoes: body.observacoes,
      lojaNome: body.lojaNome,
      forcarLimite: body.forcarLimite,
    });

    if (!resultado.ok) {
      return NextResponse.json({
        success: false,
        error: 'limite_excedido',
        limiteExcedido: true,
        saldoAtual: resultado.saldoAtual,
        limite: resultado.limite,
      }, { status: 409 });
    }

    return NextResponse.json({ success: true, data: { ...resultado.divida, saldoTotalCliente: resultado.saldoTotalCliente } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao lançar débito' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) patch.status = body.status;
    if (body.observacoes !== undefined) patch.observacoes = body.observacoes;

    const supabase = createClient();
    const { data, error } = await supabase.from('fiado_dividas').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar débito' }, { status: 500 });
  }
}
