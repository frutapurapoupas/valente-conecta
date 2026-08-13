// Caminho: C:\valente_conecta\app\api\moeda-conecta\saldo\route.ts
//
// Saldo real (autoritativo) do usuario na Moeda Conecta. Nunca recalculado
// no navegador — vem direto de moeda_conecta_contas.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('moeda_conecta_contas')
    .select('saldo, cidade_base, atualizado_em')
    .eq('usuario_id', usuarioId)
    .maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || { saldo: 0, cidade_base: null, atualizado_em: null } });
}
