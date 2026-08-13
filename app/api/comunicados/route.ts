// Caminho: C:\valente_conecta\app\api\comunicados\route.ts
// Comunicados publicados, pra home page. Segmentacao (grupos/cidades) e'
// filtrada aqui no client (app/page.tsx) contra o push_subscriptions do
// visitante, pra nao precisar identificar ninguem pra so' ler a lista.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('comunicados')
    .select('id, titulo, mensagem, grupos, cidades, publicado_em, created_at')
    .eq('status', 'publicado')
    .order('publicado_em', { ascending: false })
    .limit(10);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || [] });
}
