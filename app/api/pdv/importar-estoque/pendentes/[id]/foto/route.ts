// Caminho: C:\valente_conecta\app\api\pdv\importar-estoque\pendentes\[id]\foto\route.ts
//
// Lojista sobe a foto real de um item que foi publicado com placeholder na
// importação de planilha (o upload em si passa pelo MidiaUploader/
// /api/upload/catalogo existente, aqui só recebemos a url já pronta).
// Conforme admin_configuracoes['pdv_importacao_moderacao_fotos'] (mesmo
// padrão chave/valor de config-carrossel), a foto nova:
//   - auto=true  → substitui a placeholder na hora, item já sai da lista de pendentes.
//   - auto=false (padrão) → fica em metadata.foto_pendente_aprovacao até o
//     admin master aprovar em /admin-master/pdv/importacao-fotos.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CHAVE_CONFIG = 'pdv_importacao_moderacao_fotos';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const donoId = String(body.donoId || '').trim();
    const url = String(body.url || '').trim();
    const thumbUrl = String(body.thumb_url || url).trim();
    if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });
    if (!url) return NextResponse.json({ success: false, error: 'url é obrigatória' }, { status: 400 });

    const supabase = createClient();

    const { data: item, error: erroItem } = await supabase
      .from('catalogo_itens')
      .select('id, midia, metadata, dono_id')
      .eq('id', params.id)
      .eq('dono_id', donoId)
      .maybeSingle();
    if (erroItem) throw erroItem;
    if (!item) return NextResponse.json({ success: false, error: 'Item não encontrado' }, { status: 404 });

    const { data: configRow } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE_CONFIG).maybeSingle();
    const auto = configRow?.valor ? Boolean(JSON.parse(configRow.valor).auto) : false;

    const metadataAtual = item.metadata || {};

    if (auto) {
      const midiaNova = [{ tipo: 'imagem', url, thumb_url: thumbUrl, ordem: 0 }, ...(item.midia || []).slice(1)];
      const { foto_ficticia, foto_pendente_aprovacao, ...restoMetadata } = metadataAtual;
      const { error } = await supabase
        .from('catalogo_itens')
        .update({ midia: midiaNova, metadata: { ...restoMetadata, foto_ficticia: false }, updated_at: new Date().toISOString() })
        .eq('id', params.id);
      if (error) throw error;
      return NextResponse.json({ success: true, aplicadoDireto: true });
    }

    const { error } = await supabase
      .from('catalogo_itens')
      .update({
        metadata: { ...metadataAtual, foto_pendente_aprovacao: { url, thumb_url: thumbUrl, enviado_em: new Date().toISOString() } },
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);
    if (error) throw error;

    return NextResponse.json({ success: true, aplicadoDireto: false });
  } catch (error: any) {
    console.error('Erro ao atualizar foto pendente:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar foto' }, { status: 500 });
  }
}
