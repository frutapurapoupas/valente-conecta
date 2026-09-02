// Caminho: C:\valente_conecta\app\api\pdv\interesses\route.ts
//
// Lista os interesses recebidos por um lojista na vitrine pública
// (catalogo_itens + interesses, ver 003_marketplace_interesse.sql), com
// nome do item e do comprador já resolvidos — usado em /pdv/interesses
// pro lojista marcar "concluído" e liberar a avaliação do comprador (ver
// 096_avaliacoes.sql). Rota própria em vez de reaproveitar
// GET /api/catalogo/interesses direto porque aquela devolve os campos
// crus (sem nome de item/comprador), que a tela precisa exibir.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data: interesses, error } = await supabase
    .from('interesses')
    .select('*')
    .eq('fornecedor_id', usuarioId)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const itemIds = Array.from(new Set((interesses || []).map((i: any) => i.item_id)));
  const compradorIds = Array.from(new Set((interesses || []).map((i: any) => i.comprador_id)));

  const [{ data: itens }, { data: compradores }] = await Promise.all([
    itemIds.length ? supabase.from('catalogo_itens').select('id, titulo').in('id', itemIds) : Promise.resolve({ data: [] as any[] }),
    compradorIds.length ? supabase.from('usuarios').select('id, nome').in('id', compradorIds) : Promise.resolve({ data: [] as any[] }),
  ]);
  const mapaItens = new Map((itens || []).map((i: any) => [i.id, i.titulo]));
  const mapaCompradores = new Map((compradores || []).map((c: any) => [c.id, c.nome]));

  const data = (interesses || []).map((i: any) => ({
    ...i,
    item_titulo: mapaItens.get(i.item_id) || 'Item removido',
    comprador_nome: mapaCompradores.get(i.comprador_id) || 'Comprador',
  }));

  return NextResponse.json({ success: true, data });
}
