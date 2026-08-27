// Caminho: C:\valente_conecta\app\api\admin-master\pdv\importacao-fotos\route.ts
//
// Moderação manual das fotos que lojistas enviaram pra substituir o
// placeholder de itens publicados via importação de planilha (só existe
// fila aqui quando admin_configuracoes['pdv_importacao_moderacao_fotos']
// está com auto=false — ver app/api/pdv/importar-estoque/pendentes/[id]/foto).
//
// NOTA DE SEGURANCA: mesmo padrao do resto do admin-master hoje (login nao
// implementado) — protegido so' pelo cookie do middleware quando MODO_DEV
// for desligado.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sincronizarFotoNoCatalogoColaborativo } from '@/lib/pdv/catalogoColaborativoService';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('catalogo_itens')
    .select('id, titulo, midia, metadata, dono_id, created_at')
    .not('metadata->foto_pendente_aprovacao', 'is', null)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = String(body.id || '').trim();
    const aprovar = Boolean(body.aprovar);
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { data: item, error: erroItem } = await supabase.from('catalogo_itens').select('midia, metadata').eq('id', id).maybeSingle();
    if (erroItem) throw erroItem;
    if (!item) return NextResponse.json({ success: false, error: 'Item não encontrado' }, { status: 404 });

    const pendente = item.metadata?.foto_pendente_aprovacao;
    if (!pendente) return NextResponse.json({ success: false, error: 'Este item não tem foto pendente' }, { status: 400 });

    const { foto_pendente_aprovacao, ...restoMetadata } = item.metadata;

    const patch = aprovar
      ? {
          midia: [{ tipo: 'imagem', url: pendente.url, thumb_url: pendente.thumb_url, ordem: 0 }, ...(item.midia || []).slice(1)],
          metadata: { ...restoMetadata, foto_ficticia: false },
        }
      : { metadata: restoMetadata };

    const { error } = await supabase
      .from('catalogo_itens')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;

    if (aprovar) await sincronizarFotoNoCatalogoColaborativo(item.metadata?.pdv_estoque_id, pendente.url);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao moderar foto de importação:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao moderar foto' }, { status: 500 });
  }
}
