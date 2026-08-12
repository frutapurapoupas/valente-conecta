// Caminho: C:\valente_conecta\app\api\admin-master\chat\[usuarioId]\route.ts
//
// Uma conversa especifica, do lado do admin master: ler mensagens (marcando
// as do usuario como lidas) e responder (com push pro usuario avisando).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: { usuarioId: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('mensagens_chat')
    .select('*')
    .eq('usuario_id', params.usuarioId)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  await supabase
    .from('mensagens_chat')
    .update({ lida: true })
    .eq('usuario_id', params.usuarioId)
    .eq('remetente', 'usuario')
    .eq('lida', false);

  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest, { params }: { params: { usuarioId: string } }) {
  try {
    const body = await request.json();
    if (!body.texto?.trim()) return NextResponse.json({ success: false, error: 'texto é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('mensagens_chat')
      .insert({ usuario_id: params.usuarioId, remetente: 'admin', texto: body.texto.trim().slice(0, 1000) })
      .select('*')
      .single();
    if (error) throw error;

    await enviarPushParaUsuario(params.usuarioId, {
      titulo: 'Nova mensagem do suporte',
      corpo: body.texto.trim().slice(0, 100),
      url: '/ajuda',
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
