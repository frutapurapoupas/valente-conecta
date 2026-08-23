// Caminho: C:\valente_conecta\app\api\pdv\importar-estoque\pendentes\route.ts
//
// Lista, pro próprio lojista, os itens que a importação de planilha
// publicou com foto placeholder (metadata.foto_ficticia=true) — tela
// /pdv/importar-estoque/pendentes usa isso pra pedir a foto real de cada um.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const donoId = request.nextUrl.searchParams.get('donoId');
  if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('catalogo_itens')
    .select('id, titulo, preco, midia, metadata, created_at')
    .eq('dono_id', donoId)
    .eq('metadata->>foto_ficticia', 'true')
    .neq('status', 'removido')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}
