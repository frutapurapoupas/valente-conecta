// Caminho: C:\valente_conecta\app\api\pdv\localizacao\route.ts
//
// Salva a localização (lat/long) da loja em perfis_fornecedor — mesma
// tabela já usada pelos outros módulos do marketplace (003_marketplace_interesse.sql,
// 045_base_fiscal_pdv.sql) — em vez de criar uma coluna paralela só pro PDV.
// Chamado uma vez, no primeiro acesso ao PDV (lib/pdv/solicitarLocalizacao.ts).
// Preserva qualquer perfil de fornecedor já existente (outro módulo pode já
// ter cadastrado nome/telefone/endereço) — só sobrescreve latitude/longitude.

import { NextRequest, NextResponse } from 'next/server';
import { salvarCamposPerfilFornecedor } from '@/lib/pdv/perfilFornecedorPdv';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ success: false, error: 'latitude/longitude inválidas' }, { status: 400 });
    }

    const data = await salvarCamposPerfilFornecedor(usuarioId, { latitude, longitude });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar localização' }, { status: 500 });
  }
}
