// ============================================================================
// ARQUIVO 5: services/buscaInteligenteService.ts
// Funcionalidade: Busca inteligente com geolocalização,
// fallback: Mercado Livre + SearXNG (Google/Bing/DuckDuckGo)
// ============================================================================

import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export interface BuscaPendente {
  id: string;
  termo: string;
  usuario_id?: string;
  usuario_nome: string;
  usuario_email: string;
  usuario_telefone?: string;
  tipo: 'produto' | 'servico';
  categoria?: string;
  localizacao?: {
    lat: number;
    lng: number;
    cidade: string;
    estado: string;
  };
  raio_busca: number;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  data_busca: string;
  data_resposta?: string;
  data_notificacao?: string;
  fornecedor_convidado?: string;
  fornecedor_resposta?: string;
  produto_sugerido?: {
    nome: string;
    preco: number;
    link: string;
    loja: string;
    imagem?: string;
    avaliacao?: number;
  };
  notificado_usuario: boolean;
  usuario_respondeu: boolean;
  prioridade: 'alta' | 'media' | 'baixa';
}

export interface ResultadoBuscaExterna {
  id: string;
  nome: string;
  preco: number;
  loja: string;
  link: string;
  imagem?: string;
  avaliacao?: number;
  distancia?: number;
  frete?: number;
  fonte: 'mercadolivre' | 'searxng';
}

export interface SugestaoAutocomplete {
  id: string;
  texto: string;
  tipo: 'produto' | 'servico' | 'categoria';
  popularidade: number;
}

// Instâncias públicas do SearXNG (Meta Search - Google/Bing/DuckDuckGo)
const SEARXNG_INSTANCES = [
  'https://searx.be',
  'https://search.bus-hit.me',
  'https://searx.tiekoetter.com',
  'https://searx.work',
  'https://searx.space'
];

class BuscaInteligenteService {
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || '';
  private readonly RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

  // ==========================================================================
  // ARMAZENAMENTO LOCAL (FALLBACK)
  // ==========================================================================

  private salvarLocal<T>(chave: string, dados: T): void {
    try {
      localStorage.setItem(chave, JSON.stringify(dados));
    } catch (error) {
      console.error(`Erro ao salvar ${chave}:`, error);
    }
  }

  private carregarLocal<T>(chave: string, padrao: T): T {
    try {
      const dados = localStorage.getItem(chave);
      if (dados) {
        return JSON.parse(dados);
      }
    } catch (error) {
      console.error(`Erro ao carregar ${chave}:`, error);
    }
    return padrao;
  }

  // ==========================================================================
  // AUTOMCOMPLETAR E SUGESTÕES
  // ==========================================================================

  async getSugestoes(termo: string, limit: number = 10): Promise<SugestaoAutocomplete[]> {
    if (!termo.trim() || termo.length < 2) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .rpc('buscar_sugestoes', { 
          search_term: termo.toLowerCase(),
          result_limit: limit 
        });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões do Supabase:', error);
    }

