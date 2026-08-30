// Caminho: C:\valente_conecta\app\api\upload\comprovante-catalogo\route.ts
//
// Upload da foto do codigo de barras (comprovante de EAN/SKU novo no
// catalogo colaborativo do PDV) para o bucket PRIVADO catalogo-comprovantes
// (086_catalogo_colaborativo_bonus_moderacao.sql). Diferente de
// /api/upload/catalogo (bucket publico "catalogo", usado pra foto do
// produto em si), aqui usa createAdminClient() porque o bucket nao tem
// nenhuma policy de insert pra chave anon -- so' service role escreve.
// Nunca devolve URL publica (nao existe pra esse bucket), so' o path.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const arquivo = formData.get('arquivo') as File | null;
    const donoId = String(formData.get('donoId') || '').trim();
    if (!arquivo) {
      return NextResponse.json({ success: false, error: 'Arquivo ausente' }, { status: 400 });
    }
    if (!donoId) {
      return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const caminho = `${donoId}/${crypto.randomUUID()}.webp`;

    const { error } = await supabase.storage
      .from('catalogo-comprovantes')
      .upload(caminho, arquivo, { contentType: 'image/webp', upsert: false });
    if (error) throw error;

    return NextResponse.json({ success: true, path: caminho });
  } catch (error) {
    console.error('Erro ao subir comprovante do catálogo colaborativo:', error);
    return NextResponse.json({ success: false, error: 'Erro ao enviar imagem' }, { status: 500 });
  }
}
