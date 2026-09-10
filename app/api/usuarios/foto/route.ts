// Caminho: C:\valente_conecta\app\api\usuarios\foto\route.ts
//
// Atualiza a foto de perfil do proprio usuario (usuarios.foto_url, ver
// 104_cartao_valente_foto_usuario.sql). O upload em si passa pelo endpoint
// generico /api/upload/catalogo (mesmo bucket usado por todo o catalogo) --
// aqui so' gravamos a URL resultante.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    const fotoUrl = String(body.fotoUrl || '').trim();
    if (!usuarioId || !fotoUrl) {
      return NextResponse.json({ success: false, error: 'usuarioId e fotoUrl são obrigatórios' }, { status: 400 });
    }

    // usuarios tem RLS restrito em UPDATE pela chave anon (ver comentario
    // em lib/supabase/server.ts) -- precisa da service role aqui.
    const supabase = createAdminClient();
    const { error } = await supabase.from('usuarios').update({ foto_url: fotoUrl }).eq('id', usuarioId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao atualizar foto do usuário:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
