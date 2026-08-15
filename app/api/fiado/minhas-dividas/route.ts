// Caminho: C:\valente_conecta\app\api\fiado\minhas-dividas\route.ts
//
// Consulta do cliente: todo fiado dele, agrupado por loja. Localiza as
// linhas em fiado_clientes onde cliente_usuario_id bate com o usuario
// logado (ver migration 017_fiado.sql) — resolvido no lançamento do
// débito, por telefone — e junta o nome da loja via
// nomes_fornecedores_publico_v1 (não vaza telefone/endereço do
// fornecedor, só o nome, ver migration 043).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { obterNomesFornecedoresPublico } from '@/lib/catalogo/catalogoService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const usuarioId = request.nextUrl.searchParams.get('usuarioId');
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

    const supabase = createClient();

    const { data: clientes, error: erroClientes } = await supabase
      .from('fiado_clientes')
      .select('*')
      .eq('cliente_usuario_id', usuarioId);
    if (erroClientes) throw erroClientes;

    if (!clientes || clientes.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const clienteIds = clientes.map((c) => c.id);
    const donoIds = [...new Set(clientes.map((c) => c.dono_id))];

    const [{ data: dividas, error: erroDividas }, nomesLojas] = await Promise.all([
      supabase.from('fiado_dividas').select('*').in('cliente_id', clienteIds).order('data_vencimento', { ascending: true }),
      obterNomesFornecedoresPublico(donoIds),
    ]);
    if (erroDividas) throw erroDividas;

    const lojas = clientes.map((cliente) => {
      const dividasDaLoja = (dividas || []).filter((d) => d.cliente_id === cliente.id);
      const saldoDevedor = dividasDaLoja
        .filter((d) => d.status !== 'pago')
        .reduce((soma, d) => soma + (Number(d.valor_total) - Number(d.valor_pago)), 0);

      return {
        clienteId: cliente.id,
        donoId: cliente.dono_id,
        lojaNome: nomesLojas[cliente.dono_id] || 'Loja',
        limiteCredito: Number(cliente.limite_credito) || 0,
        saldoDevedor,
        dividas: dividasDaLoja,
      };
    });

    return NextResponse.json({ success: true, data: lojas });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao consultar fiado' }, { status: 500 });
  }
}
