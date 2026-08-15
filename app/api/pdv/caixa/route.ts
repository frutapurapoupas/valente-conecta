// Caminho: C:\valente_conecta\app\api\pdv\caixa\route.ts
//
// Livro caixa do comerciante (PDV Colaborativo) — lancamentos manuais de
// entrada/saida, escopados por usuario_id (ver migration
// 044_pdv_caixa.sql). GET aceita dataInicio/dataFim (padrao: hoje) e ja
// devolve os totais do periodo pra nao recalcular no cliente.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const hoje = new Date().toISOString().slice(0, 10);
  const dataInicio = request.nextUrl.searchParams.get('dataInicio') || hoje;
  const dataFim = request.nextUrl.searchParams.get('dataFim') || hoje;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('pdv_caixa_lancamentos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const lancamentos = data || [];
  const entradas = lancamentos.filter((l) => l.tipo === 'entrada').reduce((soma, l) => soma + Number(l.valor), 0);
  const saidas = lancamentos.filter((l) => l.tipo === 'saida').reduce((soma, l) => soma + Number(l.valor), 0);

  return NextResponse.json({
    success: true,
    data: { lancamentos, totais: { entradas, saidas, saldo: entradas - saidas } },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.usuarioId || !body.tipo || !body.descricao || !body.valor) {
      return NextResponse.json({ success: false, error: 'usuarioId, tipo, descricao e valor são obrigatórios' }, { status: 400 });
    }
    if (!['entrada', 'saida'].includes(body.tipo)) {
      return NextResponse.json({ success: false, error: 'tipo inválido' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('pdv_caixa_lancamentos')
      .insert({
        usuario_id: body.usuarioId,
        tipo: body.tipo,
        descricao: body.descricao,
        valor: Number(body.valor),
        categoria: body.categoria || null,
        forma_pagamento: body.formaPagamento || 'dinheiro',
        data: body.data || new Date().toISOString().slice(0, 10),
        observacoes: body.observacoes || null,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao lançar no caixa' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { error } = await supabase.from('pdv_caixa_lancamentos').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
