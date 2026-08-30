// Caminho: C:\valente_conecta\app\api\pdv\catalogo-moderacao\recusados\route.ts
//
// Lista, pro proprio fornecedor, os itens da fila de moderacao do catalogo
// colaborativo (086_catalogo_colaborativo_bonus_moderacao.sql) que foram
// RECUSADOS pelo admin master — pra ele ver o motivo e reenviar uma foto
// nova pro mesmo produto (ver /api/pdv/catalogo-moderacao/reenviar). O
// produto em si ja esta publicado normalmente desde o cadastro; recusa so'
// significa que o bonus em Moeda Conecta ainda nao foi liberado.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) {
    return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('pdv_catalogo_colaborativo_moderacao')
    .select('id, nome_produto, ean, sku, motivo_recusa, processado_em')
    .eq('usuario_id', usuarioId)
    .eq('status', 'recusado')
    .order('processado_em', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}
