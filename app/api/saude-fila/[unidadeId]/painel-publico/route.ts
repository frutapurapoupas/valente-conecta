// Caminho: C:\valente_conecta\app\api\saude-fila\[unidadeId]\painel-publico\route.ts
//
// Dados pro painel de TV da sala de espera (ver proposta "Modo Valente
// Facil", item 5) -- tela publica, sem login. Por isso mostra so' o
// numero da senha, nunca nome/whatsapp/motivo de prioridade de ninguem.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  const supabase = createAdminClient();

  const { data: unidade } = await supabase.from('unidades_saude').select('nome').eq('id', params.unidadeId).maybeSingle();

  const { data: chamando } = await supabase
    .from('fila_saude_senhas')
    .select('numero, chamado_em, profissional_id, fila_saude_profissionais(nome)')
    .eq('unidade_id', params.unidadeId)
    .eq('status', 'em_atendimento')
    .order('chamado_em', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: proximos } = await supabase
    .from('fila_saude_senhas')
    .select('numero, prioridade_tier')
    .eq('unidade_id', params.unidadeId)
    .in('status', ['aguardando', 'presente'])
    .order('prioridade_tier', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(4);

  return NextResponse.json({
    success: true,
    data: {
      unidadeNome: unidade?.nome || '',
      chamando: chamando ? { numero: chamando.numero, sala: (chamando as any).fila_saude_profissionais?.nome || null, chamadoEm: chamando.chamado_em } : null,
      proximos: proximos || [],
    },
  });
}
