// Caminho: C:\valente_conecta\app\api\mototaxi\taxas\route.ts
//
// Lista as taxas de uso do Moto Taxi (ver lib/mototaxi/taxaUso.ts) de um
// usuario -- pendentes primeiro, pra tela de "taxas em aberto".

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('mototaxi_taxas_uso')
    .select('id, corrida_id, papel, valor, status, created_at, mototaxi_corridas(origem, destino, created_at)')
    .eq('usuario_id', usuarioId)
    .neq('status', 'isento')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}
