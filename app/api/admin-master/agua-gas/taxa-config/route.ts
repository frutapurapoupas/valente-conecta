// Caminho: C:\valente_conecta\app\api\admin-master\agua-gas\taxa-config\route.ts
//
// Taxa de uso da plataforma no pedido expresso de Agua e Gas (% cobrado de
// cliente e fornecedor quando o pagamento e' combinado em dinheiro, cada um
// isento se tiver plano pago). Mesmo padrao key-value ja usado em
// app/api/admin-master/mototaxi/taxa-config/route.ts.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const CHAVE = 'agua_gas_taxa_config';
const defaultConfig = { taxaPercentualCliente: 1, taxaPercentualFornecedor: 1, updatedAt: new Date().toISOString() };

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const config = data?.valor ? JSON.parse(data.valor) : defaultConfig;
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const taxaPercentualCliente = Number(body.taxaPercentualCliente);
    const taxaPercentualFornecedor = Number(body.taxaPercentualFornecedor);
    if (
      !Number.isFinite(taxaPercentualCliente) || taxaPercentualCliente < 0 || taxaPercentualCliente > 100 ||
      !Number.isFinite(taxaPercentualFornecedor) || taxaPercentualFornecedor < 0 || taxaPercentualFornecedor > 100
    ) {
      return NextResponse.json({ success: false, error: 'Taxas inválidas — use um percentual entre 0 e 100' }, { status: 400 });
    }

    const supabase = createClient();
    const next = { taxaPercentualCliente, taxaPercentualFornecedor, updatedAt: new Date().toISOString() };

    const { data: atual } = await supabase.from('admin_configuracoes').select('id').eq('chave', CHAVE).maybeSingle();
    if (atual) {
      const { error } = await supabase.from('admin_configuracoes').update({ valor: JSON.stringify(next) }).eq('id', atual.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('admin_configuracoes')
        .insert({ chave: CHAVE, valor: JSON.stringify(next), descricao: 'Taxa de uso da plataforma no pedido expresso de Água e Gás (cliente e fornecedor, isentos com plano pago)' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, data: next });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
