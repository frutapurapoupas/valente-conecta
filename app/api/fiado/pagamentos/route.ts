// Caminho: C:\valente_conecta\app\api\fiado\pagamentos\route.ts
// Registra um pagamento (total ou parcial) contra um débito de fiado.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.dividaId || !body.valor) {
      return NextResponse.json({ success: false, error: 'dividaId e valor são obrigatórios' }, { status: 400 });
    }
    const supabase = createClient();

    const { data: divida, error: erroDivida } = await supabase.from('fiado_dividas').select('*').eq('id', body.dividaId).single();
    if (erroDivida) throw erroDivida;

    const valorPago = Number(divida.valor_pago) + Number(body.valor);
    const saldoDevedor = Number(divida.valor_total) - valorPago;
    if (Number(body.valor) > Number(divida.valor_total) - Number(divida.valor_pago) + 0.01) {
      return NextResponse.json({ success: false, error: 'Valor excede o saldo devedor' }, { status: 400 });
    }
    const novoStatus = saldoDevedor <= 0.01 ? 'pago' : 'parcial';

    const { error: erroPagamento } = await supabase.from('fiado_pagamentos').insert({
      divida_id: body.dividaId,
      valor: Number(body.valor),
      metodo: body.metodo || 'dinheiro',
    });
    if (erroPagamento) throw erroPagamento;

    const { data: dividaAtualizada, error: erroUpdate } = await supabase
      .from('fiado_dividas')
      .update({ valor_pago: valorPago, status: novoStatus, updated_at: new Date().toISOString() })
      .eq('id', body.dividaId)
      .select('*')
      .single();
    if (erroUpdate) throw erroUpdate;

    return NextResponse.json({ success: true, data: dividaAtualizada });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao registrar pagamento' }, { status: 500 });
  }
}
