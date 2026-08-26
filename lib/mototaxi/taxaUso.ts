// Caminho: C:\valente_conecta\lib\mototaxi\taxaUso.ts
//
// Taxa de uso da plataforma no Moto Taxi -- ver
// supabase/migrations/079_mototaxi_taxa_uso.sql pro desenho completo. Nao e'
// uma divisao da corrida (o valor da corrida continua sendo acertado direto
// entre motorista e passageiro, fora da plataforma); e' uma cobranca
// separada da propria plataforma, pra cada lado, toda corrida concluida.

import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

interface TaxaConfig {
  taxaPercentualCliente: number;
  taxaPercentualMotorista: number;
}

const CONFIG_PADRAO: TaxaConfig = { taxaPercentualCliente: 5, taxaPercentualMotorista: 5 };

export async function obterTaxaConfig(): Promise<TaxaConfig> {
  const supabase = createClient();
  const { data } = await supabase.from('admin_configuracoes').select('valor').eq('chave', 'mototaxi_taxa_config').maybeSingle();
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

/**
 * Roda quando uma corrida e' marcada como 'concluida'. Calcula a taxa de
 * cada lado (isentando quem tiver plano pago), grava em
 * mototaxi_taxas_uso e dispara um lembrete automatico (push, com link de
 * WhatsApp) pra quem ficou com taxa pendente -- pra nao depender do
 * passageiro/motorista lembrarem sozinhos depois que a corrida acaba.
 * Nunca lanca erro pra fora: taxa e' um efeito colateral da corrida, uma
 * falha aqui nao pode impedir a corrida de ser concluida.
 */
export async function calcularERegistrarTaxasDaCorrida(corridaId: string): Promise<void> {
  try {
    const supabase = createClient();

    const { data: corrida } = await supabase
      .from('mototaxi_corridas')
      .select('id, preco, passageiro_id, passageiro_nome, motorista_id')
      .eq('id', corridaId)
      .maybeSingle();
    if (!corrida) return;

    // Ja processado (idempotente -- 'corrida_status' pode ser chamado mais
    // de uma vez pro mesmo id em cenarios de retry).
    const { data: existentes } = await supabase.from('mototaxi_taxas_uso').select('papel').eq('corrida_id', corridaId);
    if (existentes && existentes.length > 0) return;

    const config = await obterTaxaConfig();
    const preco = Number(corrida.preco || 0);

    // --- Cliente: isento com plano_geral pago (basico/ilimitado). ---
    let clienteIsento = false;
    let clienteTelefone: string | null = null;
    if (corrida.passageiro_id) {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('plano_geral, whatsapp')
        .eq('id', corrida.passageiro_id)
        .maybeSingle();
      clienteIsento = !!usuario && ['basico', 'ilimitado'].includes(usuario.plano_geral);
      clienteTelefone = usuario?.whatsapp || null;
    }
    const valorCliente = clienteIsento ? 0 : Number(((preco * config.taxaPercentualCliente) / 100).toFixed(2));

    // --- Motorista: isento com assinatura ativa na categoria moto_taxi. ---
    let motoristaUsuarioId: string | null = null;
    let motoristaTelefone: string | null = null;
    let motoristaIsento = false;
    if (corrida.motorista_id) {
      const { data: motorista } = await supabase
        .from('mototaxi_motoristas')
        .select('usuario_id, telefone')
        .eq('id', corrida.motorista_id)
        .maybeSingle();
      motoristaUsuarioId = motorista?.usuario_id || null;
      motoristaTelefone = motorista?.telefone || null;
      if (motoristaUsuarioId) {
        const { data: assinatura } = await supabase
          .from('assinaturas_planos')
          .select('id')
          .eq('usuario_id', motoristaUsuarioId)
          .eq('servico_id', 'moto_taxi')
          .eq('status', 'ativo')
          .maybeSingle();
        motoristaIsento = !!assinatura;
      }
    }
    const valorMotorista = motoristaIsento ? 0 : Number(((preco * config.taxaPercentualMotorista) / 100).toFixed(2));

    const linhas = [
      {
        corrida_id: corridaId,
        papel: 'cliente',
        usuario_id: corrida.passageiro_id || null,
        telefone: clienteTelefone,
        valor: valorCliente,
        percentual_aplicado: config.taxaPercentualCliente,
        status: clienteIsento || valorCliente <= 0 ? 'isento' : 'pendente',
      },
      {
        corrida_id: corridaId,
        papel: 'motorista',
        usuario_id: motoristaUsuarioId,
        telefone: motoristaTelefone,
        valor: valorMotorista,
        percentual_aplicado: config.taxaPercentualMotorista,
        status: motoristaIsento || valorMotorista <= 0 ? 'isento' : 'pendente',
      },
    ];

    const { data: inseridas } = await supabase.from('mototaxi_taxas_uso').insert(linhas).select('id, papel, usuario_id, valor, status');
    if (!inseridas) return;

    // Lembrete automatico so' pra quem ficou pendente e tem usuario_id real
    // (push exige uma inscricao vinculada a um usuario logado).
    await Promise.allSettled(
      inseridas
        .filter((linha) => linha.status === 'pendente' && linha.usuario_id)
        .map((linha) => {
          const quemE = linha.papel === 'cliente' ? 'dessa corrida' : 'dessa corrida como motorista';
          const linkPagamento = `/mototaxi/taxas?destaque=${linha.id}`;
          return enviarPushParaUsuario(linha.usuario_id as string, {
            titulo: 'Taxa de uso pendente',
            corpo: `Ficou faltando R$ ${Number(linha.valor).toFixed(2)} da taxa de uso do app ${quemE}. Toque pra pagar — com um plano pago essa taxa não é cobrada.`,
            url: linkPagamento,
          });
        })
    );
  } catch (error) {
    console.error('Erro ao calcular/registrar taxas de uso da corrida', corridaId, error);
  }
}
