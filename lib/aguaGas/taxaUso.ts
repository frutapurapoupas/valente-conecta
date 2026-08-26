// Caminho: C:\valente_conecta\lib\aguaGas\taxaUso.ts
//
// Taxa de uso da plataforma no pedido expresso de Agua e Gas -- ver
// supabase/migrations/081_agua_gas_pedido_expresso.sql. Nao e' uma divisao
// do preco do produto quando o pedido e' pago em dinheiro (o valor do
// garrafao/botijao continua sendo acertado direto entre fornecedor e
// cliente na entrega); e' uma cobranca separada da propria plataforma, 1%
// de cada lado, so' nesse caso -- quando o pagamento e' online, a mesma
// taxa ja sai automatica via marketplace_fee do Mercado Pago (ver
// app/api/agua-gas/pedido-expresso/route.ts).
//
// NOTA: nao existe uma categoria "agua_gas" dedicada entre as 16 categorias
// de assinatura (/api/planos-config) -- usamos 'utilidades' como a mais
// proxima, mesmo criterio ja aplicado a' Carona Solidaria (que usou
// 'transporte'). Sinalizar se precisar ajustar.

import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

const SERVICO_ID_FORNECEDOR = 'utilidades';

interface TaxaConfig {
  taxaPercentualCliente: number;
  taxaPercentualFornecedor: number;
}

const CONFIG_PADRAO: TaxaConfig = { taxaPercentualCliente: 1, taxaPercentualFornecedor: 1 };

export async function obterTaxaConfig(): Promise<TaxaConfig> {
  const supabase = createClient();
  const { data } = await supabase.from('admin_configuracoes').select('valor').eq('chave', 'agua_gas_taxa_config').maybeSingle();
  if (!data?.valor) return CONFIG_PADRAO;
  try {
    const parsed = JSON.parse(data.valor);
    return {
      taxaPercentualCliente: Number(parsed.taxaPercentualCliente ?? CONFIG_PADRAO.taxaPercentualCliente),
      taxaPercentualFornecedor: Number(parsed.taxaPercentualFornecedor ?? CONFIG_PADRAO.taxaPercentualFornecedor),
    };
  } catch {
    return CONFIG_PADRAO;
  }
}

async function clienteIsentoDaTaxa(supabase: ReturnType<typeof createClient>, usuarioId: string | null): Promise<boolean> {
  if (!usuarioId) return false;
  const { data } = await supabase.from('usuarios').select('plano_geral').eq('id', usuarioId).maybeSingle();
  return !!data && ['basico', 'ilimitado'].includes(data.plano_geral);
}

async function fornecedorIsentoDaTaxa(supabase: ReturnType<typeof createClient>, fornecedorUsuarioId: string | null): Promise<boolean> {
  if (!fornecedorUsuarioId) return false;
  const { data } = await supabase
    .from('assinaturas_planos')
    .select('id')
    .eq('usuario_id', fornecedorUsuarioId)
    .eq('servico_id', SERVICO_ID_FORNECEDOR)
    .eq('status', 'ativo')
    .maybeSingle();
  return !!data;
}

/**
 * Usado no pagamento ONLINE (split automatico via Mercado Pago) -- ver
 * app/api/agua-gas/pedido-expresso/route.ts. Retorna quanto cobrar de cada
 * lado e o marketplace_fee combinado que vai pro Checkout Pro.
 */
export async function calcularTaxaSplitPedido(
  valorItem: number,
  clienteUsuarioId: string | null,
  fornecedorUsuarioId: string | null
): Promise<{ taxaCliente: number; taxaFornecedor: number; marketplaceFee: number }> {
  const supabase = createClient();
  const config = await obterTaxaConfig();
  const [clienteIsento, fornecedorIsento] = await Promise.all([
    clienteIsentoDaTaxa(supabase, clienteUsuarioId),
    fornecedorIsentoDaTaxa(supabase, fornecedorUsuarioId),
  ]);
  const taxaCliente = clienteIsento ? 0 : Number(((valorItem * config.taxaPercentualCliente) / 100).toFixed(2));
  const taxaFornecedor = fornecedorIsento ? 0 : Number(((valorItem * config.taxaPercentualFornecedor) / 100).toFixed(2));
  return { taxaCliente, taxaFornecedor, marketplaceFee: Number((taxaCliente + taxaFornecedor).toFixed(2)) };
}

