// Caminho: C:\valente_conecta\lib\carona\taxaSplit.ts
//
// Calculo da taxa de uso da plataforma sobre o valor da vaga na Carona
// Solidaria, quando o motorista tem conta Mercado Pago conectada (ver
// 080_carona_split_pagamento.sql). Mesmo principio de isencao ja usado no
// Moto Taxi (lib/mototaxi/taxaUso.ts): cliente isento com plano_geral pago,
// motorista isento com assinatura ativa (categoria "transporte").

import { createClient } from '@/lib/supabase/server';

interface TaxaSplitConfig {
  taxaPercentualCliente: number;
  taxaPercentualMotorista: number;
}

const CONFIG_PADRAO: TaxaSplitConfig = { taxaPercentualCliente: 5, taxaPercentualMotorista: 5 };

export async function obterTaxaSplitConfig(): Promise<TaxaSplitConfig> {
  const supabase = createClient();
  const { data } = await supabase.from('admin_configuracoes').select('valor').eq('chave', 'carona_taxa_split_config').maybeSingle();
  if (!data?.valor) return CONFIG_PADRAO;
  try {
    const parsed = JSON.parse(data.valor);
    return {
      taxaPercentualCliente: Number(parsed.taxaPercentualCliente ?? CONFIG_PADRAO.taxaPercentualCliente),
      taxaPercentualMotorista: Number(parsed.taxaPercentualMotorista ?? CONFIG_PADRAO.taxaPercentualMotorista),
    };
  } catch {
    return CONFIG_PADRAO;
  }
}

export async function clienteIsentoDaTaxa(usuarioId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase.from('usuarios').select('plano_geral').eq('id', usuarioId).maybeSingle();
  return !!data && ['basico', 'ilimitado'].includes(data.plano_geral);
}

export async function motoristaIsentoDaTaxaSplit(motoristaUsuarioId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('assinaturas_planos')
    .select('id')
    .eq('usuario_id', motoristaUsuarioId)
    .eq('servico_id', 'transporte')
    .eq('status', 'ativo')
    .maybeSingle();
  return !!data;
}

/**
 * Calcula o total da vaga e o quanto de cada lado vira taxa da plataforma
 * (marketplace_fee somado). O valor do motorista so' entra na conta
 * quando ele NAO esta isento -- a parte do cliente sempre sai do preco
 * total antes de virar marketplace_fee, entao precisamos somar as duas
 * fatias isentas/nao-isentas pra saber o desconto total do Mercado Pago.
 */
export async function calcularTaxaSplit(valorTotal: number, usuarioId: string, motoristaUsuarioId: string) {
  const config = await obterTaxaSplitConfig();
  const [clienteIsento, motoristaIsento] = await Promise.all([
    clienteIsentoDaTaxa(usuarioId),
    motoristaIsentoDaTaxaSplit(motoristaUsuarioId),
  ]);

  const taxaCliente = clienteIsento ? 0 : Number(((valorTotal * config.taxaPercentualCliente) / 100).toFixed(2));
  const taxaMotorista = motoristaIsento ? 0 : Number(((valorTotal * config.taxaPercentualMotorista) / 100).toFixed(2));

  return { taxaCliente, taxaMotorista, marketplaceFee: Number((taxaCliente + taxaMotorista).toFixed(2)) };
}
