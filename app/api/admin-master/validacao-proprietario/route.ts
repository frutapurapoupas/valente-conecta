// Caminho: C:\valente_conecta\app\api\admin-master\validacao-proprietario\route.ts
//
// Admin master revisa documentos comprobatorios de dono/responsavel de loja
// (094_validacao_proprietario_loja.sql). Aprovar libera o lojista pra dar
// de acordo em cadastros de produto de consumidor; recusar pede motivo (o
// lojista pode reenviar). Documento fica no bucket PRIVADO
// catalogo-comprovantes -- GET gera signed URL (5 min), mesmo padrao de
// /api/admin-master/pdv-catalogo-moderacao.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// perfis_fornecedor de proposito nao tem policy de select/update publica pra
// telefone/whatsapp (003_marketplace_interesse.sql) -- toda essa rota usa
// createAdminClient (service role) em vez de createClient.

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || 'pendente';
  const supabase = createAdminClient();

  const { data: perfis, error } = await supabase
    .from('perfis_fornecedor')
    .select('usuario_id, nome_exibicao, categoria_negocio, documento_comprobatorio_path, aceitou_termos_documento_em, updated_at')
    .eq('validacao_status', status)
    .order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const comSignedUrl = await Promise.all(
    (perfis || []).map(async (perfil: any) => {
      const { data } = perfil.documento_comprobatorio_path
        ? await supabase.storage.from('catalogo-comprovantes').createSignedUrl(perfil.documento_comprobatorio_path, 300)
        : { data: null };
      return { ...perfil, documento_signed_url: data?.signedUrl || null };
    })
  );

  return NextResponse.json({ success: true, data: comSignedUrl });
}

export async function PUT(request: NextRequest) {
  try {
    const usuarioId = request.nextUrl.searchParams.get('usuarioId');
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });
    const body = await request.json();
    const acao = body?.acao; // 'aprovar' | 'recusar'
    const adminId = body?.adminId;
    if (!adminId) return NextResponse.json({ success: false, error: 'adminId é obrigatório' }, { status: 400 });

    const supabase = createAdminClient();

    if (acao === 'aprovar') {
      const { data, error } = await supabase
        .from('perfis_fornecedor')
        .update({ validacao_status: 'aprovado', validado_por: adminId, validado_em: new Date().toISOString(), validacao_motivo_recusa: null })
        .eq('usuario_id', usuarioId)
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (acao === 'recusar') {
      const { data, error } = await supabase
        .from('perfis_fornecedor')
        .update({ validacao_status: 'recusado', validado_por: adminId, validado_em: new Date().toISOString(), validacao_motivo_recusa: body.motivo || null })
        .eq('usuario_id', usuarioId)
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'acao deve ser "aprovar" ou "recusar"' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar validação' }, { status: 500 });
  }
}
