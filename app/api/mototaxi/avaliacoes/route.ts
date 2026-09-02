// Caminho: C:\valente_conecta\app\api\mototaxi\avaliacoes\route.ts
//
// Avaliação (motorista + veículo, até 5 estrelas) de uma corrida de
// Moto-Táxi concluída (ver 096_avaliacoes.sql). Mesmo padrão de
// app/api/cozinha/pedidos/avaliar/route.ts: só aceita corrida já
// concluída, unique(corrida_id) impede avaliar 2x.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const corridaId = String(body.corridaId || '').trim();
    const motoristaId = String(body.motoristaId || '').trim();
    const passageiroId = body.passageiroId ? String(body.passageiroId).trim() : null;
    const estrelasMotorista = parseInt(body.estrelasMotorista, 10);
    const estrelasVeiculo = parseInt(body.estrelasVeiculo, 10);
    const ocorrencia = body.ocorrencia ? String(body.ocorrencia).trim() : null;

    if (!corridaId || !motoristaId) return NextResponse.json({ success: false, error: 'corridaId e motoristaId são obrigatórios' }, { status: 400 });
    if (!Number.isFinite(estrelasMotorista) || estrelasMotorista < 1 || estrelasMotorista > 5) {
      return NextResponse.json({ success: false, error: 'Nota do motorista deve ser entre 1 e 5' }, { status: 400 });
    }
    if (!Number.isFinite(estrelasVeiculo) || estrelasVeiculo < 1 || estrelasVeiculo > 5) {
      return NextResponse.json({ success: false, error: 'Nota do veículo deve ser entre 1 e 5' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: corrida } = await supabase.from('mototaxi_corridas').select('id, status').eq('id', corridaId).maybeSingle();
    if (!corrida) return NextResponse.json({ success: false, error: 'Corrida não encontrada' }, { status: 404 });
    if (corrida.status !== 'concluida') {
      return NextResponse.json({ success: false, error: 'Só é possível avaliar corridas já concluídas' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('mototaxi_avaliacoes')
      .insert({ corrida_id: corridaId, motorista_id: motoristaId, passageiro_id: passageiroId, estrelas_motorista: estrelasMotorista, estrelas_veiculo: estrelasVeiculo, ocorrencia })
      .select('*')
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        return NextResponse.json({ success: false, error: 'Você já avaliou esta corrida' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro ao salvar avaliação do Moto-Táxi:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar avaliação' }, { status: 500 });
  }
}
