// ============================================================================
// ARQUIVO 4: services/walletService.ts (ATUALIZADO COM CÂMBIO - CORRIGIDO)
// Funcionalidade: Gestão completa de carteira digital, transações, PIX e Moeda Conecta
// Inclui: Saldo, extrato, recarga PIX, débitos automáticos, transferências entre usuários
// 🆕 ATUALIZAÇÃO: Suporte a câmbio por cidade (1 MC = X Reais)
// 🔧 CORREÇÃO: Removida verificação de saldo ao GERAR QR Code (apenas ao PAGAR)
// ============================================================================

import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { cambioService } from './cambioService';

export interface Transacao {
  id: string;
  usuario_id: string;
  tipo: 'recarga' | 'pagamento' | 'transferencia' | 'recebimento' | 'saque' | 'cashback' | 'indicacao' | 'debito_automatico';
  valor: number;
  status: 'pendente' | 'concluido' | 'falhou' | 'cancelado';
  descricao: string;
  data: string;
  metodo: 'pix' | 'credito' | 'debito' | 'wallet' | 'moeda_conecta';
  destinatario_id?: string;
  destinatario_nome?: string;
  origem_id?: string;
  origem_nome?: string;
  pix_qr_code?: string;
  pix_copia_cola?: string;
  pix_expiracao?: string;
  metadata?: Record<string, any>;
}

export interface SaldoWallet {
  total: number;
  bloqueado: number;
  disponivel: number;
  ultima_atualizacao: string;
}

export interface RecargaPIX {
  id: string;
  valor: number;
  qr_code: string;
  copia_cola: string;
  expiracao: string;
  status: 'pendente' | 'pago' | 'expirado' | 'cancelado';
  created_at: string;
  paid_at?: string;
}

export interface DebitoAutomatico {
  id: string;
  usuario_id: string;
  servico: string;
  valor: number;
  data_vencimento: string;
  dia_cobranca: number;
  ativo: boolean;
  ultima_cobranca?: string;
  proxima_cobranca?: string;
}

export interface QRCodeTransferencia {
  codigo: string;
  valor?: number;
  descricao?: string;
  expiracao: string;
  gerado_por: string;
  gerado_por_nome: string;
}

class WalletService {
  private usuarioId: string | null = null;
  private usuarioNome: string | null = null;

  setUsuarioId(id: string, nome?: string) {
    this.usuarioId = id;
    this.usuarioNome = nome || null;
  }

  // ==========================================================================
  // CÂMBIO (NOVO)
  // ==========================================================================

  async getTaxaCambioUsuario(): Promise<number> {
    if (!this.usuarioId) return 1.0;
    const cambio = await cambioService.getCambioPorUsuario(this.usuarioId);
    return cambio?.taxa_cambio || 1.0;
  }

  async converterParaReal(mc: number): Promise<number> {
    const taxa = await this.getTaxaCambioUsuario();
    return mc * taxa;
  }

  async converterParaMC(real: number): Promise<number> {
    const taxa = await this.getTaxaCambioUsuario();
    return real / taxa;
  }

  // ==========================================================================
  // SALDO
  // ==========================================================================

