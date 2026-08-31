// Caminho: C:\valente_conecta\app\api\pdv\relatorios\route.ts
//
// Agrega pdv_vendas/pdv_vendas_itens (venda real da frente de caixa, ver
// 067_pdv_vendas.sql) num relatorio pro comerciante -- sem RPC nova, so'
// leitura do que ja e' salvo em pdv_registrar_venda_v1. Periodo default =
// ultimos 30 dias; sempre calcula tambem o periodo anterior de mesmo
// tamanho pra mostrar variacao percentual.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// created_at vem do banco em UTC -- converte pro fuso de Valente
// (America/Bahia, UTC-3) antes de agrupar por dia, senao uma venda feita
// depois das 21h vira do "dia seguinte" no grafico.
function formatarDiaLocal(iso: string) {
  const data = new Date(iso);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bahia' }).format(data); // sv-SE = formato YYYY-MM-DD
}

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const agora = new Date();
  const fimParam = request.nextUrl.searchParams.get('fim');
  const inicioParam = request.nextUrl.searchParams.get('inicio');

  // Datas vem do client so' como "YYYY-MM-DD" (sem hora) -- monta os
  // limites direto em UTC (T00:00:00.000Z / T23:59:59.999Z) em vez de usar
  // setHours(), que muta no fuso LOCAL do servidor (America/Sao_Paulo,
  // UTC-3) e cortava vendas do proprio dia que aconteceram depois das 21h
  // local (23:59:59 local == 02:59:59 UTC do dia seguinte).
  const fim = fimParam ? new Date(`${fimParam}T00:00:00.000Z`) : agora;
  const inicio = inicioParam ? new Date(`${inicioParam}T00:00:00.000Z`) : new Date(fim.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fimInclusive = fimParam ? new Date(`${fimParam}T23:59:59.999Z`) : fim;

  const duracaoMs = fimInclusive.getTime() - inicio.getTime();
  const inicioAnterior = new Date(inicio.getTime() - duracaoMs);
  const fimAnterior = new Date(inicio.getTime() - 1);

  const supabase = createClient();

  const [{ data: vendasAtual, error: errAtual }, { data: vendasAnterior, error: errAnterior }] = await Promise.all([
    supabase
      .from('pdv_vendas')
      .select('id, subtotal, desconto, total, forma_pagamento, created_at')
      .eq('usuario_id', usuarioId)
      .gte('created_at', inicio.toISOString())
      .lte('created_at', fimInclusive.toISOString())
      .order('created_at', { ascending: true }),
    supabase
      .from('pdv_vendas')
      .select('total')
      .eq('usuario_id', usuarioId)
      .gte('created_at', inicioAnterior.toISOString())
      .lte('created_at', fimAnterior.toISOString()),
  ]);
  if (errAtual || errAnterior) {
    return NextResponse.json({ success: false, error: (errAtual || errAnterior)!.message }, { status: 500 });
  }

  const vendas = vendasAtual || [];
  const vendaIds = vendas.map((v) => v.id);

  const { data: itens, error: errItens } = vendaIds.length
    ? await supabase.from('pdv_vendas_itens').select('venda_id, nome, preco_unitario, quantidade, subtotal').in('venda_id', vendaIds)
    : { data: [], error: null };
  if (errItens) return NextResponse.json({ success: false, error: errItens.message }, { status: 500 });

  const faturamentoTotal = vendas.reduce((soma, v) => soma + Number(v.total), 0);
  const numeroVendas = vendas.length;
  const ticketMedio = numeroVendas > 0 ? faturamentoTotal / numeroVendas : 0;

  const faturamentoAnterior = (vendasAnterior || []).reduce((soma, v) => soma + Number(v.total), 0);
  const variacaoPercentual = faturamentoAnterior > 0 ? ((faturamentoTotal - faturamentoAnterior) / faturamentoAnterior) * 100 : null;

  const porFormaPagamento: Record<string, { total: number; quantidade: number }> = {};
  for (const v of vendas) {
    const chave = v.forma_pagamento;
    if (!porFormaPagamento[chave]) porFormaPagamento[chave] = { total: 0, quantidade: 0 };
    porFormaPagamento[chave].total += Number(v.total);
    porFormaPagamento[chave].quantidade += 1;
  }

  const porDia: Record<string, number> = {};
  for (const v of vendas) {
    const dia = formatarDiaLocal(v.created_at);
    porDia[dia] = (porDia[dia] || 0) + Number(v.total);
  }
  const serieDiaria = Object.entries(porDia).map(([dia, total]) => ({ dia, total })).sort((a, b) => a.dia.localeCompare(b.dia));

  const porProduto: Record<string, { nome: string; valor: number; quantidade: number }> = {};
  for (const item of itens || []) {
    const chave = item.nome;
    if (!porProduto[chave]) porProduto[chave] = { nome: item.nome, valor: 0, quantidade: 0 };
    porProduto[chave].valor += Number(item.subtotal);
    porProduto[chave].quantidade += Number(item.quantidade);
  }
  const produtos = Object.values(porProduto);
  const maisVendidosPorValor = [...produtos].sort((a, b) => b.valor - a.valor).slice(0, 10);
  const maisVendidosPorQuantidade = [...produtos].sort((a, b) => b.quantidade - a.quantidade).slice(0, 10);

  return NextResponse.json({
    success: true,
    data: {
      periodo: { inicio: inicio.toISOString(), fim: fimInclusive.toISOString() },
      faturamentoTotal,
      numeroVendas,
      ticketMedio,
      variacaoPercentual,
      porFormaPagamento,
      serieDiaria,
      maisVendidosPorValor,
      maisVendidosPorQuantidade,
    },
  });
}