/**
 * Roda quando um pedido expresso e' criado com pagamento em DINHEIRO (sem
 * Mercado Pago nenhum). Calcula a taxa de uso de cada lado (isentando quem
 * tiver plano pago), grava em agua_gas_taxas_uso e dispara um push
 * imediato pra quem ficou com taxa pendente -- pra nao depender do
 * fornecedor/cliente lembrarem sozinhos depois da entrega. Nunca lanca
 * erro pra fora: taxa e' efeito colateral do pedido, uma falha aqui nao
 * pode impedir o pedido de ser criado.
 */
export async function calcularERegistrarTaxaPedidoExpresso(pedidoId: string): Promise<void> {
  try {
    const supabase = createClient();

    const { data: pedido } = await supabase
      .from('agua_gas_pedidos')
      .select('id, valor_total, cliente_id, cliente_telefone, fornecedor_id')
      .eq('id', pedidoId)
      .maybeSingle();
    if (!pedido) return;

    const { data: existentes } = await supabase.from('agua_gas_taxas_uso').select('id').eq('pedido_id', pedidoId);
    if (existentes && existentes.length > 0) return;

    const valorItem = Number(pedido.valor_total || 0);
    const config = await obterTaxaConfig();

    const { data: fornecedor } = await supabase
      .from('agua_gas_fornecedores')
      .select('dono_id, telefone')
      .eq('id', pedido.fornecedor_id)
      .maybeSingle();
    const fornecedorUsuarioId = fornecedor?.dono_id || null;

    const [clienteIsento, fornecedorIsento] = await Promise.all([
      clienteIsentoDaTaxa(supabase, pedido.cliente_id),
      fornecedorIsentoDaTaxa(supabase, fornecedorUsuarioId),
    ]);

    const valorCliente = clienteIsento ? 0 : Number(((valorItem * config.taxaPercentualCliente) / 100).toFixed(2));
    const valorFornecedor = fornecedorIsento ? 0 : Number(((valorItem * config.taxaPercentualFornecedor) / 100).toFixed(2));

    const linhas = [
      {
        pedido_id: pedidoId,
        papel: 'cliente',
        usuario_id: pedido.cliente_id,
        telefone: pedido.cliente_telefone,
        valor: valorCliente,
        percentual_aplicado: config.taxaPercentualCliente,
        status: clienteIsento || valorCliente <= 0 ? 'isento' : 'pendente',
      },
      {
        pedido_id: pedidoId,
        papel: 'fornecedor',
        usuario_id: fornecedorUsuarioId,
        telefone: fornecedor?.telefone || null,
        valor: valorFornecedor,
        percentual_aplicado: config.taxaPercentualFornecedor,
        status: fornecedorIsento || valorFornecedor <= 0 ? 'isento' : 'pendente',
      },
    ];

    const { data: inseridas } = await supabase.from('agua_gas_taxas_uso').insert(linhas).select('id, papel, usuario_id, valor, status');
    if (!inseridas) return;

    await Promise.allSettled(
      inseridas
        .filter((linha) => linha.status === 'pendente' && linha.usuario_id)
        .map((linha) => {
          const quemE = linha.papel === 'cliente' ? 'desse pedido de água/gás' : 'desse pedido de água/gás como fornecedor';
          return enviarPushParaUsuario(linha.usuario_id as string, {
            titulo: 'Taxa de uso pendente — Água e Gás',
            corpo: `Como o pagamento foi combinado em dinheiro, ficou faltando R$ ${Number(linha.valor).toFixed(2)} da taxa de uso do app ${quemE}. Toque pra pagar — com um plano pago essa taxa não é cobrada.`,
            url: `/agua-gas/taxas?destaque=${linha.id}`,
          });
        })
    );
  } catch (error) {
    console.error('Erro ao calcular/registrar taxa de uso do pedido expresso', pedidoId, error);
  }
}
