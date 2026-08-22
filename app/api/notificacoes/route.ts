// Caminho: C:\valente_conecta\app\api\notificacoes\route.ts
//
// Lista de notificações do sininho (NotificacaoSininho.tsx), por usuario_id
// (id anonimo por dispositivo, ver lib/usuarioLocal.ts). Antes usava
// localStorage do lado do servidor — nao existe la, entao sempre voltava
// vazio e o PUT nunca persistia nada. Agora le/grava em notificacoes_usuario
// (ver 063_notificacoes_usuario.sql).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) {
    return NextResponse.json({ success: true, notificacoes: [] });
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notificacoes_usuario')
      .select('id, titulo, mensagem, link, lida, created_at')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ success: true, notificacoes: data || [] });
  } catch (error) {
    return NextResponse.json({ success: true, notificacoes: [] });
  }
}

const ORIGENS_VALIDAS = ['sistema', 'admin_master', 'lojista', 'prestador'] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const usuarioId = String(body.usuarioId || '').trim();
    const origem = String(body.origem || '').trim();
    const titulo = String(body.titulo || '').trim();
    const mensagem = String(body.mensagem || '').trim();
    const link = body.link ? String(body.link).trim() : null;

    if (!usuarioId || !titulo || !mensagem) {
      return NextResponse.json({ success: false, error: 'usuarioId, titulo e mensagem são obrigatórios' }, { status: 400 });
    }
    if (!ORIGENS_VALIDAS.includes(origem as any)) {
      return NextResponse.json({ success: false, error: `origem deve ser uma de: ${ORIGENS_VALIDAS.join(', ')}` }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('notificacoes_usuario')
      .insert({ usuario_id: usuarioId, origem, titulo, mensagem, link })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao criar notificação' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('notificacoes_usuario')
      .update({ lida: true })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
