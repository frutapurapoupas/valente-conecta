// Caminho: C:\valente_conecta\app\api\carona\avaliacoes\route.ts
//
// Avaliação (motorista + veículo, até 5 estrelas) de uma viagem de Carona
// Solidária concluída (ver 096_avaliacoes.sql). Diferente do Moto-Táxi,
// uma viagem pode ter vários passageiros — unique(viagem_id, passageiro_id)
// impede cada um de avaliar 2x, mas não impede passageiros diferentes de
// avaliarem a mesma viagem.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const viagemId = String(body.viagemId || '').trim();
    const motoristaId = String(body.motoristaId || '').trim();
    const passageiroId = String(body.passageiroId || '').trim();
    const estrelasMotorista = parseInt(body.estrelasMotorista, 10);
    const estrelasVeiculo = parseInt(body.estrelasVeiculo, 10);
    const ocorrencia = body.ocorrencia ? String(body.ocorrencia).trim() : null;

    if (!viagemId || !motoristaId || !passageiroId) {
      return NextResponse.json({ success: false, error: 'viagemId, motoristaId e passageiroId são obrigatórios' }, { status: 400 });
    }
    if (!Number.isFinite(estrelasMotorista) || estrelasMotorista < 1 || estrelasMotorista > 5) {
      return NextResponse.json({ success: false, error: 'Nota do motorista deve ser entre 1 e 5' }, { status: 400 });
    }
    if (!Number.isFinite(estrelasVeiculo) || estrelasVeiculo < 1 || estrelasVeiculo > 5) {
      return NextResponse.json({ success: false, error: 'Nota do veículo deve ser entre 1 e 5' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: viagem } = await supabase.from('carona_viagens').select('id, status').eq('id', viagemId).maybeSingle();
    if (!viagem) return NextResponse.json({ success: false, error: 'Viagem não encontrada' }, { status: 404 });
    if (viagem.status !== 'concluida') {
      return NextResponse.json({ success: false, error: 'Só é possível avaliar viagens já concluídas' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('carona_avaliacoes')
      .insert({ viagem_id: viagemId, motorista_id: motoristaId, passageiro_id: passageiroId, estrelas_motorista: estrelasMotorista, estrelas_veiculo: estrelasVeiculo, ocorrencia })
      .select('*')
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        return NextResponse.json({ success: false, error: 'Você já avaliou esta viagem' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro ao salvar avaliação da Carona:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar avaliação' }, { status: 500 });
  }
}
