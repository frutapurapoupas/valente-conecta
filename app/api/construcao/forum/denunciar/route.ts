// Caminho: C:\valente_conecta\app\api\construcao\forum\denunciar\route.ts
// Denúncia de um post do fórum (unique por post+denunciante — não deixa
// a mesma pessoa inflar a contagem denunciando várias vezes).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.postId || !body.denuncianteId) {
      return NextResponse.json({ success: false, error: 'postId e denuncianteId são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('construcao_forum_denuncias')
      .upsert(
        { post_id: body.postId, denunciante_id: body.denuncianteId, motivo: body.motivo || null },
        { onConflict: 'post_id,denunciante_id', ignoreDuplicates: true }
      );
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao denunciar' }, { status: 500 });
  }
}
