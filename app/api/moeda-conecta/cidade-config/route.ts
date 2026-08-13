// Caminho: C:\valente_conecta\app\api\moeda-conecta\cidade-config\route.ts
//
// Nome/prefixo da Moeda Conecta pra uma cidade. Se a cidade ainda nao tem
// configuracao salva, devolve uma sugestao automatica (nao aprovada) em
// vez de erro — quem usa a tela ve o nome sugerido ate o admin master
// aprovar de verdade.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sugerirMoedaCidade } from '@/lib/moedaCidade';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const cidade = String(request.nextUrl.searchParams.get('cidade') || '').trim().toUpperCase();
  if (!cidade) return NextResponse.json({ success: false, error: 'cidade é obrigatória' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.from('cidades_moeda_config').select('*').eq('cidade', cidade).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  if (data) return NextResponse.json({ success: true, data });

  const sugestao = sugerirMoedaCidade(cidade);
  return NextResponse.json({
    success: true,
    data: { cidade, moeda_nome: sugestao.moedaNome, moeda_prefixo: sugestao.moedaPrefixo, aprovado: false, sugestao: true },
  });
}
