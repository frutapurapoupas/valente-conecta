// Caminho: C:\valente_conecta\app\api\upload\route.ts
//
// Upload genérico de imagem de produto pro Supabase Storage (bucket
// 'catalogo', mesmo usado por app/api/upload/catalogo/route.ts — ver
// 010_storage_catalogo.sql). Antes gravava em disco local
// (public/uploads/produtos/), que não persiste em runtime serverless
// (Vercel): a escrita falhava sempre em produção (filesystem read-only
// fora de /tmp).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Nenhuma imagem enviada' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Arquivo não é uma imagem' }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Imagem muito grande (max 2MB)' }, { status: 400 });
    }

    const extension = file.type.split('/')[1] || 'jpg';
    const safeName = name?.replace(/[^a-zA-Z0-9]/g, '-') || 'produto';
    const caminho = `produtos/${Date.now()}-${safeName}.${extension}`;

    const supabase = createClient();
    const { error } = await supabase.storage
      .from('catalogo')
      .upload(caminho, file, { contentType: file.type, upsert: false });
    if (error) throw error;

    const url = supabase.storage.from('catalogo').getPublicUrl(caminho).data.publicUrl;

    return NextResponse.json({
      success: true,
      url,
      message: 'Imagem enviada com sucesso'
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ success: false, error: 'Erro ao salvar imagem' }, { status: 500 });
  }
}

