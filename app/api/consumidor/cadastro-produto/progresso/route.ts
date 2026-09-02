// Caminho: C:\valente_conecta\app\api\consumidor\cadastro-produto\progresso\route.ts
//
// Progresso do consumidor rumo ao ciclo de bonus, por categoria (ver
// consumidor_cadastro_ciclo_config em 093_cadastro_consumidor_produto.sql).
// So' considera categorias que o admin master ja ativou. Consumido pelo
// bloco novo em app/extrato/page.tsx.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();

  const { data: configs, error: erroConfig } = await supabase
    .from('consumidor_cadastro_ciclo_config')
    .select('categoria, meta, bonus')
    .eq('ativo', true);
  if (erroConfig) return NextResponse.json({ success: false, error: erroConfig.message }, { status: 500 });
  if (!configs?.length) return NextResponse.json({ success: true, data: [] });

  const { data: aprovados, error: erroAprovados } = await supabase
    .from('consumidor_cadastros_produto')
    .select('categoria')
    .eq('usuario_id', usuarioId)
    .eq('status', 'aprovado');
  if (erroAprovados) return NextResponse.json({ success: false, error: erroAprovados.message }, { status: 500 });

  const contagemPorCategoria = new Map<string, number>();
  for (const item of aprovados || []) {
    contagemPorCategoria.set(item.categoria, (contagemPorCategoria.get(item.categoria) || 0) + 1);
  }

  const data = configs.map((cfg: any) => {
    const aprovadosNaCategoria = contagemPorCategoria.get(cfg.categoria) || 0;
    const noCiclo = aprovadosNaCategoria % cfg.meta;
    return {
      categoria: cfg.categoria,
      aprovados: aprovadosNaCategoria,
      meta: cfg.meta,
      bonus: Number(cfg.bonus),
      noCicloAtual: noCiclo,
      faltam: cfg.meta - noCiclo,
    };
  });

  return NextResponse.json({ success: true, data });
}
