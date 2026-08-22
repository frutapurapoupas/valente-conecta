// Caminho: C:\valente_conecta\app\api\admin-master\comercios-reivindicacoes\route.ts
//
// Admin master revisa solicitacoes de "Sou proprietário" (fila manual —
// so' chega aqui quando comercios_moderacao.auto estiver desligado, ver
// app/api/comercios-diretorio/reivindicar/route.ts).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || 'pendente';
  const supabase = createClient();

  // Duas consultas separadas (em vez de embutir o join) porque "status" e'
  // coluna tanto em comercios_diretorio_reivindicacoes quanto em
  // comercios_diretorio — o filtro .eq('status', ...) num select() com
  // join embutido ficava ambiguo entre as duas tabelas.
  const { data: reivindicacoes, error } = await supabase
    .from('comercios_diretorio_reivindicacoes')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const comercioIds = [...new Set((reivindicacoes || []).map((r: any) => r.comercio_id))];
  const { data: comercios } = comercioIds.length
    ? await supabase.from('comercios_diretorio').select('id, nome, modulo, categoria, telefone').in('id', comercioIds)
    : { data: [] as any[] };
  const comerciosPorId = new Map((comercios || []).map((c: any) => [c.id, c]));

  const resultado = (reivindicacoes || []).map((r: any) => ({ ...r, comercio: comerciosPorId.get(r.comercio_id) || null }));
  return NextResponse.json({ success: true, data: resultado });
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();
    const acao = body?.acao; // 'aprovar' | 'recusar'

    const supabase = createClient();
    const { data: reivindicacao } = await supabase.from('comercios_diretorio_reivindicacoes').select('*').eq('id', id).maybeSingle();
    if (!reivindicacao) return NextResponse.json({ success: false, error: 'Solicitação não encontrada.' }, { status: 404 });
    if (reivindicacao.status !== 'pendente') {
      return NextResponse.json({ success: false, error: 'Essa solicitação já foi processada.' }, { status: 409 });
    }

    if (acao === 'aprovar') {
      const d = reivindicacao.dados_novos;
      await supabase
        .from('comercios_diretorio')
        .update({
          nome: d.nome,
          telefone: d.telefone,
          whatsapp: d.whatsapp || d.telefone,
          endereco: d.endereco,
          horario: d.horario,
          categoria: d.categoria,
          foto: d.foto || null,
          dono_id: reivindicacao.usuario_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reivindicacao.comercio_id);

      if (reivindicacao.usuario_id) {
        await supabase
          .from('agenda_habilitacoes')
          .upsert({ dono_id: reivindicacao.usuario_id, ativo: true, gratuito: true, liberado_em: new Date().toISOString() }, { onConflict: 'dono_id' });
      }

      await supabase.from('comercios_diretorio_reivindicacoes').update({ status: 'aprovada', processado_em: new Date().toISOString() }).eq('id', id);
      return NextResponse.json({ success: true, status: 'aprovada' });
    }

    if (acao === 'recusar') {
      await supabase
        .from('comercios_diretorio_reivindicacoes')
        .update({ status: 'recusada', motivo_recusa: body.motivo || null, processado_em: new Date().toISOString() })
        .eq('id', id);
      return NextResponse.json({ success: true, status: 'recusada' });
    }

    return NextResponse.json({ success: false, error: 'acao deve ser "aprovar" ou "recusar"' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar solicitação' }, { status: 500 });
  }
}
