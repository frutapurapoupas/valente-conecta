// Caminho: C:\valente_conecta\app\api\admin-master\saude-reivindicacoes\route.ts
//
// Admin master revisa solicitacoes de "Sou proprietário" do diretorio de
// Saude (fila manual — so' chega aqui quando comercios_moderacao.auto
// estiver desligado, ver app/api/saude/reivindicar/route.ts).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || 'pendente';
  const supabase = createClient();

  const { data: reivindicacoes, error } = await supabase
    .from('saude_estabelecimentos_reivindicacoes')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const ids = [...new Set((reivindicacoes || []).map((r: any) => r.estabelecimento_id))];
  const { data: estabelecimentos } = ids.length
    ? await supabase.from('saude_estabelecimentos').select('id, nome, tipo, telefone').in('id', ids)
    : { data: [] as any[] };
  const porId = new Map((estabelecimentos || []).map((e: any) => [e.id, e]));

  const resultado = (reivindicacoes || []).map((r: any) => ({ ...r, estabelecimento: porId.get(r.estabelecimento_id) || null }));
  return NextResponse.json({ success: true, data: resultado });
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();
    const acao = body?.acao;

    const supabase = createClient();
    const { data: reivindicacao } = await supabase.from('saude_estabelecimentos_reivindicacoes').select('*').eq('id', id).maybeSingle();
    if (!reivindicacao) return NextResponse.json({ success: false, error: 'Solicitação não encontrada.' }, { status: 404 });
    if (reivindicacao.status !== 'pendente') {
      return NextResponse.json({ success: false, error: 'Essa solicitação já foi processada.' }, { status: 409 });
    }

    if (acao === 'aprovar') {
      const d = reivindicacao.dados_novos;
      await supabase
        .from('saude_estabelecimentos')
        .update({
          nome: d.nome,
          telefone: d.telefone,
          whatsapp: d.whatsapp || d.telefone,
          endereco: d.endereco,
          horario: d.horario,
          tipo: d.tipo,
          especialidades: Array.isArray(d.especialidades) ? d.especialidades : [],
          foto: d.foto || null,
          dono_id: reivindicacao.usuario_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reivindicacao.estabelecimento_id);

      if (reivindicacao.usuario_id) {
        await supabase
          .from('agenda_habilitacoes')
          .upsert({ dono_id: reivindicacao.usuario_id, ativo: true, gratuito: true, liberado_em: new Date().toISOString() }, { onConflict: 'dono_id' });
      }

      await supabase.from('saude_estabelecimentos_reivindicacoes').update({ status: 'aprovada', processado_em: new Date().toISOString() }).eq('id', id);
      return NextResponse.json({ success: true, status: 'aprovada' });
    }

    if (acao === 'recusar') {
      await supabase
        .from('saude_estabelecimentos_reivindicacoes')
        .update({ status: 'recusada', motivo_recusa: body.motivo || null, processado_em: new Date().toISOString() })
        .eq('id', id);
      return NextResponse.json({ success: true, status: 'recusada' });
    }

    return NextResponse.json({ success: false, error: 'acao deve ser "aprovar" ou "recusar"' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar solicitação' }, { status: 500 });
  }
}
