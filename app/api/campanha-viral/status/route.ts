// Caminho: C:\valente_conecta\app\api\campanha-viral\status\route.ts
//
// Leitura publica do status da campanha de lancamento de uma cidade —
// usada por /qr-code pra saber se ainda vale mostrar o banner de acesso
// gratuito garantido. Cidade sem meta configurada nunca teve campanha
// (ativa=false, metaPopulacao=null). Ver 089_campanha_viral_populacao.sql.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const cidade = String(request.nextUrl.searchParams.get('cidade') || '').trim().toUpperCase();
  if (!cidade) return NextResponse.json({ success: false, error: 'cidade é obrigatória' }, { status: 400 });

  const supabase = createClient();
  const [{ data: campanha }, { count: populacaoAtual }] = await Promise.all([
    supabase.from('campanha_viral_cidades').select('meta_populacao').eq('cidade', cidade).maybeSingle(),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).ilike('cidade_base', cidade),
  ]);

  const metaPopulacao = campanha?.meta_populacao ?? null;
  const populacao = populacaoAtual || 0;
  const ativa = metaPopulacao != null && populacao < metaPopulacao;

  return NextResponse.json({ success: true, data: { cidade, ativa, metaPopulacao, populacaoAtual: populacao } });
}
