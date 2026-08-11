// Caminho: C:\valente_conecta\app\api\catalogo\perfil-fornecedor\route.ts
//
// Perfil de contato do fornecedor — unico lugar onde telefone/whatsapp/
// endereco ficam guardados (nunca em catalogo_itens). Leitura passa pela
// RPC meu_perfil_fornecedor (o dono le o proprio perfil).

import { NextRequest, NextResponse } from 'next/server';
import { obterMeuPerfilFornecedor, salvarPerfilFornecedor } from '@/lib/catalogo/catalogoService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuario_id');
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuario_id é obrigatório' }, { status: 400 });
    const data = await obterMeuPerfilFornecedor(usuarioId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao obter perfil do fornecedor:', error);
    return NextResponse.json({ success: false, error: 'Erro ao obter perfil' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.usuario_id || !body.nome_exibicao || !body.telefone) {
      return NextResponse.json({ success: false, error: 'usuario_id, nome_exibicao e telefone são obrigatórios' }, { status: 400 });
    }
    const data = await salvarPerfilFornecedor(body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao salvar perfil do fornecedor:', error);
    return NextResponse.json({ success: false, error: 'Erro ao salvar perfil' }, { status: 500 });
  }
}
