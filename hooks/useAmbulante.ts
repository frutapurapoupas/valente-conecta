// hooks/useAmbulante.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase, isMockMode } from '@/lib/supabase-client-switch';

export interface Ambulante {
  id: string;
  userId: string;
  nome: string;
  nomeFantasia: string;
  cpf?: string;
  cnpj?: string;
  fotoPerfil?: string;
  categoria: string;
  descricao: string;
  telefone: string;
  whatsapp: string;
  email: string;
  localizacao: {
    lat: number;
    lng: number;
    endereco: string;
    bairro: string;
    cidade: string;
    pontoReferencia?: string;
  };
  documentacaoVerificada: boolean;
  estaOnline: boolean;
  ultimaAtualizacao: Date;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  totalVendas: number;
  createdAt: Date;
}

export interface ProdutoAmbulante {
  id: string;
  ambulanteId: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  fotos: string[];
  disponivel: boolean;
  estoque?: number;
  avaliacaoMedia?: number;
  totalAvaliacoes?: number;
  createdAt: Date;
}

export interface AvaliacaoAmbulante {
  id: string;
  ambulanteId: string;
  usuarioId: string;
  usuarioNome: string;
  nota: number;
  comentario: string;
  data: Date;
}

export interface PedidoAmbulante {
  id: string;
  ambulanteId: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEndereco: string;
  itens: { produtoId: string; produtoNome: string; quantidade: number; preco: number }[];
  total: number;
  status: 'pendente' | 'confirmado' | 'preparando' | 'saiu_entrega' | 'entregue' | 'cancelado';
  formaPagamento: 'dinheiro' | 'pix' | 'cartao';
  trocoPara?: number;
  observacao?: string;
  dataPedido: Date;
  dataEntrega?: Date;
}

