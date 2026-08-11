// Caminho: C:\valente_conecta\app\api\catalogo\interesses\[id]\contato\route.ts
//
// Unico caminho pelo qual o contato do fornecedor chega ao comprador —
// so retorna dado se o interesse estiver liberado (RPC contato_liberado_comprador,
// ver 003_marketplace_interesse.sql).

import { NextRequest, NextResponse } from 'next/server';
import { obterContatoLiberado } from '@/lib/catalogo/catalogoService';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contato = await obterContatoLiberado(params.id);
    if (!contato) {
      return NextResponse.json({ success: false, liberado: false, error: 'Contato ainda não liberado' }, { status: 403 });
    }
    return NextResponse.json({ success: true, liberado: true, data: contato });
  } catch (error) {
    console.error('Erro ao obter contato liberado:', error);
    return NextResponse.json({ success: false, error: 'Erro ao obter contato' }, { status: 500 });
  }
}
