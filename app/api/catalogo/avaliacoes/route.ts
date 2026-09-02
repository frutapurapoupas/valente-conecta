// Caminho: C:\valente_conecta\app\api\catalogo\avaliacoes\route.ts
//
// Nota média agregada de um fornecedor (loja/serviço), a partir de
// catalogo_avaliacoes (ver 096_avaliacoes.sql) -- consumida em
// components/catalogo/NotaFornecedor.tsx pra exibir no item público.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const fornecedorId = request.nextUrl.searchParams.get('fornecedorId');
  if (!fornecedorId) return NextResponse.json({ success: false, error: 'fornecedorId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.from('catalogo_avaliacoes').select('estrelas').eq('fornecedor_id', fornecedorId);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const total = data?.length || 0;
  const media = total > 0 ? data!.reduce((soma, a: any) => soma + a.estrelas, 0) / total : 0;

  return NextResponse.json({ success: true, data: { media, total } });
}
