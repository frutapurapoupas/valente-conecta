// Caminho: C:\valente_conecta\app\api\pdv\catalogo\apelido\route.ts
//
// Associa um apelido regional/proprio do comerciante a um produto ja
// existente no catalogo colaborativo — alimenta a busca por similaridade
// (pdv_buscar_produto_similar_v1) pra funcionar melhor com o tempo.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const catalogoId = String(body.catalogoId || '').trim();
    const apelido = String(body.apelido || '').trim();
    const usuarioId = String(body.usuarioId || '').trim() || null;

    if (!catalogoId || !apelido) {
      return NextResponse.json({ success: false, error: 'catalogoId e apelido são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('pdv_produtos_apelidos')
      .upsert({ catalogo_id: catalogoId, apelido, usuario_id: usuarioId }, { onConflict: 'catalogo_id,apelido' })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar apelido' }, { status: 400 });
  }
}
