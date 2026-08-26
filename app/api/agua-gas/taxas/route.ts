// Caminho: C:\valente_conecta\app\api\agua-gas\taxas\route.ts
//
// Lista as taxas de uso do pedido expresso de Agua e Gas (ver
// lib/aguaGas/taxaUso.ts) de um usuario -- pendentes primeiro, pra tela de
// "taxas em aberto". Mesmo padrao de app/api/mototaxi/taxas/route.ts.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('agua_gas_taxas_uso')
    .select('id, pedido_id, papel, valor, status, created_at, agua_gas_pedidos(produto, quantidade, fornecedor_nome, created_at)')
    .eq('usuario_id', usuarioId)
    .neq('status', 'isento')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}
