// Caminho: C:\valente_conecta\lib\fiado.ts
//
// Lançar um débito de fiado — extraído de app/api/fiado/dividas/route.ts
// (POST) pra ser reaproveitado também pela frente de caixa
// (app/api/pdv/vendas/route.ts) quando a forma de pagamento é fiado.
// Mesma lógica exata: checa limite de crédito, insere, dispara push
// best-effort. Comportamento idêntico ao de antes, só reorganizado.

import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

function formatarData(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');
}

export interface ParametrosDividaFiado {
  donoId: string;
  clienteId: string;
  valorTotal: number;
  dataVencimento: string;
  itens?: any[];
  observacoes?: string;
  lojaNome?: string;
  forcarLimite?: boolean;
}

export type ResultadoDividaFiado =
  | { ok: true; divida: any; saldoTotalCliente: number }
  | { ok: false; limiteExcedido: true; saldoAtual: number; limite: number };

export type ResultadoVerificacaoLimite =
  | { ok: true }
  | { ok: false; saldoAtual: number; limite: number };

// So' checa se cabe no limite, SEM inserir nada -- usado pela frente de
// caixa (app/api/pdv/vendas/route.ts) pra recusar a venda fiado ANTES de
// registrar a venda/baixar estoque (achado testando: se o limite so' fosse
// checado depois de já ter chamado a RPC de venda, uma recusa deixava uma
// venda "orfa" no banco, com estoque baixado e nenhum pagamento registrado).
export async function verificarLimiteFiado(clienteId: string, valorNovo: number, forcarLimite?: boolean): Promise<ResultadoVerificacaoLimite> {
  const supabase = createClient();

  const { data: clienteLimite, error: erroCliente } = await supabase
    .from('fiado_clientes')
    .select('limite_credito')
    .eq('id', clienteId)
    .single();
  if (erroCliente) throw erroCliente;

  const limite = Number(clienteLimite?.limite_credito || 0);
  const { data: dividasAbertas, error: erroAbertas } = await supabase
    .from('fiado_dividas')
    .select('valor_total, valor_pago')
    .eq('cliente_id', clienteId)
    .neq('status', 'pago');
  if (erroAbertas) throw erroAbertas;
  const saldoAntes = (dividasAbertas || []).reduce((soma, d) => soma + (Number(d.valor_total) - Number(d.valor_pago)), 0);

  if (limite > 0 && !forcarLimite && saldoAntes + valorNovo > limite) {
    return { ok: false, saldoAtual: saldoAntes, limite };
  }
  return { ok: true };
}

// Insere a divida direto, SEM checar limite (assume que quem chamou já
// verificou via verificarLimiteFiado ou aceita o risco). Usada tanto por
// criarDividaFiado (abaixo) quanto pela frente de caixa, depois que a
// venda em si já foi registrada com sucesso.
export async function inserirDividaFiado(params: Omit<ParametrosDividaFiado, 'forcarLimite'>): Promise<{ divida: any; saldoTotalCliente: number }> {
  const supabase = createClient();

  const { data: dividasAbertas, error: erroAbertas } = await supabase
    .from('fiado_dividas')
    .select('valor_total, valor_pago')
    .eq('cliente_id', params.clienteId)
    .neq('status', 'pago');
  if (erroAbertas) throw erroAbertas;
  const saldoAntes = (dividasAbertas || []).reduce((soma, d) => soma + (Number(d.valor_total) - Number(d.valor_pago)), 0);

  const { data: divida, error } = await supabase
    .from('fiado_dividas')
    .insert({
      dono_id: params.donoId,
      cliente_id: params.clienteId,
      valor_total: params.valorTotal,
      data_vencimento: params.dataVencimento,
      itens: Array.isArray(params.itens) ? params.itens : [],
      observacoes: params.observacoes || null,
    })
    .select('*, fiado_clientes(nome, telefone, cliente_usuario_id)')
    .single();
  if (error) throw error;

  const saldoTotalCliente = saldoAntes + params.valorTotal;
  const cliente = (divida as any).fiado_clientes;
  if (cliente?.cliente_usuario_id) {
    try {
      await enviarPushParaUsuario(cliente.cliente_usuario_id, {
        titulo: `Nova conta fiado — ${params.lojaNome || 'Valente Conecta'}`,
        corpo: `Compra: R$ ${params.valorTotal.toFixed(2)} · Saldo total em aberto: R$ ${saldoTotalCliente.toFixed(2)} · Vencimento: ${formatarData(params.dataVencimento)}`,
        url: '/pdv/fiado',
      });
    } catch {
      // push e' best-effort, nao bloqueia o lancamento do debito
    }
  }

  return { divida, saldoTotalCliente };
}

// Composição das duas de cima (checa + insere), pro caso de uso original
// em app/api/fiado/dividas/route.ts -- comportamento idêntico ao de antes
// da extração, só reorganizado.
export async function criarDividaFiado(params: ParametrosDividaFiado): Promise<ResultadoDividaFiado> {
  const verificacao = await verificarLimiteFiado(params.clienteId, params.valorTotal, params.forcarLimite);
  if (!verificacao.ok) {
    return { ok: false, limiteExcedido: true, saldoAtual: verificacao.saldoAtual, limite: verificacao.limite };
  }
  const { divida, saldoTotalCliente } = await inserirDividaFiado(params);
  return { ok: true, divida, saldoTotalCliente };
}
