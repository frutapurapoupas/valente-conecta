// Caminho: C:\valente_conecta\app\api\agua-gas\pedido-expresso\route.ts
//
// Fluxo rapido: cliente aperta Água ou Gás, escolhe um fornecedor numa
// lista curta (mais próximos, ver app/agua-gas/page.tsx), define a
// quantidade e confirma. Usa o preco padrao que o fornecedor cadastrou
// (preco_agua_padrao/preco_gas_padrao) -- nao o catalogo completo de
// produtos, que continua servindo o fluxo classico via WhatsApp.
//
// Pagamento ONLINE: split automatico via Mercado Pago, igual carona
// (ver 080_carona_split_pagamento.sql) -- exige que o fornecedor tenha
// conectado a propria conta. Pagamento em DINHEIRO: sem MP nenhum, o valor
// do produto e' acertado na entrega e a taxa de uso (1%+1%) vira divida
// rastreada (ver lib/aguaGas/taxaUso.ts).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calcularTaxaSplitPedido, calcularERegistrarTaxaPedidoExpresso } from '@/lib/aguaGas/taxaUso';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarioId, fornecedorId, categoria, formaPagamento } = body;
    if (!usuarioId || !fornecedorId || !['agua', 'gas'].includes(categoria) || !['online', 'dinheiro'].includes(formaPagamento)) {
      return NextResponse.json({ success: false, error: 'usuarioId, fornecedorId, categoria e formaPagamento são obrigatórios' }, { status: 400 });
    }
    const quantidade = Math.max(1, Number(body.quantidade) || 1);

    const supabase = createClient();

    const { data: usuario } = await supabase.from('usuarios').select('id, nome, whatsapp').eq('id', usuarioId).maybeSingle();
    if (!usuario) return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });

    const { data: fornecedor } = await supabase
      .from('agua_gas_fornecedores')
      .select('id, nome, telefone, dono_id, status, preco_agua_padrao, descricao_agua_padrao, preco_gas_padrao, descricao_gas_padrao, mp_access_token')
      .eq('id', fornecedorId)
      .maybeSingle();
    if (!fornecedor || fornecedor.status !== 'publicado') {
      return NextResponse.json({ success: false, error: 'Fornecedor não encontrado' }, { status: 404 });
    }

    const precoUnit = categoria === 'agua' ? Number(fornecedor.preco_agua_padrao || 0) : Number(fornecedor.preco_gas_padrao || 0);
    const descricaoItem = (categoria === 'agua' ? fornecedor.descricao_agua_padrao : fornecedor.descricao_gas_padrao) || (categoria === 'agua' ? 'Água' : 'Gás');
    if (precoUnit <= 0) {
      return NextResponse.json({ success: false, error: 'Esse fornecedor ainda não definiu o preço padrão desse item' }, { status: 400 });
    }
    const valorItem = Number((precoUnit * quantidade).toFixed(2));

    if (formaPagamento === 'dinheiro') {
      const { data: pedido, error: erroPedido } = await supabase
        .from('agua_gas_pedidos')
        .insert({
          fornecedor_id: fornecedorId,
          fornecedor_nome: fornecedor.nome,
          cliente_id: usuarioId,
          cliente_nome: usuario.nome,
          cliente_telefone: usuario.whatsapp || '',
          produto: descricaoItem,
          quantidade,
          valor_total: valorItem,
          forma_pagamento: 'Dinheiro',
          origem: 'expresso',
          categoria,
          pagamento_status: 'combinado_dinheiro',
        })
        .select('*')
        .single();
      if (erroPedido) throw erroPedido;

      await calcularERegistrarTaxaPedidoExpresso(pedido.id);

      return NextResponse.json({ success: true, data: pedido, checkoutUrl: null });
    }

    // formaPagamento === 'online'
    if (!fornecedor.mp_access_token) {
      return NextResponse.json({ success: false, error: 'Esse fornecedor ainda não conectou a conta Mercado Pago — escolha pagar em dinheiro.' }, { status: 400 });
    }

    const { taxaCliente, taxaFornecedor, marketplaceFee } = await calcularTaxaSplitPedido(valorItem, usuarioId, fornecedor.dono_id);
    const valorTotalCobrado = Number((valorItem + taxaCliente).toFixed(2));

    const { data: pedido, error: erroPedido } = await supabase
      .from('agua_gas_pedidos')
      .insert({
        fornecedor_id: fornecedorId,
        fornecedor_nome: fornecedor.nome,
        cliente_id: usuarioId,
        cliente_nome: usuario.nome,
        cliente_telefone: usuario.whatsapp || '',
        produto: descricaoItem,
        quantidade,
        valor_total: valorTotalCobrado,
        forma_pagamento: 'Mercado Pago',
        origem: 'expresso',
        categoria,
        pagamento_status: 'aguardando_pagamento',
      })
      .select('*')
      .single();
    if (erroPedido) throw erroPedido;

    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const origin = envUrl || request.headers.get('origin') || '';
    const notificationUrl = origin ? `${origin.replace(/\/$/, '')}/api/webhooks/mercadopago` : undefined;

    const preferencePayload = {
      external_reference: `agua_gas_pedido_${pedido.id}`,
      notification_url: notificationUrl,
      marketplace_fee: marketplaceFee,
      payer: { name: usuario.nome || 'Cliente' },
      items: [
        {
          id: pedido.id,
          title: `${descricaoItem} × ${quantidade} — ${fornecedor.nome}`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: valorTotalCobrado,
        },
      ],
      payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
      metadata: { pedidoId: pedido.id, origem: 'agua_gas_pedido_expresso' },
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      // Access token do PROPRIO fornecedor -- e' a conta dele que recebe o
      // pagamento, com o marketplace_fee descontado automaticamente pro
      // Valente Conecta.
      headers: { Authorization: `Bearer ${fornecedor.mp_access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(preferencePayload),
    });
    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      return NextResponse.json({ success: false, error: mpData?.message || 'Erro ao criar checkout no Mercado Pago' }, { status: 500 });
    }

    await supabase.from('agua_gas_pedidos').update({ mp_preference_id: mpData.id }).eq('id', pedido.id);

    return NextResponse.json({
      success: true,
      data: { ...pedido, mp_preference_id: mpData.id },
      checkoutUrl: mpData.init_point || mpData.sandbox_init_point || '',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao criar pedido' }, { status: 500 });
  }
}
