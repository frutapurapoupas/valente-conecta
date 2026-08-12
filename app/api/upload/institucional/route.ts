// Caminho: C:\valente_conecta\app\api\upload\institucional\route.ts
//
// Upload de midia institucional do proprio app (video de lancamento etc)
// pro bucket 'institucional' (022_midia_institucional.sql). Sem compressao
// client-side como as imagens do catalogo — video vai direto.
//
// LIMITE CONHECIDO: a Vercel limita o corpo de requisicao de funcoes
// serverless a uns 4.5MB (Hobby/Pro), independente do que o bucket aceita.
// Video maior que isso precisaria de upload direto do navegador pro
// Supabase Storage (URL assinada) em vez de passar por essa rota — nao
// implementado ainda porque o video atual do lancamento (~2.6MB) cabe.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const arquivo = formData.get('arquivo') as File | null;
    if (!arquivo) {
      return NextResponse.json({ success: false, error: 'Arquivo ausente' }, { status: 400 });
    }

    const extensao = arquivo.name.split('.').pop() || 'mp4';
    const caminho = `lancamento/${crypto.randomUUID()}.${extensao}`;

    const supabase = createClient();
    const { error } = await supabase.storage
      .from('institucional')
      .upload(caminho, arquivo, { contentType: arquivo.type || 'video/mp4', upsert: false });
    if (error) throw error;

    const url = supabase.storage.from('institucional').getPublicUrl(caminho).data.publicUrl;
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Erro ao subir mídia institucional:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao enviar arquivo' }, { status: 500 });
  }
}
