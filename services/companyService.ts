import { supabase } from '@/lib/supabase'

// ... (interfaces existentes)

export interface SpyMarketData {
  company_id: string
  product_name: string
  price: number
  last_sale_at: string
  stock_level: number
}

/**
 * Modo Espião: Captura tendências de vendas de PDVs parceiros
 * para alimentar o Banco Mãe com inteligência de preço local.
 */
export async function getSpyMarketInsights(city?: string): Promise<SpyMarketData[]> {
  let query = supabase
    .from('spy_market_data') // Tabela que recebe sync dos PDVs locais
    .select('*')
    .order('last_sale_at', { ascending: false });

  if (city) {
    query = query.eq('cidade_base', city);
  }

  const { data } = await query.limit(50);
  return data || [];
}

/**
 * Alerta de Discrepância de Preço
 * Identifica se uma empresa está vendendo muito acima ou abaixo da média da cidade
 */
export async function getPriceAnomalies(productName: string) {
  const { data } = await supabase
    .rpc('calculate_price_deviation', { p_name: productName }); // Função no Postgres para IA de mercado
  return data;
}

/**
 * Aprovação de Modo Espião
 * Habilita uma empresa parceira a enviar dados de estoque para o Banco Mãe
 */
export async function toggleSpyMode(companyId: string, active: boolean): Promise<void> {
  await supabase
    .from('companies')
    .update({ spy_mode_enabled: active })
    .eq('id', companyId);
}