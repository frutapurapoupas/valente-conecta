// Caminho: C:\valente_conecta\app\api\imoveis\contato\route.ts
//
// "Entrar em contato" num imóvel é, na fundação unificada, um interesse
// (ver 003_marketplace_interesse.sql) — reaproveita o mesmo fluxo de
// liberação de contato usado por todos os outros módulos.

import { NextRequest, NextResponse } from 'next/server';
import { criarInteresse } from '@/lib/catalogo/catalogoService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.imovelId || !body.compradorId) {
      return NextResponse.json({ success: false, error: 'imovelId e compradorId são obrigatórios' }, { status: 400 });
    }
    const mensagem = [body.nome && `De: ${body.nome}`, body.telefone && `Tel: ${body.telefone}`, body.mensagem]
      .filter(Boolean)
      .join(' — ');
    const interesse = await criarInteresse(body.imovelId, body.compradorId, mensagem || undefined);
    return NextResponse.json({ success: true, data: interesse });
  } catch (error) {
    console.error('Erro ao registrar contato de imóvel:', error);
    return NextResponse.json({ success: false, error: 'Erro ao enviar contato' }, { status: 500 });
  }
}
