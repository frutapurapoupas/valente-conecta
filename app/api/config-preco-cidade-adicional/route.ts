// Caminho: C:\valente_conecta\app\api\config-preco-cidade-adicional\route.ts
//
// Preco da assinatura de cidade adicional, editavel pelo admin master —
// guardado em admin_configuracoes (chave='preco_cidade_adicional'), mesmo
// padrao de carrossel_home/cozinha_descontos.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const CHAVE = 'preco_cidade_adicional';
const DEFAULT_PRECO = 0;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const config = data?.valor ? JSON.parse(data.valor) : { preco: DEFAULT_PRECO };
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const preco = Math.max(0, Number(body.preco ?? DEFAULT_PRECO));

    const supabase = createClient();
    const { error } = await supabase
      .from('admin_configuracoes')
      .upsert(
        { chave: CHAVE, valor: JSON.stringify({ preco }), descricao: 'Preço (R$) da assinatura de cidade adicional' },
        { onConflict: 'chave' }
      );
    if (error) throw error;

    return NextResponse.json({ success: true, data: { preco } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
