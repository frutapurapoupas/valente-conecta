// Caminho: C:\valente_conecta\app\api\upload\recipe\route.ts
//
// Sobe a imagem de uma receita da Cozinha pro Supabase Storage (bucket
// "catalogo", mesmo usado por app/api/upload/catalogo/route.ts — ver
// 010_storage_catalogo.sql). Antes gravava em disco local
// (public/uploads/recipes/), que não persiste em runtime serverless
// (Vercel): a escrita falhava sempre em produção (filesystem read-only
// fora de /tmp) — o próprio comentário da migration 010 já avisava disso.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const recipeId = formData.get('recipeId') as string;
    if (!file) {
      return NextResponse.json({ success: false, error: 'Imagem ausente' }, { status: 400 });
    }
    if (!recipeId) {
      return NextResponse.json({ success: false, error: 'recipeId ausente' }, { status: 400 });
    }

    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'jpg';
    const caminho = `receitas/${recipeId}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('catalogo')
      .upload(caminho, file, { contentType: file.type || 'image/jpeg', upsert: true });
    if (error) throw error;

    const imageUrl = supabase.storage.from('catalogo').getPublicUrl(caminho).data.publicUrl;

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Erro ao subir imagem da receita:', error);
    return NextResponse.json({ success: false, error: 'Erro ao fazer upload' }, { status: 500 });
  }
}
