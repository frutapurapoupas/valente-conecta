// Caminho: C:\valente_conecta\app\api\admin-master\push-audiencia\route.ts
//
// Cidades que ja tem pelo menos uma inscricao de push com essa cidade
// preenchida — alimenta o seletor de cidade do aviso geral segmentado
// (app/admin-master/configuracoes/aviso-geral/page.tsx). Nao e' uma lista
// fixa: reflete de verdade quem esta inscrito.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('cidade')
    .not('cidade', 'is', null);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const cidades = Array.from(new Set((data || []).map((r: any) => r.cidade).filter(Boolean))).sort();
  return NextResponse.json({ success: true, data: cidades });
}
