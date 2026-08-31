// Caminho: C:\valente_conecta\app\api\pdv\dados-fiscais\route.ts
//
// Dados fiscais da loja (CNPJ/CPF, Inscrição Estadual, regime tributário,
// endereço estruturado) -- preparação pra emissão de NFC-e futura (ver
// 091_pdv_preparacao_fiscal.sql). Rota separada de /api/pdv/perfil-vitrine
// de propósito: aquela é exigida só na hora de publicar na vitrine pública
// (campos obrigatórios diferentes), essa é opcional e específica de fiscal.
// Não emite nota nenhuma -- só guarda o cadastro.

import { NextRequest, NextResponse } from 'next/server';
import { obterPerfilFornecedor, salvarCamposPerfilFornecedor } from '@/lib/pdv/perfilFornecedorPdv';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const perfil = await obterPerfilFornecedor(usuarioId);
  return NextResponse.json({ success: true, data: perfil });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

    const data = await salvarCamposPerfilFornecedor(usuarioId, {
      cnpjCpf: body.cnpjCpf ? String(body.cnpjCpf).trim() : undefined,
      inscricaoEstadual: body.inscricaoEstadual ? String(body.inscricaoEstadual).trim() : undefined,
      regimeTributario: body.regimeTributario || undefined,
      crt: body.crt ? Number(body.crt) : undefined,
      enderecoLogradouro: body.enderecoLogradouro ? String(body.enderecoLogradouro).trim() : undefined,
      enderecoNumero: body.enderecoNumero ? String(body.enderecoNumero).trim() : undefined,
      enderecoComplemento: body.enderecoComplemento ? String(body.enderecoComplemento).trim() : undefined,
      enderecoBairro: body.enderecoBairro ? String(body.enderecoBairro).trim() : undefined,
      enderecoMunicipio: body.enderecoMunicipio ? String(body.enderecoMunicipio).trim() : undefined,
      enderecoCodigoIbge: body.enderecoCodigoIbge ? String(body.enderecoCodigoIbge).trim() : undefined,
      enderecoUf: body.enderecoUf ? String(body.enderecoUf).trim().toUpperCase() : undefined,
      enderecoCep: body.enderecoCep ? String(body.enderecoCep).trim() : undefined,
    });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar dados fiscais' }, { status: 500 });
  }
}