export const useAmbulante = (ambulanteId?: string) => {
  const [ambulante, setAmbulante] = useState<Ambulante | null>(null);
  const [produtos, setProdutos] = useState<ProdutoAmbulante[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoAmbulante[]>([]);
  const [pedidos, setPedidos] = useState<PedidoAmbulante[]>([]);
  const [loading, setLoading] = useState(true);
  const [ambulantesProximos, setAmbulantesProximos] = useState<Ambulante[]>([]);

  // Buscar dados do ambulante
  const fetchAmbulante = useCallback(async () => {
    if (!ambulanteId) return;
    
    setLoading(true);
    if (isMockMode()) {
      console.log('🛺 Usando dados MOCK para Ambulantes');
      setAmbulante(null);
      setProdutos([]);
      setAvaliacoes([]);
    } else {
      try {
        const [ambulanteRes, produtosRes, avaliacoesRes] = await Promise.all([
          supabase.from('ambulantes').select('*').eq('id', ambulanteId).single(),
          supabase.from('produtos_ambulante').select('*').eq('ambulante_id', ambulanteId),
          supabase.from('avaliacoes_ambulante').select('*').eq('ambulante_id', ambulanteId).order('data', { ascending: false }),
        ]);
        
        if (ambulanteRes.data) setAmbulante(ambulanteRes.data);
        if (produtosRes.data) setProdutos(produtosRes.data);
        if (avaliacoesRes.data) setAvaliacoes(avaliacoesRes.data);
      } catch (error) {
        console.error('Erro ao buscar ambulante:', error);
      }
    }
    setLoading(false);
  }, [ambulanteId]);

  useEffect(() => {
    fetchAmbulante();
  }, [fetchAmbulante]);

  // Buscar ambulantes próximos
  const buscarAmbulantesProximos = useCallback(async (lat: number, lng: number, raioKm: number = 5) => {
    if (isMockMode()) {
      setAmbulantesProximos([]);
      return [];
    }
    
    // Implementar busca por proximidade usando PostGIS ou cálculo manual
    try {
      const { data, error } = await supabase.rpc('ambulantes_proximos', {
        lat_origem: lat,
        lng_origem: lng,
        raio_km: raioKm,
      });
      if (error) throw error;
      setAmbulantesProximos(data || []);
      return data;
    } catch (error) {
      console.error('Erro ao buscar ambulantes próximos:', error);
      return [];
    }
  }, [ambulanteId]);

  // CRUD Produtos
  const criarProduto = async (produto: Omit<ProdutoAmbulante, 'id' | 'createdAt'>) => {
    if (!ambulanteId) throw new Error('Ambulante não identificado');
    
    const novoProduto = {
      ...produto,
      ambulanteId,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    if (isMockMode()) {
      setProdutos(prev => [...prev, novoProduto]);
      return novoProduto;
    }

    const { data, error } = await supabase
      .from('produtos_ambulante')
      .insert(produto)
      .select()
      .single();
    if (error) throw error;
    setProdutos(prev => [...prev, data]);
    return data;
  };

  const atualizarProduto = async (produtoId: string, updates: Partial<ProdutoAmbulante>) => {
    if (isMockMode()) {
      setProdutos(prev => prev.map(p => p.id === produtoId ? { ...p, ...updates } : p));
      return;
    }

    const { error } = await supabase
      .from('produtos_ambulante')
      .update(updates)
      .eq('id', produtoId);
    if (error) throw error;
    setProdutos(prev => prev.map(p => p.id === produtoId ? { ...p, ...updates } : p));
  };

  const deletarProduto = async (produtoId: string) => {
    if (isMockMode()) {
      setProdutos(prev => prev.filter(p => p.id !== produtoId));
      return;
    }

    const { error } = await supabase
      .from('produtos_ambulante')
      .delete()
      .eq('id', produtoId);
    if (error) throw error;
    setProdutos(prev => prev.filter(p => p.id !== produtoId));
  };

  // Upload de fotos
  const uploadFotoProduto = async (produtoId: string, file: File): Promise<string> => {
    if (isMockMode()) {
      // Simular upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      return URL.createObjectURL(file);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${produtoId}/${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('produtos-ambulante')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('produtos-ambulante')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  };

  // Gerenciar status online/offline
  const atualizarStatusOnline = async (online: boolean) => {
    if (isMockMode()) {
      setAmbulante(prev => prev ? { ...prev, estaOnline: online, ultimaAtualizacao: new Date() } : null);
      return;
    }

    const { error } = await supabase
      .from('ambulantes')
      .update({ esta_online: online, ultima_atualizacao: new Date() })
      .eq('id', ambulanteId);
    if (error) throw error;
    setAmbulante(prev => prev ? { ...prev, estaOnline: online, ultimaAtualizacao: new Date() } : null);
  };

  // Receber novo pedido
  const receberPedido = async (pedido: Omit<PedidoAmbulante, 'id' | 'dataPedido'>) => {
    const novoPedido = {
      ...pedido,
      id: Date.now().toString(),
      dataPedido: new Date(),
    };

    if (isMockMode()) {
      setPedidos(prev => [novoPedido, ...prev]);
      return novoPedido;
    }

    const { data, error } = await supabase
      .from('pedidos_ambulante')
      .insert(pedido)
      .select()
      .single();
    if (error) throw error;
    setPedidos(prev => [data, ...prev]);
    return data;
  };

  const atualizarStatusPedido = async (pedidoId: string, status: PedidoAmbulante['status']) => {
    if (isMockMode()) {
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status } : p));
      return;
    }

    const { error } = await supabase
      .from('pedidos_ambulante')
      .update({ status })
      .eq('id', pedidoId);
    if (error) throw error;
    setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status } : p));
  };

  // Adicionar avaliação
  const adicionarAvaliacao = async (avaliacao: Omit<AvaliacaoAmbulante, 'id' | 'data'>) => {
    const novaAvaliacao = {
      ...avaliacao,
      id: Date.now().toString(),
      data: new Date(),
    };

    if (isMockMode()) {
      setAvaliacoes(prev => [novaAvaliacao, ...prev]);
      // Recalcular média
      const todasNotas = [...avaliacoes, novaAvaliacao].map(a => a.nota);
      const novaMedia = todasNotas.reduce((s, n) => s + n, 0) / todasNotas.length;
      setAmbulante(prev => prev ? { ...prev, avaliacaoMedia: novaMedia, totalAvaliacoes: todasNotas.length } : null);
      return novaAvaliacao;
    }

    const { data, error } = await supabase
      .from('avaliacoes_ambulante')
      .insert(avaliacao)
      .select()
      .single();
    if (error) throw error;
    setAvaliacoes(prev => [data, ...prev]);
    
    // Recalcular média no backend
    const { data: mediaData } = await supabase.rpc('calcular_media_ambulante', { ambulante_id: ambulanteId });
    if (mediaData) {
      setAmbulante(prev => prev ? { ...prev, avaliacaoMedia: mediaData.media, totalAvaliacoes: mediaData.total } : null);
    }
    
    return data;
  };

  // Estatísticas
  const getEstatisticas = useCallback(() => {
    const pedidosMes = pedidos.filter(p => {
      const dataPedido = new Date(p.dataPedido);
      const agora = new Date();
      return dataPedido.getMonth() === agora.getMonth() && dataPedido.getFullYear() === agora.getFullYear();
    });

    const totalVendasMes = pedidosMes.reduce((sum, p) => sum + p.total, 0);
    const pedidosHoje = pedidos.filter(p => {
      const dataPedido = new Date(p.dataPedido);
      const hoje = new Date();
      return dataPedido.toDateString() === hoje.toDateString();
    });

    const mediaAvaliacao = avaliacoes.length > 0
      ? avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length
      : 0;

    return {
      totalProdutos: produtos.length,
      produtosDisponiveis: produtos.filter(p => p.disponivel).length,
      totalPedidos: pedidos.length,
      pedidosPendentes: pedidos.filter(p => p.status === 'pendente').length,
      pedidosHoje: pedidosHoje.length,
      totalVendasMes,
      mediaAvaliacao,
      totalAvaliacoes: avaliacoes.length,
    };
  }, [produtos, pedidos, avaliacoes]);

  return {
    ambulante,
    produtos,
    avaliacoes,
    pedidos,
    loading,
    ambulantesProximos,
    fetchAmbulante,
    buscarAmbulantesProximos,
    criarProduto,
    atualizarProduto,
    deletarProduto,
    uploadFotoProduto,
    atualizarStatusOnline,
    receberPedido,
    atualizarStatusPedido,
    adicionarAvaliacao,
    getEstatisticas,
  };
};