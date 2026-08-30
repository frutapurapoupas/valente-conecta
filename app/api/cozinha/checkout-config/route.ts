// Caminho: C:\valente_conecta\app\api\cozinha\checkout-config\route.ts
//
// Formas de pagamento aceitas no checkout da Cozinha + forma de
// confirmacao sugerida ao cadastrar revendedor novo
// (087_cozinha_checkout_pedidos.sql, admin_configuracoes chave
// 'cozinha_checkout_config') -- mesmo padrao de leitura/escrita de
// app/api/cozinha/descontos/route.ts.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const CHAVE = 'cozinha_checkout_config';
const defaultConfig = {
  formasPagamentoAceitas: ['mercado_pago'],
  pixManualChave: '',
  pixManualNome: '',
  formaConfirmacaoRevendedorPadrao: 'aprovacao_manual',
};

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const config = data?.valor ? { ...defaultConfig, ...JSON.parse(data.valor) } : defaultConfig;
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const formasValidas = ['mercado_pago', 'pix_manual', 'combinado_admin'];
    const config = {
      formasPagamentoAceitas: Array.isArray(body.formasPagamentoAceitas)
        ? body.formasPagamentoAceitas.filter((f: string) => formasValidas.includes(f))
        : defaultConfig.formasPagamentoAceitas,
      pixManualChave: String(body.pixManualChave ?? '').trim(),
      pixManualNome: String(body.pixManualNome ?? '').trim(),
      formaConfirmacaoRevendedorPadrao: ['fiado_prazo', 'pagamento_entrega', 'aprovacao_manual'].includes(body.formaConfirmacaoRevendedorPadrao)
        ? body.formaConfirmacaoRevendedorPadrao
        : defaultConfig.formaConfirmacaoRevendedorPadrao,
    };

    const supabase = createClient();
    const { error } = await supabase
      .from('admin_configuracoes')
      .upsert(
        { chave: CHAVE, valor: JSON.stringify(config), descricao: 'Checkout Cozinha Chef Neide: formas de pagamento e confirmacao padrao de revendedor' },
        { onConflict: 'chave' }
      );
    if (error) throw error;

    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
