// Caminho: C:\valente_conecta\app\api\pdv\vendas\route.ts
//
// Finaliza uma venda da frente de caixa (app/pdv/page.tsx). Chama a RPC
// pdv_registrar_venda_v1 (067_pdv_vendas.sql) que cria a venda + os itens +
// desconta o estoque numa transação só. Se a forma de pagamento for fiado,
// cria a dívida reaproveitando lib/fiado.ts (mesma checagem de limite +
// push já usada em /api/fiado/dividas). Espelha a venda como uma entrada
// no Livro Caixa (pdv_caixa_lancamentos) — sem isso ele ficaria incompleto
// assim que a frente de caixa passasse a ser usada de verdade.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verificarLimiteFiado, inserirDividaFiado } from '@/lib/fiado';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

interface ItemVenda {
  catalogoId: string | null;
  estoqueId: string | null;
  nome: string;
  precoUnitario: number;
  quantidade: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    const itens: ItemVenda[] = Array.isArray(body.itens) ? body.itens : [];
    const formaPagamento = String(body.formaPagamento || '').trim();
    const desconto = Number(body.desconto || 0);
    const clienteId = body.clienteId || null;

    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });
    if (!itens.length) return NextResponse.json({ success: false, error: 'Carrinho vazio' }, { status: 400 });
    if (!['dinheiro', 'pix', 'cartao', 'fiado'].includes(formaPagamento)) {
      return NextResponse.json({ success: false, error: 'formaPagamento inválida' }, { status: 400 });
    }
    if (formaPagamento === 'fiado' && !clienteId) {
      return NextResponse.json({ success: false, error: 'Selecione um cliente para venda fiado' }, { status: 400 });
    }

    const subtotal = itens.reduce((soma, i) => soma + i.precoUnitario * i.quantidade, 0);
    const total = subtotal - desconto;
    const valorPago = formaPagamento === 'dinheiro' ? Number(body.valorPago || total) : total;

    // Fiado precisa ser checado ANTES de registrar a venda -- se checasse
    // so' depois de chamar a RPC (que ja' cria a venda e desconta o
    // estoque), uma recusa por limite deixaria uma venda "orfa" no banco,
    // com estoque baixado e nenhum pagamento registrado. Achado testando.
    if (formaPagamento === 'fiado') {
      const verificacao = await verificarLimiteFiado(clienteId, total, Boolean(body.forcarLimiteFiado));
      if (!verificacao.ok) {
        return NextResponse.json({
          success: false,
          error: 'limite_excedido',
          limiteExcedido: true,
          saldoAtual: verificacao.saldoAtual,
          limite: verificacao.limite,
        }, { status: 409 });
      }
    }

    const supabase = createClient();

    const { data: vendaId, error: erroRpc } = await supabase.rpc('pdv_registrar_venda_v1', {
      p_usuario_id: usuarioId,
      p_cliente_id: clienteId,
      p_itens: itens.map((i) => ({
        catalogo_id: i.catalogoId,
        estoque_id: i.estoqueId,
        nome: i.nome,
        preco_unitario: i.precoUnitario,
        quantidade: i.quantidade,
      })),
      p_desconto: desconto,
      p_forma_pagamento: formaPagamento,
      p_valor_pago: valorPago,
    });
    if (erroRpc) throw erroRpc;

    if (formaPagamento === 'fiado') {
      // Limite ja' foi checado acima, antes de registrar a venda -- aqui e'
      // so' inserir a divida mesmo (venda ja' existe e o estoque ja' foi
      // descontado, nao tem mais como voltar atras nem faz sentido recusar).
      const vencimento = body.fiadoVencimento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      await inserirDividaFiado({
        donoId: usuarioId,
        clienteId,
        valorTotal: total,
        dataVencimento: vencimento,
        itens: itens.map((i) => ({ nome: i.nome, quantidade: i.quantidade, precoUnitario: i.precoUnitario })),
        observacoes: `Venda #${String(vendaId).slice(0, 8)}`,
      });
    }

    await supabase.from('pdv_caixa_lancamentos').insert({
      usuario_id: usuarioId,
      tipo: 'entrada',
      descricao: `Venda — ${itens.length} ite${itens.length === 1 ? 'm' : 'ns'}`,
      valor: total,
      categoria: 'venda',
      forma_pagamento: formaPagamento,
    });

    return NextResponse.json({ success: true, data: { vendaId, subtotal, total, troco: formaPagamento === 'dinheiro' ? Math.max(0, valorPago - total) : 0 } });
  } catch (error: any) {
    console.error('Erro ao registrar venda:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao finalizar venda' }, { status: 500 });
  }
}
