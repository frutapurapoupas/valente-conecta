import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ============================================
// GERENCIAR DEMANDAS DE BUSCA
// ============================================

interface DemandaBusca {
  id: string;
  termo: string;
  userId: string;
  localizacao?: { lat: number; lng: number };
  status: 'pendente' | 'respondida' | 'arquivada';
  criadoEm: string;
  respondidoEm: string | null;
  resposta: string | null;
}

const DEMANDAS_PATH = path.join(process.cwd(), 'data', 'demandas_busca.json');

function lerDemandas(): DemandaBusca[] {
  try {
    if (fs.existsSync(DEMANDAS_PATH)) {
      return JSON.parse(fs.readFileSync(DEMANDAS_PATH, 'utf8'));
    }
  } catch (error) {
    console.error('Erro ao ler demandas:', error);
  }
  return [];
}

function salvarDemandas(demandas: DemandaBusca[]) {
  try {
    const dir = path.dirname(DEMANDAS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DEMANDAS_PATH, JSON.stringify(demandas, null, 2));
  } catch (error) {
    console.error('Erro ao salvar demandas:', error);
  }
}

// GET - Listar demandas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pendente';

    const demandas = lerDemandas();
    const filtradas = status === 'todos' 
      ? demandas 
      : demandas.filter(d => d.status === status);

    return NextResponse.json({
      success: true,
      demandas: filtradas,
      total: filtradas.length,
      estatisticas: {
        pendentes: demandas.filter(d => d.status === 'pendente').length,
        respondidas: demandas.filter(d => d.status === 'respondida').length,
        arquivadas: demandas.filter(d => d.status === 'arquivada').length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar demandas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar demandas' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar status e resposta
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { demandaId, status, resposta } = body;

    if (!demandaId) {
      return NextResponse.json(
        { success: false, message: 'ID da demanda Ã© obrigatÃ³rio' },
        { status: 400 }
      );
    }

    const demandas = lerDemandas();
    const demanda = demandas.find(d => d.id === demandaId);

    if (!demanda) {
      return NextResponse.json(
        { success: false, message: 'Demanda nÃ£o encontrada' },
        { status: 404 }
      );
    }

    // Atualizar
    if (status) demanda.status = status;
    if (resposta) {
      demanda.resposta = resposta;
      demanda.respondidoEm = new Date().toISOString();
    }

    salvarDemandas(demandas);

    // Notificar usuÃ¡rio se houver resposta
    if (resposta) {
      try {
        // Aqui vocÃª pode enviar uma notificaÃ§Ã£o push ou email
        // await enviarNotificacaoUsuario(demanda.userId, demanda.termo, resposta);
      } catch (error) {
        console.error('Erro ao notificar usuÃ¡rio:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demanda atualizada',
      demanda
    });
  } catch (error) {
    console.error('Erro ao atualizar demanda:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar demanda' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar demanda
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const demandaId = searchParams.get('id');

    if (!demandaId) {
      return NextResponse.json(
        { success: false, message: 'ID da demanda Ã© obrigatÃ³rio' },
        { status: 400 }
      );
    }

    const demandas = lerDemandas();
    const filtered = demandas.filter(d => d.id !== demandaId);

    salvarDemandas(filtered);

    return NextResponse.json({
      success: true,
      message: 'Demanda deletada'
    });
  } catch (error) {
    console.error('Erro ao deletar demanda:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao deletar demanda' },
      { status: 500 }
    );
  }
}

