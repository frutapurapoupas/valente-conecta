// hooks/useMultiCidade.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase, isMockMode } from '@/lib/supabase-client-switch';

export interface Cidade {
  id: string;
  nome: string;
  estado: string;
  populacao: number;
  ativo: boolean;
  dataAtivacao: Date;
  prefixoAplicativo: string;
  coordenadas?: { lat: number; lng: number };
}

export interface ConfiguracaoCidade {
  cidadeId: string;
  precoDesbloqueioOutrasCidades: number;
  diasDesbloqueio: number;
  percentualTaxaTransacao: number;
  limiteConsultasGratuitas: number;
  limiteFotosPorProduto: number;
  manutencaoAtiva: boolean;
  mensagemManutencao?: string;
}

export interface EstatisticasCidade {
  cidadeId: string;
  cidadeNome: string;
  totalUsuarios: number;
  usuariosAtivos: number;
  totalEmpresas: number;
  totalProfissionais: number;
  totalTransacoes: number;
  volumeTotal: number;
  taxaCrescimento: number;
  avaliacaoMedia: number;
}

export const useMultiCidade = () => {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [cidadeAtual, setCidadeAtual] = useState<string>('');
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoCidade[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasCidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultimaCidadeSelecionada, setUltimaCidadeSelecionada] = useState<string>('');

  // Buscar todas as cidades
  const fetchCidades = useCallback(async () => {
    setLoading(true);
    if (isMockMode()) {
      console.log('🏙️ Usando dados MOCK para Multi-cidades');
      const mockCidades: Cidade[] = [
        {
          id: '1',
          nome: 'Valente',
          estado: 'BA',
          populacao: 25000,
          ativo: true,
          dataAtivacao: new Date(2024, 0, 1),
          prefixoAplicativo: 'Valente Conecta',
          coordenadas: { lat: -11.4092, lng: -39.4685 },
        },
        {
          id: '2',
          nome: 'Conceição do Coité',
          estado: 'BA',
          populacao: 62000,
          ativo: true,
          dataAtivacao: new Date(2024, 1, 15),
          prefixoAplicativo: 'Coité Conecta',
          coordenadas: { lat: -11.5667, lng: -39.2833 },
        },
        {
          id: '3',
          nome: 'Santa Luiz',
          estado: 'BA',
          populacao: 18000,
          ativo: true,
          dataAtivacao: new Date(2024, 2, 10),
          prefixoAplicativo: 'Santa Luiz Conecta',
          coordenadas: { lat: -11.8167, lng: -39.2167 },
        },
        {
          id: '4',
          nome: 'São Domingos',
          estado: 'BA',
          populacao: 12000,
          ativo: false,
          dataAtivacao: new Date(2024, 3, 1),
          prefixoAplicativo: 'São Domingos Conecta',
          coordenadas: { lat: -11.5, lng: -39.5333 },
        },
      ];
      setCidades(mockCidades);
      
      const mockConfiguracoes: ConfiguracaoCidade[] = [
        {
          cidadeId: '1',
          precoDesbloqueioOutrasCidades: 30,
          diasDesbloqueio: 30,
          percentualTaxaTransacao: 2.5,
          limiteConsultasGratuitas: 5,
          limiteFotosPorProduto: 2,
          manutencaoAtiva: false,
        },
        {
          cidadeId: '2',
          precoDesbloqueioOutrasCidades: 30,
          diasDesbloqueio: 30,
          percentualTaxaTransacao: 2.5,
          limiteConsultasGratuitas: 5,
          limiteFotosPorProduto: 2,
          manutencaoAtiva: false,
        },
        {
          cidadeId: '3',
          precoDesbloqueioOutrasCidades: 30,
          diasDesbloqueio: 30,
          percentualTaxaTransacao: 2.5,
          limiteConsultasGratuitas: 5,
          limiteFotosPorProduto: 2,
          manutencaoAtiva: false,
        },
        {
          cidadeId: '4',
          precoDesbloqueioOutrasCidades: 30,
          diasDesbloqueio: 30,
          percentualTaxaTransacao: 2.5,
          limiteConsultasGratuitas: 5,
          limiteFotosPorProduto: 2,
          manutencaoAtiva: true,
          mensagemManutencao: 'Cidade em fase de ativação. Em breve!',
        },
      ];
      setConfiguracoes(mockConfiguracoes);
      
      const mockEstatisticas: EstatisticasCidade[] = [
        {
          cidadeId: '1',
          cidadeNome: 'Valente',
          totalUsuarios: 8750,
          usuariosAtivos: 5200,
          totalEmpresas: 320,
          totalProfissionais: 180,
          totalTransacoes: 12450,
          volumeTotal: 875000,
          taxaCrescimento: 12.5,
          avaliacaoMedia: 4.7,
        },
        {
          cidadeId: '2',
          cidadeNome: 'Conceição do Coité',
          totalUsuarios: 18600,
          usuariosAtivos: 11200,
          totalEmpresas: 580,
          totalProfissionais: 320,
          totalTransacoes: 22300,
          volumeTotal: 1560000,
          taxaCrescimento: 8.2,
          avaliacaoMedia: 4.5,
        },
        {
          cidadeId: '3',
          cidadeNome: 'Santa Luiz',
          totalUsuarios: 5400,
          usuariosAtivos: 3200,
          totalEmpresas: 150,
          totalProfissionais: 85,
          totalTransacoes: 6850,
          volumeTotal: 412000,
          taxaCrescimento: 15.3,
          avaliacaoMedia: 4.6,
        },
      ];
      setEstatisticas(mockEstatisticas);
    } else {
      try {
        const [cidadesRes, configRes, statsRes] = await Promise.all([
          supabase.from('cidades').select('*').order('nome'),
          supabase.from('configuracoes_cidade').select('*'),
          supabase.rpc('get_estatisticas_cidades'),
        ]);
        if (cidadesRes.data) setCidades(cidadesRes.data);
        if (configRes.data) setConfiguracoes(configRes.data);
        if (statsRes.data) setEstatisticas(statsRes.data);
      } catch (error) {
        console.error('Erro ao buscar dados das cidades:', error);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCidades();
    
    // Recuperar última cidade selecionada do localStorage
    const ultimaCidade = localStorage.getItem('ultimaCidadeSelecionada');
    if (ultimaCidade && cidades.find(c => c.id === ultimaCidade)) {
      setCidadeAtual(ultimaCidade);
    } else if (cidades.length > 0) {
      setCidadeAtual(cidades[0].id);
    }
  }, []);

  // Salvar seleção de cidade
  const selecionarCidade = useCallback((cidadeId: string) => {
    const cidade = cidades.find(c => c.id === cidadeId);
    if (cidade && cidade.ativo) {
      setCidadeAtual(cidadeId);
      setUltimaCidadeSelecionada(cidadeId);
      localStorage.setItem('ultimaCidadeSelecionada', cidadeId);
      localStorage.setItem('prefixoAplicativo', cidade.prefixoAplicativo);
      return true;
    }
    return false;
  }, [cidades]);

  // Obter cidade atual
  const getCidadeAtual = useCallback(() => {
    return cidades.find(c => c.id === cidadeAtual);
  }, [cidades, cidadeAtual]);

  // Obter configurações da cidade atual
  const getConfiguracoesCidadeAtual = useCallback(() => {
    return configuracoes.find(c => c.cidadeId === cidadeAtual);
  }, [configuracoes, cidadeAtual]);

  // Obter estatísticas de uma cidade
  const getEstatisticasCidade = useCallback((cidadeId: string) => {
    return estatisticas.find(e => e.cidadeId === cidadeId);
  }, [estatisticas]);

  // Verificar se usuário pode acessar outra cidade
  const verificarAcessoCidade = useCallback(async (usuarioId: string, cidadeDestinoId: string) => {
    if (isMockMode()) {
      // Simular verificação
      const desbloqueios: any[] = [];
      const desbloqueioAtivo = desbloqueios.find(d => 
        d.cidadeId === cidadeDestinoId && new Date(d.dataValidade) > new Date()
      );
      return { acessivel: !!desbloqueioAtivo, desbloqueioAtivo };
    }

    try {
      const { data, error } = await supabase.rpc('verificar_acesso_cidade', {
        p_usuario_id: usuarioId,
        p_cidade_id: cidadeDestinoId,
      });
      if (error) throw error;
      return { acessivel: data.acessivel, desbloqueioAtivo: data.desbloqueio };
    } catch (error) {
      console.error('Erro ao verificar acesso à cidade:', error);
      return { acessivel: false, desbloqueioAtivo: null };
    }
  }, []);

  // Comprar desbloqueio para outra cidade
  const comprarDesbloqueioCidade = useCallback(async (
    usuarioId: string, 
    cidadeDestinoId: string,
    formaPagamento: 'pix' | 'cartao'
  ) => {
    const config = configuracoes.find(c => c.cidadeId === cidadeDestinoId);
    if (!config) throw new Error('Configuração da cidade não encontrada');
    
    const valor = config.precoDesbloqueioOutrasCidades;
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + config.diasDesbloqueio);
    
    if (isMockMode()) {
      console.log(`💳 Compra de desbloqueio para cidade ${cidadeDestinoId}: R$ ${valor}`);
      return {
        sucesso: true,
        desbloqueio: {
          id: Date.now().toString(),
          usuarioId,
          cidadeId: cidadeDestinoId,
          dataCompra: new Date(),
          dataValidade,
          valorPago: valor,
        },
      };
    }
    
    try {
      const { data, error } = await supabase.rpc('comprar_desbloqueio_cidade', {
        p_usuario_id: usuarioId,
        p_cidade_id: cidadeDestinoId,
        p_forma_pagamento: formaPagamento,
        p_valor_pago: valor,
        p_data_validade: dataValidade.toISOString(),
      });
      if (error) throw error;
      return { sucesso: true, desbloqueio: data };
    } catch (error) {
      console.error('Erro ao comprar desbloqueio:', error);
      return { sucesso: false, error };
    }
  }, [configuracoes]);

  // Atualizar configurações da cidade (Admin Master)
  const atualizarConfiguracoesCidade = useCallback(async (
    cidadeId: string,
    novasConfiguracoes: Partial<ConfiguracaoCidade>
  ) => {
    if (isMockMode()) {
      setConfiguracoes(prev =>
        prev.map(c =>
          c.cidadeId === cidadeId ? { ...c, ...novasConfiguracoes } : c
        )
      );
      return true;
    }
    
    try {
      const { error } = await supabase
        .from('configuracoes_cidade')
        .update(novasConfiguracoes)
        .eq('cidade_id', cidadeId);
      if (error) throw error;
      setConfiguracoes(prev =>
        prev.map(c =>
          c.cidadeId === cidadeId ? { ...c, ...novasConfiguracoes } : c
        )
      );
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return false;
    }
  }, []);

  // Ativar/desativar cidade
  const ativarCidade = useCallback(async (cidadeId: string, ativo: boolean) => {
    if (isMockMode()) {
      setCidades(prev =>
        prev.map(c =>
          c.id === cidadeId ? { ...c, ativo } : c
        )
      );
      return true;
    }
    
    try {
      const { error } = await supabase
        .from('cidades')
        .update({ ativo, dataAtivacao: ativo ? new Date() : new Date(0) })
        .eq('id', cidadeId);
      if (error) throw error;
      setCidades(prev =>
        prev.map(c =>
          c.id === cidadeId ? { ...c, ativo } : c
        )
      );
      return true;
    } catch (error) {
      console.error('Erro ao alterar status da cidade:', error);
      return false;
    }
  }, []);

  // Obter ranking de cidades
  const getRankingCidades = useCallback((tipo: 'usuarios' | 'transacoes' | 'crescimento') => {
    return [...estatisticas].sort((a, b) => {
      if (tipo === 'usuarios') return b.totalUsuarios - a.totalUsuarios;
      if (tipo === 'transacoes') return b.totalTransacoes - a.totalTransacoes;
      return b.taxaCrescimento - a.taxaCrescimento;
    });
  }, [estatisticas]);

  // Resumo completo para dashboard
  const getResumoCompleto = useCallback(() => {
    const cidadesAtivas = cidades.filter(c => c.ativo);
    const statsAtivas = estatisticas.filter(e => 
      cidadesAtivas.some(c => c.id === e.cidadeId)
    );

    return {
      totalCidades: cidades.length,
      cidadesAtivas: cidadesAtivas.length,
      totalUsuarios: statsAtivas.reduce((s, e) => s + e.totalUsuarios, 0),
      usuariosAtivos: statsAtivas.reduce((s, e) => s + e.usuariosAtivos, 0),
      totalEmpresas: statsAtivas.reduce((s, e) => s + e.totalEmpresas, 0),
      volumeTotal: statsAtivas.reduce((s, e) => s + e.volumeTotal, 0),
      mediaAvaliacao: statsAtivas.reduce((s, e) => s + e.avaliacaoMedia, 0) / (statsAtivas.length || 1),
      crescimentoMedio: statsAtivas.reduce((s, e) => s + e.taxaCrescimento, 0) / (statsAtivas.length || 1),
    };
  }, [cidades, estatisticas]);

  return {
    cidades,
    cidadeAtual,
    loading,
    selecionarCidade,
    getCidadeAtual,
    getConfiguracoesCidadeAtual,
    getEstatisticasCidade,
    verificarAcessoCidade,
    comprarDesbloqueioCidade,
    atualizarConfiguracoesCidade,
    ativarCidade,
    getRankingCidades,
    getResumoCompleto,
    refresh: fetchCidades,
  };
};