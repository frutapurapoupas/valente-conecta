// ============================================================================
// ARQUIVO: services/cambioService.ts
// Funcionalidade: Gerenciar taxas de câmbio da Moeda Conecta (MC) por cidade
// 1 MC = X Reais (configurável por cidade)
// ============================================================================

import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export interface CambioConfig {
  id: string;
  cidade: string;
  estado: string;
  taxa_cambio: number;      // 1 MC = X Reais
  taxa_compra: number;      // Taxa de compra (opcional)
  taxa_venda: number;       // Taxa de venda (opcional)
  atualizado_em: string;
  atualizado_por: string;
  ativo: boolean;
}

export interface Cidade {
  id: string;
  nome: string;
  estado: string;
  regiao: string;
  ativo: boolean;
}

class CambioService {
  private cache: Map<string, CambioConfig> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutos
  private lastFetch: Map<string, number> = new Map();

  // ==========================================================================
  // BUSCAR CÂMBIO POR CIDADE
  // ==========================================================================

  async getCambioPorCidade(cidade: string): Promise<CambioConfig | null> {
    // Verificar cache
    const lastFetchTime = this.lastFetch.get(cidade);
    if (lastFetchTime && Date.now() - lastFetchTime < this.cacheTimeout) {
      const cached = this.cache.get(cidade);
      if (cached) return cached;
    }

    try {
      const { data, error } = await supabase
        .from('configuracoes_cambio')
        .select('*')
        .eq('cidade', cidade)
        .eq('ativo', true)
        .single();

      if (!error && data) {
        // Atualizar cache
        this.cache.set(cidade, data);
        this.lastFetch.set(cidade, Date.now());
        return data;
      }
    } catch (error) {
      console.error(`Erro ao buscar câmbio para ${cidade}:`, error);
    }

    // Fallback: taxa padrão 1.0
    return {
      id: 'default',
      cidade: cidade,
      estado: 'BA',
      taxa_cambio: 1.0,
      taxa_compra: 1.0,
      taxa_venda: 1.0,
      atualizado_em: new Date().toISOString(),
      atualizado_por: 'sistema',
      ativo: true
    };
  }

  async getCambioPorUsuario(usuarioId: string): Promise<CambioConfig | null> {
    try {
      // Buscar cidade base do usuário
      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('cidade_base')
        .eq('id', usuarioId)
        .single();

      if (userError) throw userError;

      const cidade = user?.cidade_base || 'Valente';
      return await this.getCambioPorCidade(cidade);
    } catch (error) {
      console.error('Erro ao buscar câmbio do usuário:', error);
      return await this.getCambioPorCidade('Valente');
    }
  }

  // ==========================================================================
  // CONVERSÃO DE VALORES
  // ==========================================================================

  async converterMCparaReal(mc: number, cidade: string): Promise<number> {
    const cambio = await this.getCambioPorCidade(cidade);
    return mc * (cambio?.taxa_cambio || 1.0);
  }

  async converterRealparaMC(real: number, cidade: string): Promise<number> {
    const cambio = await this.getCambioPorCidade(cidade);
    return real / (cambio?.taxa_cambio || 1.0);
  }

  async converterMCparaRealUsuario(mc: number, usuarioId: string): Promise<number> {
    const cambio = await this.getCambioPorUsuario(usuarioId);
    return mc * (cambio?.taxa_cambio || 1.0);
  }

  // ==========================================================================
  // ADMIN: GERENCIAR CÂMBIO
  // ==========================================================================

  async getAllCambios(): Promise<CambioConfig[]> {
    try {
      const { data, error } = await supabase
        .from('configuracoes_cambio')
        .select('*')
        .order('cidade');

      if (!error && data) {
        return data;
      }
    } catch (error) {
      console.error('Erro ao buscar todas configurações:', error);
    }
    return [];
  }

  async atualizarCambio(
    cidade: string,
    taxa_cambio: number,
    usuarioAdminId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('configuracoes_cambio')
        .update({
          taxa_cambio: taxa_cambio,
          taxa_compra: taxa_cambio,
          taxa_venda: taxa_cambio,
          atualizado_em: new Date().toISOString(),
          atualizado_por: usuarioAdminId
        })
        .eq('cidade', cidade);

      if (error) throw error;

      // Limpar cache
      this.cache.delete(cidade);
      this.lastFetch.delete(cidade);

      toast.success(`Câmbio de ${cidade} atualizado para 1 MC = R$ ${taxa_cambio.toFixed(4)}`);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar câmbio:', error);
      toast.error('Erro ao atualizar câmbio');
      return false;
    }
  }

  async adicionarCidade(
    nome: string,
    estado: string,
    regiao: string,
    taxa_cambio: number = 1.0
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cidades')
        .insert({
          nome,
          estado,
          regiao,
          ativo: true
        });

      if (error) throw error;

      // Adicionar configuração de câmbio para a nova cidade
      const { error: cambioError } = await supabase
        .from('configuracoes_cambio')
        .insert({
          cidade: nome,
          estado,
          taxa_cambio,
          taxa_compra: taxa_cambio,
          taxa_venda: taxa_cambio,
          ativo: true
        });

      if (cambioError) throw cambioError;

      toast.success(`Cidade ${nome} adicionada com sucesso!`);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar cidade:', error);
      toast.error('Erro ao adicionar cidade');
      return false;
    }
  }

  async getAllCidades(): Promise<Cidade[]> {
    try {
      const { data, error } = await supabase
        .from('cidades')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (!error && data) {
        return data;
      }
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
    return [];
  }

  // ==========================================================================
  // ESTATÍSTICAS
  // ==========================================================================

  async getEstatisticas(): Promise<{
    totalCidades: number;
    taxaMedia: number;
    taxaMin: number;
    taxaMax: number;
    ultimaAtualizacao: string;
  }> {
    const cambios = await this.getAllCambios();
    const taxas = cambios.map(c => c.taxa_cambio);
    
    return {
      totalCidades: cambios.length,
      taxaMedia: taxas.reduce((a, b) => a + b, 0) / taxas.length,
      taxaMin: Math.min(...taxas),
      taxaMax: Math.max(...taxas),
      ultimaAtualizacao: new Date().toLocaleString()
    };
  }
}

export const cambioService = new CambioService();



