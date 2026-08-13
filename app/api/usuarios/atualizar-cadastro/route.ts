// Caminho: C:\valente_conecta\app\api\usuarios\atualizar-cadastro\route.ts
//
// Usuario completa/edita os proprios dados (email, pix, bairro, cidade) via
// RPC atualizar_meu_cadastro (ver 013_indicacoes_rls_e_campanhas.sql) — as
// policies de UPDATE em usuarios exigem auth.uid() = id, que nao existe
// ainda (sem login real), entao a escrita direta do client falharia.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase.rpc('atualizar_meu_cadastro', {
      p_usuario_id: usuarioId,
      p_email: body.email ?? null,
      p_pix_key: body.pixKey ?? null,
      p_bairro: body.bairro ?? null,
      p_cidade: body.cidade ?? null,
      p_whatsapp_confirmado: body.whatsappConfirmado ?? null,
    });
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar cadastro' }, { status: 400 });
  }
}
