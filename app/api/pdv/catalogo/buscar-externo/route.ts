// Caminho: C:\valente_conecta\app\api\pdv\catalogo\buscar-externo\route.ts
//
// Extensão do lookup por EAN pro cadastro manual de produto (app/pdv/estoque):
// primeiro tenta o catálogo colaborativo interno (grátis); se não achar,
// cai pra API Kodebar via lib/pdv/kodebarService.ts (paga acima da cota
// diária, só chama se KODEBAR_API_KEY estiver setada e a cota permitir).
// Deliberadamente NÃO usado no scanner da tela de venda nem na importação
// em lote — só aqui, pra não brigar pela mesma cota diária compartilhada
// com um gatilho de alta frequência (decisão registrada com o dono do
// produto: cadastro manual tem volume baixo e previsível por loja).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buscarFotoPorEan } from '@/lib/pdv/kodebarService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const ean = request.nextUrl.searchParams.get('ean');
  if (!ean) return NextResponse.json({ success: false, error: 'informe ean' }, { status: 400 });

  const supabase = createClient();

  const { data: existente } = await supabase.from('pdv_produtos_catalogo').select('*').eq('ean', ean).maybeSingle();
  if (existente) return NextResponse.json({ success: true, data: existente, origem: 'catalogo_interno' });

  const foto = await buscarFotoPorEan(ean);
  if (!foto) return NextResponse.json({ success: true, data: null });

  const { data: novo } = await supabase.from('pdv_produtos_catalogo').select('*').eq('ean', ean).maybeSingle();
  return NextResponse.json({ success: true, data: novo, origem: foto.origem });
}
