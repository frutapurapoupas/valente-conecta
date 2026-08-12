// Caminho: C:\valente_conecta\app\api\chat\route.ts
//
// Chat do usuario final com o suporte (admin master). usuarioId e' o id
// anonimo por dispositivo (obterUsuarioLocalId, lib/usuarioLocal.ts).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('mensagens_chat')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  // usuario acabou de abrir a conversa: marca as mensagens do admin como lidas
  await supabase
    .from('mensagens_chat')
    .update({ lida: true })
    .eq('usuario_id', usuarioId)
    .eq('remetente', 'admin')
    .eq('lida', false);

  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.usuarioId || !body.texto?.trim()) {
      return NextResponse.json({ success: false, error: 'usuarioId e texto são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('mensagens_chat')
      .insert({ usuario_id: body.usuarioId, remetente: 'usuario', texto: body.texto.trim().slice(0, 1000) })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
