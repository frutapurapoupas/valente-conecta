// Caminho: C:\valente_conecta\app\api\admin-master\pdv\relatorio-fiscal\route.ts
//
// Visibilidade do admin master sobre a base fiscal (ver migration
// 045_base_fiscal_pdv.sql): quantos fornecedores ja preencheram dado
// fiscal (CNPJ/CPF) e quantas notas estao pendentes de emissao — util pra
// saber quem esta "pronto" quando a emissao automatica for ligada.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { obterNomesFornecedoresPublico } from '@/lib/catalogo/catalogoService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();

    const [{ data: fornecedores, error: erroFornecedores }, { data: notas, error: erroNotas }] = await Promise.all([
      supabase.from('perfis_fornecedor').select('usuario_id, cnpj_cpf, inscricao_estadual, regime_tributario'),
      supabase.from('pdv_notas_fiscais').select('*').order('created_at', { ascending: false }),
    ]);
    if (erroFornecedores) throw erroFornecedores;
    if (erroNotas) throw erroNotas;

    const comDadoFiscal = (fornecedores || []).filter((f) => f.cnpj_cpf).length;
    const pendentes = (notas || []).filter((n) => n.status === 'pendente');
    const emitidas = (notas || []).filter((n) => n.status === 'emitida');

    const nomes = await obterNomesFornecedoresPublico(pendentes.map((n) => n.usuario_id));

    return NextResponse.json({
      success: true,
      data: {
        totalFornecedores: (fornecedores || []).length,
        comDadoFiscal,
        totalNotas: (notas || []).length,
        totalPendentes: pendentes.length,
        totalEmitidas: emitidas.length,
        pendentesDetalhe: pendentes.slice(0, 30).map((n) => ({ ...n, lojaNome: nomes[n.usuario_id] || 'Loja' })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao gerar relatório' }, { status: 500 });
  }
}
