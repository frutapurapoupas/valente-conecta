// Caminho: C:\valente_conecta\app\api\lojistas\buscar\route.ts
//
// Busca lojistas de comercio por nome -- usado no passo "onde voce comprou
// esse produto?" do quiz de cadastro colaborativo do consumidor (ver
// 093_cadastro_consumidor_produto.sql). So' considera perfis com
// categoria_negocio dentro dos ids de comercio (mesma lista SERVICOS_FISCO
// ja usada em app/admin-master/usuarios/assinaturas-planos/page.tsx).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const CATEGORIAS_COMERCIO = ['mercearia_pequena', 'mercado_grande', 'lojas', 'alimentacao', 'hotel_pousada'];

export async function GET(request: NextRequest) {
  const nome = (request.nextUrl.searchParams.get('nome') || '').trim();
  if (nome.length < 2) return NextResponse.json({ success: true, data: [] });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('perfis_fornecedor')
    .select('usuario_id, nome_exibicao, categoria_negocio')
    .in('categoria_negocio', CATEGORIAS_COMERCIO)
    .ilike('nome_exibicao', `%${nome}%`)
    .limit(15);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const usuarioIds = (data || []).map((f: any) => f.usuario_id);
  const { data: usuarios } = usuarioIds.length
    ? await supabase.from('usuarios').select('id, cidade_base').in('id', usuarioIds)
    : { data: [] };
  const mapaCidades = new Map((usuarios || []).map((u: any) => [u.id, u.cidade_base]));

  const resultado = (data || []).map((f: any) => ({
    usuarioId: f.usuario_id,
    nomeExibicao: f.nome_exibicao,
    cidade: mapaCidades.get(f.usuario_id) || null,
  }));

  return NextResponse.json({ success: true, data: resultado });
}
