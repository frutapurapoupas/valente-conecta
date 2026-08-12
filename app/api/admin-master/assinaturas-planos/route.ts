// Caminho: C:\valente_conecta\app\api\admin-master\assinaturas-planos\route.ts
//
// Admin master ve todas as assinaturas de plano escolhidas pelos usuarios,
// com nome/whatsapp de quem escolheu (join manual, mesmo padrao de
// cidades-adicionais). Usado principalmente pra aprovar fiado manualmente.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data: assinaturas, error } = await supabase
    .from('assinaturas_planos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const usuarioIds = Array.from(new Set((assinaturas || []).map((a: any) => a.usuario_id)));
  const { data: usuarios } = usuarioIds.length
    ? await supabase.from('usuarios').select('id, nome, whatsapp, cidade_base').in('id', usuarioIds)
    : { data: [] };
  const mapaUsuarios = new Map((usuarios || []).map((u: any) => [u.id, u]));

  const data = (assinaturas || []).map((a: any) => ({ ...a, usuario: mapaUsuarios.get(a.usuario_id) || null }));

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
      .from('assinaturas_planos')
      .update({ status: body.status, atualizado_em: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    if (data?.usuario_local_id) {
      const mensagens: Record<string, string> = {
        pago: 'Seu fiado foi aprovado! Falta só completar os dados do seu negócio pra ativar o plano.',
        recusado: 'Seu pedido de plano no fiado não foi aprovado. Fale com o suporte se quiser entender melhor.',
        cancelado: 'Sua assinatura de plano foi cancelada.',
      };
      const texto = mensagens[body.status];
      if (texto) {
        await supabase.from('mensagens_chat').insert({ usuario_id: data.usuario_local_id, remetente: 'admin', texto });
        await enviarPushParaUsuario(data.usuario_local_id, {
          titulo: 'Atualização sobre seu plano',
          corpo: texto,
          url: body.status === 'pago' ? `/planos/dados?id=${data.id}` : '/planos',
        });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar' }, { status: 500 });
  }
}
