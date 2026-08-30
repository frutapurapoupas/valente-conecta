// Caminho: C:\valente_conecta\app\api\entrega-avulsa\config\route.ts
//
// Taxa fixa de entrega avulsa (088_entrega_avulsa.sql, admin_configuracoes
// chave 'entrega_avulsa_config') -- mesmo padrao de leitura/escrita de
// app/api/cozinha/descontos/route.ts.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const CHAVE = 'entrega_avulsa_config';
const defaultConfig = { taxaEntregaPadrao: 5 };

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
    const config = { taxaEntregaPadrao: Number(body.taxaEntregaPadrao ?? defaultConfig.taxaEntregaPadrao) };

    const supabase = createClient();
    const { error } = await supabase
      .from('admin_configuracoes')
      .upsert(
        { chave: CHAVE, valor: JSON.stringify(config), descricao: 'Taxa fixa de entrega avulsa cobrada do cliente (R$)' },
        { onConflict: 'chave' }
      );
    if (error) throw error;

    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
