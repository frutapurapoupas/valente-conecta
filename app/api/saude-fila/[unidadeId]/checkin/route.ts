// Caminho: C:\valente_conecta\app\api\saude-fila\[unidadeId]\checkin\route.ts
//
// Check-in do paciente ao chegar na unidade (passo 6 da jornada). Na v1
// e' um toque do proprio paciente na tela ("Cheguei") -- nao ha' leitor de
// QR/totem fisico na recepcao ainda, so' o dado passa a status
// 'presente'.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  try {
    const body = await request.json();
    const senhaId = String(body.senhaId || '').trim();
    if (!senhaId) return NextResponse.json({ success: false, error: 'senhaId é obrigatório' }, { status: 400 });

    const supabase = createAdminClient();

    // Agendamento eletivo (ver 109_...) nasce com numero=0 -- so' vira um
    // numero de verdade quando a pessoa chega, porque antes disso nao dava
    // pra saber quantas senhas do dia já existiam.
    const { data: senhaAtual } = await supabase.from('fila_saude_senhas').select('numero').eq('id', senhaId).maybeSingle();
    let patch: Record<string, any> = { status: 'presente' };
    if (senhaAtual?.numero === 0) {
      const inicioDoDia = new Date();
      inicioDoDia.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('fila_saude_senhas')
        .select('*', { count: 'exact', head: true })
        .eq('unidade_id', params.unidadeId)
        .gte('created_at', inicioDoDia.toISOString())
        .neq('numero', 0);
      patch.numero = (count || 0) + 1;
    }

    const { data, error } = await supabase
      .from('fila_saude_senhas')
      .update(patch)
      .eq('id', senhaId)
      .eq('unidade_id', params.unidadeId)
      .eq('status', 'aguardando')
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: 'Senha não encontrada ou já processada' }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
