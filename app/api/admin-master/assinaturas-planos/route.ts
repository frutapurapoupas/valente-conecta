// Caminho: C:\valente_conecta\app\api\admin-master\assinaturas-planos\route.ts
//
// Admin master ve todas as assinaturas de plano escolhidas pelos usuarios,
// com nome/whatsapp de quem escolheu (join manual, mesmo padrao de
// cidades-adicionais). Usado principalmente pra aprovar fiado manualmente.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

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

// Ativa manualmente o plano Fisco/Contabilidade depois de negociar valor e
// volume de notas no chat de suporte (esse plano e' "negociavel" em
// app/api/planos-config/route.ts e nunca passa pelo checkout normal --
// entao nunca cria a linha em assinaturas_planos sozinho).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const whatsapp = String(body.whatsapp || '').replace(/\D/g, '');
    const servicoId = String(body.servicoId || '').trim();
    const valor = Number(body.valor);
    const notasMensaisEstimadas = body.notasMensaisEstimadas ? Number(body.notasMensaisEstimadas) : null;

    if (!whatsapp) return NextResponse.json({ success: false, error: 'WhatsApp é obrigatório' }, { status: 400 });
    if (!servicoId) return NextResponse.json({ success: false, error: 'servicoId é obrigatório' }, { status: 400 });
    if (!Number.isFinite(valor) || valor <= 0) return NextResponse.json({ success: false, error: 'valor negociado inválido' }, { status: 400 });

    const supabase = createClient();

    const { data: usuario, error: erroUsuario } = await supabase
      .from('usuarios')
      .select('id, nome')
      .eq('whatsapp', whatsapp)
      .maybeSingle();
    if (erroUsuario) throw erroUsuario;
    if (!usuario) return NextResponse.json({ success: false, error: 'Nenhum usuário encontrado com esse WhatsApp' }, { status: 404 });
    const usuarioId = usuario.id;

    const { data, error } = await supabase
      .from('assinaturas_planos')
      .insert({
        usuario_id: usuarioId,
        servico_id: servicoId,
        plano_id: 'fisco',
        com_fiado: false,
        metodo_pagamento: 'negociado',
        parcelas: 1,
        valor,
        notas_mensais_estimadas: notasMensaisEstimadas,
        status: 'ativo',
      })
      .select('*')
      .single();
    if (error) throw error;

    await enviarPushParaUsuario(usuarioId, {
      titulo: 'Plano Fisco/Contabilidade ativado!',
      corpo: `Seu plano foi ativado — valor negociado: R$ ${valor.toFixed(2)}/mês.`,
      url: '/pdv/notas-fiscais',
    });

    return NextResponse.json({ success: true, data: { ...data, usuario: { nome: usuario.nome } } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao ativar plano' }, { status: 500 });
  }
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
