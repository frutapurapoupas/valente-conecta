// Caminho: C:\valente_conecta\app\api\admin-master\cidades-adicionais\route.ts
//
// Admin master ve todas as solicitacoes de cidade adicional, com nome e
// whatsapp de quem pediu (join manual, ja que nao ha FK exposta por RPC
// aqui — leitura simples, volume baixo).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data: pedidos, error } = await supabase
    .from('usuario_cidades_adicionais')
    .select('*')
    .order('solicitado_em', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const usuarioIds = Array.from(new Set((pedidos || []).map((p: any) => p.usuario_id)));
  const { data: usuarios } = usuarioIds.length
    ? await supabase.from('usuarios').select('id, nome, whatsapp, cidade_base').in('id', usuarioIds)
    : { data: [] };
  const mapaUsuarios = new Map((usuarios || []).map((u: any) => [u.id, u]));

  const data = (pedidos || []).map((p: any) => ({ ...p, usuario: mapaUsuarios.get(p.usuario_id) || null }));

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();
    if (!body.status) return NextResponse.json({ success: false, error: 'status é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('usuario_cidades_adicionais')
      .update({ status: body.status, atualizado_em: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    if (data?.usuario_local_id) {
      const mensagens: Record<string, string> = {
        aguardando_pagamento: `Pra liberar "${data.cidade}", falta o pagamento da assinatura adicional. A gente te chama pelo WhatsApp/chat com os detalhes.`,
        ativo: `Prontinho! Você já tem acesso à cidade "${data.cidade}".`,
        recusado: `Seu pedido de acesso à cidade "${data.cidade}" não foi aprovado. Fale com o suporte se quiser entender melhor.`,
      };
      const texto = mensagens[body.status];
      if (texto) {
        await supabase.from('mensagens_chat').insert({ usuario_id: data.usuario_local_id, remetente: 'admin', texto });
        await enviarPushParaUsuario(data.usuario_local_id, { titulo: 'Atualização sobre sua cidade', corpo: texto, url: '/minhas-cidades' });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar' }, { status: 500 });
  }
}
