// ============================================================================
// ARQUIVO 5: services/buscaInteligenteService.ts
// Funcionalidade: Busca inteligente com fallback Mercado Livre + Google
// Estratégia: Primeiro catálogos locais, depois externo (Mercado Livre + Google)
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
  usuario_cidade: string;
  tipo: 'produto' | 'servico';
  categoria?: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  data_busca: string;
  data_resposta?: string;
  produto_sugerido?: {
    nome: string;
    preco: number;
    link: string;
    loja: string;
    imagem?: string;
  };
  notificado_usuario: boolean;
}

export interface ResultadoBusca {
  id: string;
  nome: string;
  preco: number;
  loja: string;
  link: string;
  imagem?: string;
  avaliacao?: number;
  tipo: 'local' | 'mercadolivre' | 'google';
  frete?: number;
}

interface UsuarioComCidade {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade_base: string;
}

class BuscaInteligenteService {
  private usuarioAtual: UsuarioComCidade | null = null;

  // ==========================================================================
  // CONFIGURAÇÃO DO USUÁRIO (COM CIDADE BASE)
  // ==========================================================================

  setUsuario(usuario: UsuarioComCidade) {
    this.usuarioAtual = usuario;
    localStorage.setItem('usuario_cidade_base', usuario.cidade_base);
    localStorage.setItem('usuario_nome', usuario.nome);
    localStorage.setItem('usuario_email', usuario.email);
    localStorage.setItem('usuario_whatsapp', usuario.whatsapp);
  }

  getUsuarioCidade(): string {
    if (this.usuarioAtual) return this.usuarioAtual.cidade_base;
    return localStorage.getItem('usuario_cidade_base') || 'Valente, BA';
  }

  getUsuarioNome(): string {
    if (this.usuarioAtual) return this.usuarioAtual.nome;
    return localStorage.getItem('usuario_nome') || 'Visitante';
  }

  getUsuarioEmail(): string {
    if (this.usuarioAtual) return this.usuarioAtual.email;
    return localStorage.getItem('usuario_email') || 'anonimo@email.com';
  }

  getUsuarioWhatsapp(): string {
    if (this.usuarioAtual) return this.usuarioAtual.whatsapp;
    return localStorage.getItem('usuario_whatsapp') || '';
  }

  // ==========================================================================
  // BUSCA LOCAL (CATÁLOGOS DA CIDADE DO USUÁRIO)
  // ==========================================================================

