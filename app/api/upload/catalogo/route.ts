// Caminho: C:\valente_conecta\app\api\upload\catalogo\route.ts
//
// Recebe as duas versoes ja comprimidas no client (MidiaUploader.tsx +
// utils/comprimirImagem.ts) e sobe para o bucket Supabase Storage
// "catalogo" (ver 010_storage_catalogo.sql). Usado por todos os modulos
// verticais do catalogo — nao ha um endpoint de upload por modulo.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const arquivo = formData.get('arquivo') as File | null;
    const thumb = formData.get('thumb') as File | null;
    if (!arquivo) {
      return NextResponse.json({ success: false, error: 'Arquivo principal ausente' }, { status: 400 });
    }

    const supabase = createClient();
    const pasta = crypto.randomUUID();

    const caminhoPrincipal = `${pasta}/principal.webp`;
    const { error: erroPrincipal } = await supabase.storage
      .from('catalogo')
      .upload(caminhoPrincipal, arquivo, { contentType: 'image/webp', upsert: false });
    if (erroPrincipal) throw erroPrincipal;

    let thumbUrl: string | undefined;
    if (thumb) {
      const caminhoThumb = `${pasta}/thumb.webp`;
      const { error: erroThumb } = await supabase.storage
        .from('catalogo')
        .upload(caminhoThumb, thumb, { contentType: 'image/webp', upsert: false });
      if (!erroThumb) {
        thumbUrl = supabase.storage.from('catalogo').getPublicUrl(caminhoThumb).data.publicUrl;
      }
    }

    const url = supabase.storage.from('catalogo').getPublicUrl(caminhoPrincipal).data.publicUrl;

    return NextResponse.json({ success: true, url, thumb_url: thumbUrl || url });
  } catch (error) {
    console.error('Erro ao subir mídia do catálogo:', error);
    return NextResponse.json({ success: false, error: 'Erro ao enviar imagem' }, { status: 500 });
  }
}
