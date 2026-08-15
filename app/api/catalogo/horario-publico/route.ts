// Caminho: C:\valente_conecta\app\api\catalogo\horario-publico\route.ts
//
// Horario semanal de funcionamento do fornecedor — publico (nao e' dado
// de contato, diferente de telefone/whatsapp/endereco). Usado pelo badge
// "Aberto agora" em qualquer tela que exiba um item do catalogo.

import { NextRequest, NextResponse } from 'next/server';
import { obterHorarioPublico } from '@/lib/catalogo/catalogoService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const usuarioId = request.nextUrl.searchParams.get('usuario_id');
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuario_id é obrigatório' }, { status: 400 });
    const horarios = await obterHorarioPublico(usuarioId);
    return NextResponse.json({ success: true, data: horarios });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao obter horário' }, { status: 500 });
  }
}