  async buscarLocal(termo: string): Promise<ResultadoBusca[]> {
    const cidadeBase = this.getUsuarioCidade();
    
    try {
      // Buscar no Supabase (produtos da cidade do usuário)
      const { data, error } = await supabase
        .from('produtos')
        .select('*, lojas(nome, cidade)')
        .ilike('nome', `%${termo}%`)
        .eq('lojas.cidade', cidadeBase)
        .limit(10);

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          loja: item.lojas?.nome || 'Loja local',
          link: `/produto/${item.id}`,
          imagem: item.imagem,
          tipo: 'local'
        }));
      }
    } catch (error) {
      console.error('Erro na busca local:', error);
    }

    return [];
  }

  // ==========================================================================
  // BUSCA MERCADO LIVRE (API PÚBLICA - SEM CHAVE)
  // ==========================================================================

  async buscarMercadoLivre(termo: string): Promise<ResultadoBusca[]> {
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
          tipo: 'mercadolivre',
          frete: item.shipping?.free_shipping ? 0 : item.shipping?.price || 0
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar no Mercado Livre:', error);
    }
    return [];
  }

  // ==========================================================================
  // BUSCA GOOGLE SHOPPING (VIA API - REQUER CHAVE)
  // ==========================================================================

  async buscarGoogleShopping(termo: string): Promise<ResultadoBusca[]> {
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
    const googleCx = process.env.NEXT_PUBLIC_GOOGLE_CX_ID || '';

    if (!googleApiKey || !googleCx) {
      console.log('Google Shopping API não configurada');
      return [];
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCx}&q=${encodeURIComponent(termo)}&searchType=image`
      );
      
      if (response.ok) {
        const data = await response.json();
        return (data.items || []).slice(0, 5).map((item: any, idx: number) => ({
          id: `google_${idx}`,
          nome: item.title.length > 60 ? item.title.substring(0, 60) + '...' : item.title,
          preco: 0, // Google Shopping API não retorna preço diretamente
          loja: item.displayLink || 'Google Shopping',
          link: item.link,
          imagem: item.link,
          tipo: 'google'
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar no Google Shopping:', error);
    }
    return [];
  }

  // ==========================================================================
  // BUSCA PRINCIPAL (LOCAL -> MERCADO LIVRE -> GOOGLE)
  // ==========================================================================

  async buscar(termo: string): Promise<{
    resultados: ResultadoBusca[];
    encontrouLocal: boolean;
    registrouPendente: boolean;
    fonte: 'local' | 'mercadolivre' | 'google' | 'nenhum';
  }> {
    // 1. Buscar nos catálogos locais da cidade do usuário
    const resultadosLocais = await this.buscarLocal(termo);
    
    if (resultadosLocais.length > 0) {
      return {
        resultados: resultadosLocais,
        encontrouLocal: true,
        registrouPendente: false,
        fonte: 'local'
      };
    }

    // 2. Não encontrou localmente → buscar no Mercado Livre
    const resultadosMercadoLivre = await this.buscarMercadoLivre(termo);
    
    if (resultadosMercadoLivre.length > 0) {
      // Registrar pendência para o admin
      await this.registrarBuscaPendente({
        termo,
        tipo: termo.includes('serviço') || termo.includes('servico') ? 'servico' : 'produto',
        fonte: 'mercadolivre'
      });
      
      return {
        resultados: resultadosMercadoLivre,
        encontrouLocal: false,
        registrouPendente: true,
        fonte: 'mercadolivre'
      };
    }

    // 3. Nem local nem Mercado Livre → buscar no Google Shopping
    const resultadosGoogle = await this.buscarGoogleShopping(termo);
    
    if (resultadosGoogle.length > 0) {
      await this.registrarBuscaPendente({
        termo,
        tipo: termo.includes('serviço') || termo.includes('servico') ? 'servico' : 'produto',
        fonte: 'google'
      });
      
      return {
        resultados: resultadosGoogle,
        encontrouLocal: false,
        registrouPendente: true,
        fonte: 'google'
      };
    }

    // 4. Nada encontrado em lugar nenhum
    await this.registrarBuscaPendente({
      termo,
      tipo: termo.includes('serviço') || termo.includes('servico') ? 'servico' : 'produto',
      fonte: 'nenhum'
    });

    return {
      resultados: [],
      encontrouLocal: false,
      registrouPendente: true,
      fonte: 'nenhum'
    };
  }

  // ==========================================================================
  // REGISTRO DE BUSCAS PENDENTES
  // ==========================================================================

  async registrarBuscaPendente(dados: {
    termo: string;
    tipo: 'produto' | 'servico';
    fonte: 'mercadolivre' | 'google' | 'nenhum';
  }): Promise<BuscaPendente | null> {
    const cidadeBase = this.getUsuarioCidade();
    
    const novaBusca: BuscaPendente = {
      id: Date.now().toString(),
      termo: dados.termo,
      usuario_nome: this.getUsuarioNome(),
      usuario_email: this.getUsuarioEmail(),
      usuario_telefone: this.getUsuarioWhatsapp(),
      usuario_cidade: cidadeBase,
      tipo: dados.tipo,
      status: 'pendente',
      data_busca: new Date().toISOString(),
      notificado_usuario: false
    };

    try {
      // Salvar no Supabase
      const { error } = await supabase
        .from('buscas_pendentes')
        .insert({
          id: novaBusca.id,
          termo: novaBusca.termo,
          usuario_nome: novaBusca.usuario_nome,
          usuario_email: novaBusca.usuario_email,
          usuario_telefone: novaBusca.usuario_telefone,
          usuario_cidade: novaBusca.usuario_cidade,
          tipo: novaBusca.tipo,
          status: novaBusca.status,
          data_busca: novaBusca.data_busca,
          fonte_externa: dados.fonte
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar busca pendente:', error);
    }

    // Salvar no localStorage como fallback
    const buscasLocais = this.getBuscasPendentesLocal();
    buscasLocais.unshift(novaBusca);
    localStorage.setItem('buscas_pendentes_locais', JSON.stringify(buscasLocais.slice(0, 50)));

    // Notificar admin via Telegram
    await this.notificarAdminNovaBusca(novaBusca, dados.fonte);

    return novaBusca;
  }

  private getBuscasPendentesLocal(): BuscaPendente[] {
    const dados = localStorage.getItem('buscas_pendentes_locais');
    return dados ? JSON.parse(dados) : [];
  }

  // ==========================================================================
  // NOTIFICAÇÕES
  // ==========================================================================

  async notificarAdminNovaBusca(busca: BuscaPendente, fonte: string): Promise<void> {
    try {
      const fonteEmoji = fonte === 'mercadolivre' ? '🛒' : fonte === 'google' ? '🔍' : '❌';
      const fonteTexto = fonte === 'mercadolivre' ? 'Mercado Livre' : fonte === 'google' ? 'Google Shopping' : 'Nenhuma';
      
      const mensagem = `🔍 *NOVA BUSCA NÃO ENCONTRADA LOCALMENTE*\n\n` +
        `📦 *Termo:* ${busca.termo}\n` +
        `👤 *Usuário:* ${busca.usuario_nome}\n` +
        `📧 *Email:* ${busca.usuario_email}\n` +
        `📱 *WhatsApp:* ${busca.usuario_telefone || 'Não informado'}\n` +
        `📍 *Cidade:* ${busca.usuario_cidade}\n` +
        `${fonteEmoji} *Fonte externa:* ${fonteTexto}\n\n` +
        `🔗 Acesse o admin para cadastrar este item na cidade: /admin/demandas`;

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

  async notificarUsuarioProdutoEncontrado(busca: BuscaPendente, produto: ResultadoBusca): Promise<void> {
    try {
      const mensagem = `🎉 *PRODUTO ENCONTRADO NA SUA CIDADE!*\n\n` +
        `Você buscou por: *${busca.termo}*\n\n` +
        `✅ *Agora disponível em ${busca.usuario_cidade}!*\n\n` +
        `📦 *${produto.nome}*\n` +
        `💰 *Preço:* R$ ${produto.preco.toFixed(2)}\n` +
        `🏪 *Loja:* ${produto.loja}\n\n` +
        `🔗 Acesse o app para mais detalhes: valenteconecta.clic.com.br`;

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

      // Registrar notificação para popup no app
      const notificacaoPendente = {
        id: busca.id,
        titulo: '🎉 Produto encontrado na sua cidade!',
        mensagem: `"${busca.termo}" agora está disponível em ${busca.usuario_cidade}`,
        link: produto.link,
        data: new Date().toISOString(),
        lida: false
      };
      
      const notificacoes = this.getNotificacoesPendentesLocal();
      notificacoes.push(notificacaoPendente);
      localStorage.setItem('notificacoes_usuario_pendentes', JSON.stringify(notificacoes));
      
    } catch (error) {
      console.error('Erro ao notificar usuário:', error);
    }
  }

  private getNotificacoesPendentesLocal(): any[] {
    const dados = localStorage.getItem('notificacoes_usuario_pendentes');
    return dados ? JSON.parse(dados) : [];
  }

  // ==========================================================================
  // GERENCIAMENTO DE BUSCAS PENDENTES (ADMIN)
  // ==========================================================================

  async getBuscasPendentesAdmin(): Promise<BuscaPendente[]> {
    try {
      const { data, error } = await supabase
        .from('buscas_pendentes')
        .select('*')
        .eq('status', 'pendente')
        .order('data_busca', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (error) {
      console.error('Erro ao buscar buscas pendentes:', error);
    }

    return this.getBuscasPendentesLocal().filter(b => b.status === 'pendente');
  }

  async marcarComoConcluido(id: string, produto: ResultadoBusca): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('buscas_pendentes')
        .update({
          status: 'concluido',
          data_resposta: new Date().toISOString(),
          produto_sugerido: {
            nome: produto.nome,
            preco: produto.preco,
            link: produto.link,
            loja: produto.loja,
            imagem: produto.imagem
          }
        })
        .eq('id', id);

      if (!error) {
        const busca = await this.getBuscaPendenteById(id);
        if (busca) {
          await this.notificarUsuarioProdutoEncontrado(busca, produto);
        }
        return true;
      }
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
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

    const buscasLocais = this.getBuscasPendentesLocal();
    return buscasLocais.find(b => b.id === id) || null;
  }

  // ==========================================================================
  // ESTATÍSTICAS
  // ==========================================================================

  async getEstatisticas(): Promise<{
    total: number;
    pendentes: number;
    porCidade: Record<string, number>;
    topTermos: { termo: string; count: number }[];
  }> {
    const buscas = await this.getBuscasPendentesAdmin();
    
    const porCidade: Record<string, number> = {};
    const termoCount: Record<string, number> = {};

    buscas.forEach(busca => {
      // Contagem por cidade
      porCidade[busca.usuario_cidade] = (porCidade[busca.usuario_cidade] || 0) + 1;
      
      // Contagem por termo
      termoCount[busca.termo] = (termoCount[busca.termo] || 0) + 1;
    });

    const topTermos = Object.entries(termoCount)
      .map(([termo, count]) => ({ termo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: buscas.length,
      pendentes: buscas.filter(b => b.status === 'pendente').length,
      porCidade,
      topTermos
    };
  }
}

export const buscaInteligenteService = new BuscaInteligenteService();



