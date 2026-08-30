// Caminho: C:\valente_conecta\app\api\pdv\catalogo-moderacao\reenviar\route.ts
//
// Fornecedor reenvia uma foto de comprovante nova pro MESMO produto depois
// de uma recusa do admin master (086_catalogo_colaborativo_bonus_moderacao.sql
// — pdv_catalogo_colaborativo_moderacao tem uma linha unica por produto,
// entao reenvio REABRE a mesma linha pra 'pendente' em vez de criar outra).
// So' atualiza a foto do comprovante — o produto ja esta publicado desde o
// cadastro original, isso nao mexe em estoque/vitrine.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const moderacaoId = String(body.moderacaoId || '').trim();
    const donoId = String(body.donoId || '').trim();
    const fotoCodigoBarrasPath = String(body.fotoCodigoBarrasPath || '').trim();

    if (!moderacaoId || !donoId || !fotoCodigoBarrasPath) {
      return NextResponse.json({ success: false, error: 'moderacaoId, donoId e fotoCodigoBarrasPath são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: item } = await supabase
      .from('pdv_catalogo_colaborativo_moderacao')
      .select('id, usuario_id, status, produto_catalogo_id')
      .eq('id', moderacaoId)
      .maybeSingle();

    if (!item) return NextResponse.json({ success: false, error: 'Item não encontrado' }, { status: 404 });
    if (item.usuario_id !== donoId) return NextResponse.json({ success: false, error: 'Esse item não é seu' }, { status: 403 });
    if (item.status !== 'recusado') return NextResponse.json({ success: false, error: 'Só é possível reenviar um item recusado' }, { status: 409 });

    const { error } = await supabase
      .from('pdv_catalogo_colaborativo_moderacao')
      .update({ status: 'pendente', motivo_recusa: null, aprovado_por: null, processado_em: null, foto_codigo_barras_path: fotoCodigoBarrasPath, updated_at: new Date().toISOString() })
      .eq('id', moderacaoId);
    if (error) throw error;

    await supabase
      .from('pdv_produtos_catalogo')
      .update({ foto_codigo_barras_path: fotoCodigoBarrasPath, updated_at: new Date().toISOString() })
      .eq('id', item.produto_catalogo_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao reenviar comprovante do catálogo colaborativo:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao reenviar foto' }, { status: 500 });
  }
}