  async getSaldo(): Promise<SaldoWallet> {
    try {
      if (this.usuarioId) {
        const { data, error } = await supabase
          .from('wallet')
          .select('total, bloqueado, disponivel, ultima_atualizacao')
          .eq('usuario_id', this.usuarioId)
          .single();

        if (!error && data) {
          return data;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar saldo do Supabase:', error);
    }

    const saldoLocal = localStorage.getItem(`wallet_saldo_${this.usuarioId || 'anonimo'}`);
    if (saldoLocal) {
      return JSON.parse(saldoLocal);
    }

    const saldoPadrao: SaldoWallet = {
      total: 0,
      bloqueado: 0,
      disponivel: 0,
      ultima_atualizacao: new Date().toISOString()
    };
    this.salvarSaldoLocal(saldoPadrao);
    return saldoPadrao;
  }

  async getSaldoEmReais(): Promise<number> {
    const saldo = await this.getSaldo();
    return await this.converterParaReal(saldo.disponivel);
  }

  private async salvarSaldoLocal(saldo: SaldoWallet): Promise<void> {
    localStorage.setItem(`wallet_saldo_${this.usuarioId || 'anonimo'}`, JSON.stringify(saldo));
  }

  // ==========================================================================
  // TRANSAÇÕES
  // ==========================================================================

  async getTransacoes(limite: number = 50, offset: number = 0): Promise<Transacao[]> {
    try {
      if (this.usuarioId) {
        const { data, error } = await supabase
          .from('transacoes')
          .select('*')
          .eq('usuario_id', this.usuarioId)
          .order('data', { ascending: false })
          .range(offset, offset + limite - 1);

        if (!error && data) {
          return data;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar transações do Supabase:', error);
    }

    const transacoesLocal = localStorage.getItem(`wallet_transacoes_${this.usuarioId || 'anonimo'}`);
    if (transacoesLocal) {
      return JSON.parse(transacoesLocal).slice(offset, offset + limite);
    }

    return [];
  }

  async getTransacoesEmReais(limite: number = 50): Promise<(Transacao & { valor_real: number })[]> {
    const transacoes = await this.getTransacoes(limite);
    const taxa = await this.getTaxaCambioUsuario();
    
    return transacoes.map(t => ({
      ...t,
      valor_real: t.valor * taxa
    }));
  }

  async registrarTransacao(transacao: Omit<Transacao, 'id' | 'data'>): Promise<Transacao | null> {
    const novaTransacao: Transacao = {
      id: Date.now().toString(),
      ...transacao,
      data: new Date().toISOString()
    };

    try {
      if (this.usuarioId) {
        const { data, error } = await supabase
          .from('transacoes')
          .insert({
            id: novaTransacao.id,
            usuario_id: novaTransacao.usuario_id,
            tipo: novaTransacao.tipo,
            valor: novaTransacao.valor,
            status: novaTransacao.status,
            descricao: novaTransacao.descricao,
            data: novaTransacao.data,
            metodo: novaTransacao.metodo,
            destinatario_id: novaTransacao.destinatario_id,
            destinatario_nome: novaTransacao.destinatario_nome,
            origem_id: novaTransacao.origem_id,
            origem_nome: novaTransacao.origem_nome
          })
          .select()
          .single();

        if (!error && data) {
          await this.atualizarSaldoPosTransacao(novaTransacao);
          return data;
        }
      }
    } catch (error) {
      console.error('Erro ao registrar transação no Supabase:', error);
    }

    const transacoesLocal = localStorage.getItem(`wallet_transacoes_${this.usuarioId || 'anonimo'}`);
    const transacoes = transacoesLocal ? JSON.parse(transacoesLocal) : [];
    transacoes.unshift(novaTransacao);
    localStorage.setItem(`wallet_transacoes_${this.usuarioId || 'anonimo'}`, JSON.stringify(transacoes.slice(0, 100)));

    await this.atualizarSaldoPosTransacao(novaTransacao);
    return novaTransacao;
  }

  private async atualizarSaldoPosTransacao(transacao: Transacao): Promise<void> {
    const saldo = await this.getSaldo();
    
    if (transacao.tipo === 'recarga' || transacao.tipo === 'cashback' || transacao.tipo === 'indicacao' || transacao.tipo === 'recebimento') {
      if (transacao.status === 'concluido') {
        saldo.total += transacao.valor;
        saldo.disponivel += transacao.valor;
      }
    } else if (transacao.tipo === 'pagamento' || transacao.tipo === 'transferencia' || transacao.tipo === 'saque' || transacao.tipo === 'debito_automatico') {
      if (transacao.status === 'concluido') {
        saldo.total -= transacao.valor;
        saldo.disponivel -= transacao.valor;
      } else if (transacao.status === 'pendente') {
        saldo.bloqueado += transacao.valor;
        saldo.disponivel -= transacao.valor;
      }
    }

    saldo.ultima_atualizacao = new Date().toISOString();
    
    try {
      if (this.usuarioId) {
        await supabase
          .from('wallet')
          .update({
            total: saldo.total,
            bloqueado: saldo.bloqueado,
            disponivel: saldo.disponivel,
            ultima_atualizacao: saldo.ultima_atualizacao
          })
          .eq('usuario_id', this.usuarioId);
      }
    } catch (error) {
      console.error('Erro ao atualizar saldo no Supabase:', error);
    }
    
    await this.salvarSaldoLocal(saldo);
  }

  // ==========================================================================
  // TRANSFERÊNCIA ENTRE USUÁRIOS (MOEDA CONECTA) - CORRIGIDO
  // ==========================================================================

  async gerarQRCodeTransferencia(valor: number, descricao?: string): Promise<QRCodeTransferencia | null> {
    if (!this.usuarioId) {
      toast.error('Usuário não identificado');
      return null;
    }

    if (valor <= 0) {
      toast.error('Valor deve ser maior que zero');
      return null;
    }

    // ✅ REMOVIDA a verificação de saldo - qualquer um pode gerar QR Code para RECEBER
    // O saldo só é verificado quando alguém PAGA (no processarQRCodeTransferencia)

    const codigo = btoa(`${this.usuarioId}|${Date.now()}|${Math.random().toString(36).substring(7)}|${valor}`);
    
    const qrData: QRCodeTransferencia = {
      codigo,
      valor,
      descricao: descricao || 'Transferência Moeda Conecta',
      expiracao: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      gerado_por: this.usuarioId,
      gerado_por_nome: this.usuarioNome || 'Usuário'
    };

    localStorage.setItem(`qr_transferencia_${codigo.substring(0, 20)}`, JSON.stringify(qrData));
    
    return qrData;
  }

  async processarQRCodeTransferencia(codigo: string): Promise<{
    success: boolean;
    message: string;
    transferencia?: { valor: number; origem: string; origem_nome: string; descricao: string };
  }> {
    if (!this.usuarioId) {
      return { success: false, message: 'Usuário não identificado' };
    }

    const chaveStorage = Object.keys(localStorage).find(key => 
      key.startsWith('qr_transferencia_') && localStorage.getItem(key)?.includes(codigo)
    );

    if (!chaveStorage) {
      return { success: false, message: 'QR Code inválido ou expirado' };
    }

    const qrData: QRCodeTransferencia = JSON.parse(localStorage.getItem(chaveStorage)!);
    
    if (new Date(qrData.expiracao) < new Date()) {
      localStorage.removeItem(chaveStorage);
      return { success: false, message: 'QR Code expirado' };
    }

    if (qrData.gerado_por === this.usuarioId) {
      return { success: false, message: 'Você não pode transferir para si mesmo' };
    }

    // ✅ VERIFICAÇÃO DE SALDO APENAS AQUI (quem está PAGANDO)
    const saldo = await this.getSaldo();
    if (qrData.valor && qrData.valor > saldo.disponivel) {
      return { success: false, message: 'Saldo insuficiente para pagamento' };
    }

    const valor = qrData.valor || 0;
    const descricao = qrData.descricao || 'Transferência Moeda Conecta';

    // Registrar saída para o pagador
    await this.registrarTransacao({
      usuario_id: this.usuarioId,
      tipo: 'transferencia',
      valor: valor,
      status: 'concluido',
      descricao: `${descricao} para ${qrData.gerado_por_nome}`,
      metodo: 'moeda_conecta',
      destinatario_id: qrData.gerado_por,
      destinatario_nome: qrData.gerado_por_nome
    });

    // Registrar entrada para o recebedor (via API)
    await fetch('/api/transferencia/receber', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinatario_id: qrData.gerado_por,
        valor,
        descricao: `${descricao} de ${this.usuarioNome || 'Usuário'}`,
        origem_id: this.usuarioId,
        origem_nome: this.usuarioNome || 'Usuário'
      })
    });

    localStorage.removeItem(chaveStorage);
    
    return {
      success: true,
      message: `Transferência de ${valor.toFixed(2)} Moedas Conecta realizada com sucesso!`,
      transferencia: {
        valor,
        origem: this.usuarioId,
        origem_nome: this.usuarioNome || 'Usuário',
        descricao
      }
    };
  }

  async receberTransferencia(dados: {
    destinatario_id: string;
    valor: number;
    descricao: string;
    origem_id: string;
    origem_nome: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transacoes')
        .insert({
          id: Date.now().toString(),
          usuario_id: dados.destinatario_id,
          tipo: 'recebimento',
          valor: dados.valor,
          status: 'concluido',
          descricao: dados.descricao,
          data: new Date().toISOString(),
          metodo: 'moeda_conecta',
          origem_id: dados.origem_id,
          origem_nome: dados.origem_nome
        });

      if (!error) {
        await this.atualizarSaldoPosTransacao({
          id: Date.now().toString(),
          usuario_id: dados.destinatario_id,
          tipo: 'recebimento',
          valor: dados.valor,
          status: 'concluido',
          descricao: dados.descricao,
          data: new Date().toISOString(),
          metodo: 'moeda_conecta',
          origem_id: dados.origem_id,
          origem_nome: dados.origem_nome
        } as Transacao);
        return true;
      }
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
    }
    return false;
  }

  // ==========================================================================
  // RECARGA PIX
  // ==========================================================================

  async gerarRecargaPIX(valorReal: number): Promise<RecargaPIX | null> {
    if (valorReal < 1) {
      toast.error('Valor mínimo para recarga é R$ 1,00');
      return null;
    }

    // Converter valor real para MC
    const valorMC = await this.converterParaMC(valorReal);

    const pixKey = process.env.PIX_KEY || 'df79fd53-2ce0-4013-b906-44f8076e28a1';
    const merchantName = process.env.PIX_MERCHANT_NAME || 'Valente Conecta';
    const merchantCity = process.env.PIX_MERCHANT_CITY || 'Valente';

    const qrCode = `00020126360014BR.GOV.BCB.PIX0114${pixKey}5204000053039865405${valorReal.toFixed(2)}5802BR5909${merchantName}6008${merchantCity}62240520RECARGA${Date.now()}6304XXXX`;
    
    const recarga: RecargaPIX = {
      id: Date.now().toString(),
      valor: valorReal,
      qr_code: qrCode,
      copia_cola: qrCode,
      expiracao: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      status: 'pendente',
      created_at: new Date().toISOString()
    };

    localStorage.setItem(`pix_recarga_${recarga.id}`, JSON.stringify(recarga));
    
    await this.registrarTransacao({
      usuario_id: this.usuarioId || 'anonimo',
      tipo: 'recarga',
      valor: valorMC,
      status: 'pendente',
      descricao: `Recarga PIX de R$ ${valorReal.toFixed(2)} (${valorMC.toFixed(2)} MC)`,
      metodo: 'pix',
      pix_qr_code: qrCode,
      pix_copia_cola: qrCode,
      metadata: { valor_real: valorReal, taxa_cambio: await this.getTaxaCambioUsuario() }
    });

    return recarga;
  }

  async confirmarPagamentoPIX(recargaId: string): Promise<boolean> {
    const recargaStr = localStorage.getItem(`pix_recarga_${recargaId}`);
    if (!recargaStr) return false;

    const recarga: RecargaPIX = JSON.parse(recargaStr);
    
    if (recarga.status !== 'pendente') {
      toast.error('Esta recarga já foi processada');
      return false;
    }

    if (new Date(recarga.expiracao) < new Date()) {
      recarga.status = 'expirado';
      localStorage.setItem(`pix_recarga_${recargaId}`, JSON.stringify(recarga));
      toast.error('QR Code expirado. Gere um novo.');
      return false;
    }

    recarga.status = 'pago';
    recarga.paid_at = new Date().toISOString();
    localStorage.setItem(`pix_recarga_${recargaId}`, JSON.stringify(recarga));

    const valorMC = await this.converterParaMC(recarga.valor);

    await this.registrarTransacao({
      usuario_id: this.usuarioId || 'anonimo',
      tipo: 'recarga',
      valor: valorMC,
      status: 'concluido',
      descricao: `Recarga PIX de R$ ${recarga.valor.toFixed(2)} confirmada (${valorMC.toFixed(2)} MC)`,
      metodo: 'pix',
      metadata: { valor_real: recarga.valor, taxa_cambio: await this.getTaxaCambioUsuario() }
    });

    this.mostrarPopupConfirmacao(recarga.valor);
    return true;
  }

  private mostrarPopupConfirmacao(valor: number): void {
    const event = new CustomEvent('pagamento_confirmado', {
      detail: { valor, mensagem: `Pagamento de R$ ${valor.toFixed(2)} confirmado!` }
    });
    window.dispatchEvent(event);
  }

  // ==========================================================================
  // DÉBITOS AUTOMÁTICOS
  // ==========================================================================

  async criarDebitoAutomatico(debito: Omit<DebitoAutomatico, 'id' | 'proxima_cobranca'>): Promise<DebitoAutomatico | null> {
    const hoje = new Date();
    const proximaCobranca = new Date(hoje.getFullYear(), hoje.getMonth(), debito.dia_cobranca);
    
    if (proximaCobranca < hoje) {
      proximaCobranca.setMonth(proximaCobranca.getMonth() + 1);
    }

    const novoDebito: DebitoAutomatico = {
      id: Date.now().toString(),
      ...debito,
      proxima_cobranca: proximaCobranca.toISOString()
    };

    try {
      if (this.usuarioId) {
        const { error } = await supabase
          .from('debitos_automaticos')
          .insert(novoDebito);

        if (!error) {
          return novoDebito;
        }
      }
    } catch (error) {
      console.error('Erro ao criar débito automático:', error);
    }

    const debitosLocal = this.getDebitosAutomaticosLocal();
    debitosLocal.push(novoDebito);
    localStorage.setItem(`debitos_automaticos_${this.usuarioId || 'anonimo'}`, JSON.stringify(debitosLocal));

    return novoDebito;
  }

  async processarDebitosAutomaticos(): Promise<void> {
    const debitos = await this.getDebitosAutomaticos();
    const hoje = new Date();

    for (const debito of debitos) {
      if (!debito.ativo) continue;
      if (!debito.proxima_cobranca) continue;

      const proximaCobranca = new Date(debito.proxima_cobranca);
      if (proximaCobranca <= hoje) {
        const saldo = await this.getSaldo();
        
        if (saldo.disponivel >= debito.valor) {
          await this.registrarTransacao({
            usuario_id: this.usuarioId || 'anonimo',
            tipo: 'debito_automatico',
            valor: debito.valor,
            status: 'concluido',
            descricao: `Débito automático - ${debito.servico}`,
            metodo: 'wallet'
          });

          const proxima = new Date(proximaCobranca);
          proxima.setMonth(proxima.getMonth() + 1);
          
          await this.atualizarDebitoAutomatico(debito.id, {
            ultima_cobranca: hoje.toISOString(),
            proxima_cobranca: proxima.toISOString()
          });

          const valorReal = await this.converterParaReal(debito.valor);
          toast.success(`💰 Débito automático: ${debito.servico} - ${debito.valor.toFixed(2)} MC (R$ ${valorReal.toFixed(2)})`);
        } else {
          toast.error(`⚠️ Saldo insuficiente para ${debito.servico}`);
          await this.notificarSaldoInsuficiente(debito);
        }
      }
    }
  }

  async getDebitosAutomaticos(): Promise<DebitoAutomatico[]> {
    try {
      if (this.usuarioId) {
        const { data, error } = await supabase
          .from('debitos_automaticos')
          .select('*')
          .eq('usuario_id', this.usuarioId)
          .eq('ativo', true);

        if (!error && data) {
          return data;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar débitos:', error);
    }

    return this.getDebitosAutomaticosLocal();
  }

  private getDebitosAutomaticosLocal(): DebitoAutomatico[] {
    const debitos = localStorage.getItem(`debitos_automaticos_${this.usuarioId || 'anonimo'}`);
    return debitos ? JSON.parse(debitos) : [];
  }

  private async atualizarDebitoAutomatico(id: string, updates: Partial<DebitoAutomatico>): Promise<void> {
    try {
      if (this.usuarioId) {
        await supabase
          .from('debitos_automaticos')
          .update(updates)
          .eq('id', id);
      }
    } catch (error) {
      console.error('Erro ao atualizar débito:', error);
    }

    const debitosLocal = this.getDebitosAutomaticosLocal();
    const index = debitosLocal.findIndex(d => d.id === id);
    if (index !== -1) {
      debitosLocal[index] = { ...debitosLocal[index], ...updates };
      localStorage.setItem(`debitos_automaticos_${this.usuarioId || 'anonimo'}`, JSON.stringify(debitosLocal));
    }
  }

  private async notificarSaldoInsuficiente(debito: DebitoAutomatico): Promise<void> {
    try {
      await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `⚠️ *SALDO INSUFICIENTE*\n\n` +
            `Serviço: ${debito.servico}\n` +
            `Valor: ${debito.valor.toFixed(2)} MC\n` +
            `Data de vencimento: ${new Date(debito.data_vencimento).toLocaleDateString()}\n\n` +
            `Recarregue seu saldo para não perder o serviço!`,
          parseMode: 'Markdown'
        })
      });
    } catch (error) {
      console.error('Erro ao notificar saldo insuficiente:', error);
    }
  }

  // ==========================================================================
  // ESTATÍSTICAS
  // ==========================================================================

  async getEstatisticas(): Promise<{
    total_gasto: number;
    total_recargas: number;
    total_cashback: number;
    total_indicacoes: number;
    media_mensal: number;
    ultimos_30_dias: number;
    total_gasto_real: number;
    saldo_real: number;
    taxa_cambio_atual: number;
  }> {
    const transacoes = await this.getTransacoes(1000);
    const agora = new Date();
    const trintaDiasAtras = new Date(agora.setDate(agora.getDate() - 30));
    const taxa = await this.getTaxaCambioUsuario();
    const saldo = await this.getSaldo();

    const estatisticas = {
      total_gasto: 0,
      total_recargas: 0,
      total_cashback: 0,
      total_indicacoes: 0,
      media_mensal: 0,
      ultimos_30_dias: 0,
      total_gasto_real: 0,
      saldo_real: saldo.disponivel * taxa,
      taxa_cambio_atual: taxa
    };

    for (const t of transacoes) {
      if (t.status !== 'concluido') continue;

      const dataTransacao = new Date(t.data);
      const valorReal = t.valor * taxa;
      
      if (dataTransacao >= trintaDiasAtras) {
        if (t.tipo === 'pagamento' || t.tipo === 'transferencia' || t.tipo === 'debito_automatico') {
          estatisticas.ultimos_30_dias += t.valor;
          estatisticas.total_gasto_real += valorReal;
        }
      }

      switch (t.tipo) {
        case 'pagamento':
        case 'transferencia':
        case 'debito_automatico':
          estatisticas.total_gasto += t.valor;
          estatisticas.total_gasto_real += valorReal;
          break;
        case 'recarga':
          estatisticas.total_recargas += t.valor;
          break;
        case 'cashback':
          estatisticas.total_cashback += t.valor;
          break;
        case 'indicacao':
          estatisticas.total_indicacoes += t.valor;
          break;
      }
    }

    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    let gastosTresMeses = 0;
    let mesesComTransacao = 0;

    for (const t of transacoes) {
      if (t.status !== 'concluido') continue;
      if ((t.tipo === 'pagamento' || t.tipo === 'transferencia' || t.tipo === 'debito_automatico') && new Date(t.data) >= tresMesesAtras) {
        gastosTresMeses += t.valor;
        mesesComTransacao++;
      }
    }

    estatisticas.media_mensal = mesesComTransacao > 0 ? gastosTresMeses / mesesComTransacao : 0;

    return estatisticas;
  }

  async pagamentoRapido(valor: number, destinatario: string, descricao: string): Promise<boolean> {
    const saldo = await this.getSaldo();
    
    if (saldo.disponivel < valor) {
      toast.error('Saldo insuficiente');
      return false;
    }

    const valorReal = await this.converterParaReal(valor);

    await this.registrarTransacao({
      usuario_id: this.usuarioId || 'anonimo',
      tipo: 'pagamento',
      valor,
      status: 'concluido',
      descricao: `${descricao} - ${destinatario} (R$ ${valorReal.toFixed(2)})`,
      metodo: 'wallet'
    });

    toast.success(`✅ Pagamento de ${valor.toFixed(2)} MC (R$ ${valorReal.toFixed(2)}) enviado para ${destinatario}`);
    return true;
  }
}

export const walletService = new WalletService();