// services/homeService.ts
// 🔧 LÓGICA DE API - Home

export const homeService = {
  // Saldo do usuário
  getSaldo: async (userId: string): Promise<number> => {
    try {
      const response = await fetch(`/api/wallet/saldo?userId=${userId}`);
      const data = await response.json();
      return data.saldo || 0;
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
      return 0;
    }
  },

  // Notificações do Admin
  getNotificacoesAdmin: (): NotificacaoAdmin[] => {
    try {
      const solicitacoes = localStorage.getItem("solicitacoes_servicos");
      if (solicitacoes) {
        const dados = JSON.parse(solicitacoes);
        if (Array.isArray(dados) && dados.length > 0) {
          const ativas = dados.filter((s: any) => s.status === "pendente" || s.status === "em_andamento");
          if (ativas.length > 0) {
            return ativas.map((solicitacao: any) => ({
              id: solicitacao.id,
              mensagem: `📋 ${solicitacao.servico} - ${solicitacao.cliente?.nome || "Alguém"} solicitou ${solicitacao.servico}`,
              importancia: solicitacao.status === "pendente" ? "alta" : "media",
              data: new Date(solicitacao.data).toLocaleDateString(),
              status: solicitacao.status
            }));
          }
        }
      }

      const notasAdmin = localStorage.getItem("notas_admin");
      if (notasAdmin) {
        const dados = JSON.parse(notasAdmin);
        if (Array.isArray(dados) && dados.length > 0) {
          return dados;
        }
      }

      const demandas = localStorage.getItem("demandas");
      if (demandas) {
        const dados = JSON.parse(demandas);
        if (Array.isArray(dados) && dados.length > 0) {
          return dados;
        }
      }

      const notificacoes = localStorage.getItem("notificacoes");
      if (notificacoes) {
        const dados = JSON.parse(notificacoes);
        if (Array.isArray(dados) && dados.length > 0) {
          return dados;
        }
      }

      return [
        { id: "default", mensagem: "✅ Sistema operando normalmente", importancia: "info", data: new Date().toLocaleDateString() }
      ];
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      return [
        { id: "error", mensagem: "📢 Fique ligado nas novidades!", importancia: "info", data: new Date().toLocaleDateString() }
      ];
    }
  },

  // Buscar dados estáticos (categorias, grid, etc)
  getDadosEstaticos: () => {
    return {
      gridItens: [
        { titulo: "MOTO TÁXI", cor: "#007bff", icone: "🏍️", href: "/mototaxi" },
        { titulo: "MARMITA", cor: "#ff9800", icone: "🍱", href: "/cozinha" },
        { titulo: "ÁGUA & GÁS", cor: "#e64a19", icone: "💧", href: "/comercio" },
      ],
      categoriasBloco1: [
        { nome: "ACADEMIAS & ESPORTES", icone: "💪", href: "/academia" },
        { nome: "ALIMENTAÇÃO", icone: "🍔", href: null },
        { nome: "MARMITA & BOLOS", icone: "🍱", href: "/cozinha" },
        { nome: "TRANSPORTE & DELIVERY", icone: "🏍️", href: "/mototaxi" },
        { nome: "UTILIDADES", icone: "💡", href: "/servicos" },
        { nome: "SERVIÇOS", icone: "🔧", href: "/servicos" },
      ],
      categoriasBloco2: [
        { nome: "MERCADOS", icone: "🏪", href: "/comercio" },
        { nome: "IMÓVEL", icone: "🏠", href: "/servicos" },
        { nome: "AGRO E CAMPO", icone: "🌾", href: "/servicos" },
        { nome: "CONSTRUÇÃO", icone: "🏗️", href: "/servicos" },
        { nome: "ALUGUEL MÁQUINAS", icone: "🔨", href: "/servicos" },
        { nome: "TECNOLOGIA", icone: "💻", href: "/servicos" },
      ],
      categoriasBloco3: [
        { nome: "AUTOMOTIVO", icone: "🚗", href: "/servicos" },
        { nome: "EDUCAÇÃO", icone: "📚", href: "/servicos" },
        { nome: "SAÚDE", icone: "🏥", href: "/servicos" },
        { nome: "MODA MASCULINA", icone: "👔", href: "/servicos" },
        { nome: "MODA FEMININA", icone: "👗", href: "/servicos" },
        { nome: "BELEZA & ESTÉTICA", icone: "💇", href: "/servicos" },
      ],
      categoriasBloco4: [
        { nome: "BELEZA & ESTÉTICA", icone: "💅", href: "/servicos" },
        { nome: "EVENTOS & ENTRETENIMENTO", icone: "🎉", href: "/servicos" },
        { nome: "PET SHOP & ANIMAIS", icone: "🐕", href: "/servicos" },
        { nome: "FINANCEIRO", icone: "💰", href: "/servicos" },
      ],
    };
  }
};