    const sugestoesFixas = this.getSugestoesSimuladas(termo);
    return sugestoesFixas.slice(0, limit);
  }

  private getSugestoesSimuladas(termo: string): SugestaoAutocomplete[] {
    const categorias = [
      { nome: 'Alimentação', icone: '🍔' },
      { nome: 'Academia', icone: '💪' },
      { nome: 'Moto Táxi', icone: '🏍️' },
      { nome: 'Mercado', icone: '🏪' },
      { nome: 'Farmácia', icone: '💊' },
      { nome: 'Pet Shop', icone: '🐕' }
    ];

    const produtos = [
      'pneu', 'bicicleta', 'celular', 'notebook', 'fone', 'carregador',
      'camisa', 'calça', 'tênis', 'óculos', 'relógio', 'mochila'
    ];

    const sugestoes: SugestaoAutocomplete[] = [];

    categorias.forEach((cat, idx) => {
      if (cat.nome.toLowerCase().includes(termo.toLowerCase()) || termo.length < 3) {
        sugestoes.push({
          id: `cat_${idx}`,
          texto: cat.nome,
          tipo: 'categoria',
          popularidade: 100 - idx * 10
        });
      }
    });

    produtos.forEach((prod, idx) => {
      if (prod.includes(termo.toLowerCase()) || termo.length < 2) {
        sugestoes.push({
          id: `prod_${idx}`,
          texto: `${prod} em ${categorias[idx % categorias.length].nome}`,
          tipo: 'produto',
          popularidade: 80 - idx * 5
        });
      }
    });

    return sugestoes.sort((a, b) => b.popularidade - a.popularidade);
  }

  // ==========================================================================
  // BUSCA POR GEOLOCALIZAÇÃO E PROXIMIDADE
  // ==========================================================================

  async buscarPorProximidade(
    termo: string,
    lat: number,
    lng: number,
    raioKm: number = 5
  ): Promise<ResultadoBuscaExterna[]> {
    try {
      const { data, error } = await supabase
        .rpc('buscar_proximos', {
          search_term: termo.toLowerCase(),
          user_lat: lat,
          user_lng: lng,
          radius_km: raioKm
        });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.error('Erro ao buscar por proximidade:', error);
    }

    return this.simularResultadosProximos(termo);
  }

  private simularResultadosProximos(termo: string): ResultadoBuscaExterna[] {
    const lojas = [
      { nome: 'Mercearia do João', distancia: 0.3, avaliacao: 4.5 },
      { nome: 'Farmácia Central', distancia: 0.7, avaliacao: 4.2 },
      { nome: 'Academia Fitness', distancia: 1.2, avaliacao: 4.8 },
      { nome: 'Moto Táxi Express', distancia: 0.5, avaliacao: 4.6 }
    ];

    return lojas.map((loja, idx) => ({
      id: `local_${idx}`,
      nome: termo,
      preco: Math.floor(Math.random() * 100) + 10,
      loja: loja.nome,
      link: `/loja/${loja.nome.toLowerCase().replace(/\s/g, '-')}`,
      avaliacao: loja.avaliacao,
      distancia: loja.distancia,
      fonte: 'mercadolivre'
    }));
  }

  // ==========================================================================
  // BUSCA MERCADO LIVRE (API PÚBLICA - SEM CHAVE)
  // ==========================================================================

  async buscarMercadoLivre(termo: string): Promise<ResultadoBuscaExterna[]> {
    try {
      const response = await fetch(
        `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(termo)}&limit=5`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.results.map((item: any) => ({
          id: `ml_${item.id}`,
          nome: item.title.length > 60 ? item.title.substring(0, 60) + '...' : item.title,
          preco: item.price,
          loja: item.seller?.nickname || 'Mercado Livre',
          link: item.permalink,
          imagem: item.thumbnail,
          avaliacao: item.rating?.average || 0,
          frete: item.shipping?.free_shipping ? 0 : item.shipping?.price || 0,
          fonte: 'mercadolivre'
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar no Mercado Livre:', error);
    }
    return [];
  }

  // ==========================================================================
  // BUSCA SEARXNG (Google, Bing, DuckDuckGo - SEM API KEY)
  // ==========================================================================

  private extrairPrecoDoTexto(texto: string): number {
    const match = texto.match(/R?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);
    if (match) {
      return parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
    }
    return 0;
  }

  private extrairDominio(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '').split('.')[0];
    } catch {
      return 'Site';
    }
  }

  async buscarSearXNG(termo: string): Promise<ResultadoBuscaExterna[]> {
    for (const instance of SEARXNG_INSTANCES) {
      try {
        const url = `${instance}/search?q=${encodeURIComponent(termo)}&format=json&categories=general&language=pt`;
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ValenteConecta/1.0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            return data.results.slice(0, 5).map((item: any, idx: number) => ({
              id: `searxng_${idx}`,
              nome: item.title?.length > 60 ? item.title.substring(0, 60) + '...' : item.title || termo,
              preco: this.extrairPrecoDoTexto(item.content || ''),
              loja: this.extrairDominio(item.url),
              link: item.url,
              imagem: item.img_src || item.thumbnail || `https://www.google.com/s2/favicons?domain=${this.extrairDominio(item.url)}`,
              avaliacao: 0,
              frete: 0,
              fonte: 'searxng'
            }));
          }
        }
      } catch (error) {
        console.error(`Erro na instância SearXNG ${instance}:`, error);
        continue;
      }
    }
    return [];
  }

  // ==========================================================================
  // BUSCA PRINCIPAL (COM FALLBACKS)
  // ==========================================================================

  async buscarNaInternet(termo: string): Promise<{
    resultados: ResultadoBuscaExterna[];
    fonte: 'mercadolivre' | 'searxng' | 'nenhum';
  }> {
    // 1. Tentar Mercado Livre
    const resultadosML = await this.buscarMercadoLivre(termo);
    if (resultadosML.length > 0) {
      return { resultados: resultadosML, fonte: 'mercadolivre' };
    }

    // 2. Tentar SearXNG (Google/Bing/DuckDuckGo)
    const resultadosSearXNG = await this.buscarSearXNG(termo);
    if (resultadosSearXNG.length > 0) {
      return { resultados: resultadosSearXNG, fonte: 'searxng' };
    }

    // 3. Nada encontrado
    return { resultados: [], fonte: 'nenhum' };
  }

  // ==========================================================================
  // REGISTRO DE BUSCAS PENDENTES
  // ==========================================================================

  async registrarBuscaPendente(busca: Omit<BuscaPendente, 'id' | 'data_busca' | 'status'>): Promise<BuscaPendente | null> {
    const novaBusca: BuscaPendente = {
      id: Date.now().toString(),
      ...busca,
      status: 'pendente',
      data_busca: new Date().toISOString(),
      notificado_usuario: false,
      usuario_respondeu: false,
      prioridade: this.calcularPrioridade(busca.termo)
    };

    try {
      const { data, error } = await supabase
        .from('buscas_pendentes')
        .insert({
          termo: novaBusca.termo,
          usuario_id: novaBusca.usuario_id,
          usuario_nome: novaBusca.usuario_nome,
          usuario_email: novaBusca.usuario_email,
          tipo: novaBusca.tipo,
          localizacao: novaBusca.localizacao,
          status: novaBusca.status,
          prioridade: novaBusca.prioridade,
          data_busca: novaBusca.data_busca
        })
        .select()
        .single();

      if (!error && data) {
        await this.notificarAdminNovaBusca(novaBusca);
        return data;
      }
    } catch (error) {
      console.error('Erro ao salvar busca pendente:', error);
    }

    const buscasLocais = this.carregarLocal<BuscaPendente[]>('buscas_pendentes_locais', []);
    buscasLocais.unshift(novaBusca);
    this.salvarLocal('buscas_pendentes_locais', buscasLocais.slice(0, 100));
    
    await this.notificarAdminNovaBusca(novaBusca);
    
    return novaBusca;
  }

  private calcularPrioridade(termo: string): 'alta' | 'media' | 'baixa' {
    const palavrasAlta = ['urgente', 'remédio', 'consulta', 'entrega', 'pneu'];
    const termoLower = termo.toLowerCase();
    
    if (palavrasAlta.some(p => termoLower.includes(p))) {
      return 'alta';
    }
    if (termoLower.length < 10) {
      return 'media';
    }
    return 'baixa';
  }

  // ==========================================================================
  // NOTIFICAÇÕES
  // ==========================================================================

  async notificarAdminNovaBusca(busca: BuscaPendente): Promise<void> {
    try {
      const mensagem = `🔍 *NOVA BUSCA PENDENTE*\n\n` +
        `📦 *Termo:* ${busca.termo}\n` +
        `👤 *Usuário:* ${busca.usuario_nome}\n` +
        `📧 *Email:* ${busca.usuario_email}\n` +
        `📍 *Localização:* ${busca.localizacao?.cidade || 'Não informada'}\n` +
        `⚡ *Prioridade:* ${busca.prioridade === 'alta' ? '🔴 ALTA' : busca.prioridade === 'media' ? '🟡 MÉDIA' : '🟢 BAIXA'}\n\n` +
        `🔗 Acesse o admin para responder: admin/demandas`;

      await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: '@valenteconecta_admin',
          message: mensagem,
          parseMode: 'Markdown'
        })
      });
    } catch (error) {
      console.error('Erro ao notificar admin:', error);
    }
  }

  async notificarUsuarioBuscaAtendida(busca: BuscaPendente): Promise<void> {
    if (!busca.produto_sugerido) return;

    try {
      const mensagem = `🎉 *Seu produto foi encontrado!*\n\n` +
        `Você buscou por: *${busca.termo}*\n\n` +
        `📦 *Encontramos:* ${busca.produto_sugerido.nome}\n` +
        `💰 *Preço:* R$ ${busca.produto_sugerido.preco.toFixed(2)}\n` +
        `🏪 *Loja:* ${busca.produto_sugerido.loja}\n\n` +
        `🔗 *Clique aqui para ver:* ${busca.produto_sugerido.link}`;

      if (busca.usuario_telefone) {
        await fetch('/api/telegram/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: busca.usuario_telefone,
            message: mensagem,
            parseMode: 'Markdown'
          })
        });
      }

      const notificacaoPendente = {
        id: busca.id,
        titulo: '🎉 Produto encontrado!',
        mensagem: `Encontramos "${busca.termo}" para você! Confira as ofertas.`,
        link: busca.produto_sugerido.link,
        data: new Date().toISOString(),
        lida: false
      };
      
      const notificacoes = this.carregarLocal<any[]>('notificacoes_usuario_pendentes', []);
      notificacoes.push(notificacaoPendente);
      this.salvarLocal('notificacoes_usuario_pendentes', notificacoes);
      
    } catch (error) {
      console.error('Erro ao notificar usuário:', error);
    }
  }

  // ==========================================================================
  // GERENCIAMENTO DE BUSCAS PENDENTES
  // ==========================================================================

  async getBuscasPendentes(filtros?: {
    status?: string[];
    tipo?: string;
    prioridade?: string;
  }): Promise<BuscaPendente[]> {
    try {
      let query = supabase
        .from('buscas_pendentes')
        .select('*')
        .order('data_busca', { ascending: false });

      if (filtros?.status && filtros.status.length > 0) {
        query = query.in('status', filtros.status);
      }
      if (filtros?.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      if (filtros?.prioridade) {
        query = query.eq('prioridade', filtros.prioridade);
      }

      const { data, error } = await query;

      if (!error && data) {
        return data;
      }
    } catch (error) {
      console.error('Erro ao buscar buscas pendentes:', error);
    }

    return this.carregarLocal<BuscaPendente[]>('buscas_pendentes_locais', []);
  }

  async atualizarBuscaPendente(
    id: string,
    updates: Partial<BuscaPendente>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('buscas_pendentes')
        .update({
          ...updates,
          data_resposta: updates.status === 'concluido' ? new Date().toISOString() : undefined
        })
        .eq('id', id);

      if (!error) {
        if (updates.status === 'concluido' && updates.produto_sugerido) {
          const busca = await this.getBuscaPendenteById(id);
          if (busca) {
            await this.notificarUsuarioBuscaAtendida(busca);
          }
        }
        return true;
      }
    } catch (error) {
      console.error('Erro ao atualizar busca pendente:', error);
    }

    const buscasLocais = this.carregarLocal<BuscaPendente[]>('buscas_pendentes_locais', []);
    const index = buscasLocais.findIndex(b => b.id === id);
    if (index !== -1) {
      buscasLocais[index] = { ...buscasLocais[index], ...updates };
      this.salvarLocal('buscas_pendentes_locais', buscasLocais);
      return true;
    }

    return false;
  }

  async getBuscaPendenteById(id: string): Promise<BuscaPendente | null> {
    try {
      const { data, error } = await supabase
        .from('buscas_pendentes')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data;
      }
    } catch (error) {
      console.error('Erro ao buscar busca pendente:', error);
    }

    const buscasLocais = this.carregarLocal<BuscaPendente[]>('buscas_pendentes_locais', []);
    return buscasLocais.find(b => b.id === id) || null;
  }

  // ==========================================================================
  // ESTATÍSTICAS E MÉTRICAS
  // ==========================================================================

  async getEstatisticas(): Promise<{
    total: number;
    pendentes: number;
    em_andamento: number;
    concluidas: number;
    canceladas: number;
    porTipo: { produto: number; servico: number };
    porPrioridade: { alta: number; media: number; baixa: number };
    tempoMedioResposta: number;
  }> {
    const buscas = await this.getBuscasPendentes({});
    
    const estatisticas = {
      total: buscas.length,
      pendentes: buscas.filter(b => b.status === 'pendente').length,
      em_andamento: buscas.filter(b => b.status === 'em_andamento').length,
      concluidas: buscas.filter(b => b.status === 'concluido').length,
      canceladas: buscas.filter(b => b.status === 'cancelado').length,
      porTipo: {
        produto: buscas.filter(b => b.tipo === 'produto').length,
        servico: buscas.filter(b => b.tipo === 'servico').length
      },
      porPrioridade: {
        alta: buscas.filter(b => b.prioridade === 'alta').length,
        media: buscas.filter(b => b.prioridade === 'media').length,
        baixa: buscas.filter(b => b.prioridade === 'baixa').length
      },
      tempoMedioResposta: 0
    };

    const buscasRespondidas = buscas.filter(b => b.data_resposta && b.data_busca);
    if (buscasRespondidas.length > 0) {
      const totalTempo = buscasRespondidas.reduce((sum, b) => {
        const tempo = new Date(b.data_resposta!).getTime() - new Date(b.data_busca).getTime();
        return sum + tempo;
      }, 0);
      estatisticas.tempoMedioResposta = totalTempo / buscasRespondidas.length / (1000 * 60 * 60);
    }

    return estatisticas;
  }

  // ==========================================================================
  // UTILITÁRIOS
  // ==========================================================================

  async obterLocalizacaoAtual(): Promise<{ lat: number; lng: number; cidade: string } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          let cidade = 'Valente, BA';
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            const data = await response.json();
            cidade = data.address?.city || data.address?.town || data.address?.village || 'Valente, BA';
          } catch (error) {
            console.error('Erro no reverse geocoding:', error);
          }
          
          resolve({ lat: latitude, lng: longitude, cidade });
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          resolve(null);
        }
      );
    });
  }
}

export const buscaInteligenteService = new BuscaInteligenteService();



