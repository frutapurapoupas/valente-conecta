// Caminho: C:\valente_conecta\app\api\pdv\validacao-proprietario\route.ts
//
// Lojista envia documento comprobatorio de que e' dono/responsavel pela
// loja (ver 094_validacao_proprietario_loja.sql) -- pre-requisito pra
// aprovar cadastros de consumidor em /pdv/aprovacoes-consumidor. POST exige
// aceiteTermos=true (declaracao de veracidade, lib/termosDocumentoComprobatorio.ts)
// e joga o status pra 'pendente', pro admin master revisar.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { obterValidacaoProprietario } from '@/lib/pdv/validacaoProprietario';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const data = await obterValidacaoProprietario(usuarioId);
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    const documentoPath = String(body.documentoPath || '').trim();
    const aceiteTermos = !!body.aceiteTermos;

    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });
    if (!documentoPath) return NextResponse.json({ success: false, error: 'Envie a foto do documento' }, { status: 400 });
    if (!aceiteTermos) return NextResponse.json({ success: false, error: 'É preciso aceitar a declaração de veracidade' }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('perfis_fornecedor')
      .update({
        documento_comprobatorio_path: documentoPath,
        validacao_status: 'pendente',
        validacao_motivo_recusa: null,
        validado_por: null,
        validado_em: null,
        aceitou_termos_documento_em: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('usuario_id', usuarioId)
      .select('validacao_status')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao enviar documento' }, { status: 500 });
  }
}
