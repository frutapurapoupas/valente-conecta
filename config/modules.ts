// ============================================
// FEATURE FLAGS - SINALIZADORES DE RECURSOS
// ============================================
// Controla quais mÃ³dulos estÃ£o ativos por ambiente.
// productionReady: true  â†’ disponÃ­vel em produÃ§Ã£o (Vercel)
// productionReady: false â†’ disponÃ­vel apenas em desenvolvimento (local)

export type Environment = "production" | "development";

// Detecta automaticamente o ambiente
export const CURRENT_ENV: Environment =
  process.env.NODE_ENV === "production" ? "production" : "development";

// Interface de cada mÃ³dulo
export interface ModuleFlag {
  enabled: boolean;
  description: string;
  productionReady: boolean;
  version?: string;
  dependencies?: string[];
}

// Objeto central de feature flags
export const MODULE_FLAGS: Record<string, ModuleFlag> = {
  // ===================== PÃšBLICOS (SEMPRE ATIVOS) =====================
  main_site: {
    enabled: true,
    description: "Site principal / landing page do Valente Conecta",
    productionReady: true
  },
  busca_global: {
    enabled: true,
    description: "Busca inteligente com fallback e modal de opÃ§Ãµes",
    productionReady: true
  },
  publicidades: {
    enabled: true,
    description: "Carrossel de banners com rotaÃ§Ã£o automÃ¡tica",
    productionReady: true
  },
  indicacao_premiada: {
    enabled: true,
    description: "Programa de indicaÃ§Ã£o com abas rotativas",
    productionReady: true
  },
  login_cadastro: {
    enabled: true,
    description: "Sistema de autenticaÃ§Ã£o e cadastro de usuÃ¡rios",
    productionReady: true
  },

  // ===================== EM PRODUÃ‡ÃƒO (PRODUCTION READY) =====================
  cozinha_publica: {
    enabled: true,
    description: "CardÃ¡pio pÃºblico da Cozinha Chef Neide com pedidos via WhatsApp",
    productionReady: true
  },
  academia_esportes: {
    enabled: true,
    description: "Academia e esportes com cadastro de atletas",
    productionReady: true
  },
  servicos: {
    enabled: true,
    description: "CatÃ¡logo de serviÃ§os e utilidades",
    productionReady: true
  },
  profissionals: {
    enabled: true,
    description: "CatÃ¡logo de profissionais liberais e agendamentos",
    productionReady: true
  },
  empregos: {
    enabled: true,
    description: "MÃ³dulo de empregos: currÃ­culos e vagas",
    productionReady: true
  },
  mototaxi: {
    enabled: true,
    description: "Moto tÃ¡xi e transportes locais",
    productionReady: true
  },
  comercio: {
    enabled: true,
    description: "CatÃ¡logo de comÃ©rcio local e produtos",
    productionReady: true
  },
  alimentacao: {
    enabled: true,
    description: "Categoria de alimentaÃ§Ã£o e delivery",
    productionReady: true
  },

  // ===================== EM DESENVOLVIMENTO (APENAS LOCAL) =====================
  imoveis: {
    enabled: CURRENT_ENV === "development",
    description: "AnÃºncios de imÃ³veis (aluguel e venda)",
    productionReady: false,
    version: "1.0.0-beta"
  },
  veiculos: {
    enabled: CURRENT_ENV === "development",
    description: "AnÃºncios de veÃ­culos (aluguel e venda)",
    productionReady: false,
    version: "1.0.0-beta"
  },
  saude: {
    enabled: CURRENT_ENV === "development",
    description: "ServiÃ§os de saÃºde e bem-estar",
    productionReady: false,
    version: "0.8.0-beta"
  },
  educacao: {
    enabled: CURRENT_ENV === "development",
    description: "Cursos e educaÃ§Ã£o",
    productionReady: false,
    version: "0.7.0-beta"
  },
  beleza: {
    enabled: CURRENT_ENV === "development",
    description: "ServiÃ§os de beleza e estÃ©tica",
    productionReady: false,
    version: "0.8.0-beta"
  },
  eventos: {
    enabled: CURRENT_ENV === "development",
    description: "Eventos e entretenimento",
    productionReady: false,
    version: "0.6.0-beta"
  },
  turismo: {
    enabled: CURRENT_ENV === "development",
    description: "Turismo e passeios locais",
    productionReady: false,
    version: "0.5.0-alpha"
  },
  pdv_colaborativo: {
    enabled: CURRENT_ENV === "development",
    description: "PDV colaborativo completo com controle de fiado",
    productionReady: false,
    version: "2.1.0-beta"
  },
  marketplace: {
    enabled: CURRENT_ENV === "development",
    description: "Marketplace com lojas virtuais e pagamentos",
    productionReady: false,
    version: "1.5.0-beta"
  },
  financeiro_carteira: {
    enabled: CURRENT_ENV === "development",
    description: "Carteira digital e sistema financeiro",
    productionReady: false,
    version: "0.9.0-alpha"
  },
  ia_conteudo: {
    enabled: CURRENT_ENV === "development",
    description: "IA de geraÃ§Ã£o de conteÃºdo e vÃ­deos automÃ¡ticos",
    productionReady: false,
    version: "0.5.0-alpha"
  },
  integracao_mercadopago: {
    enabled: CURRENT_ENV === "development",
    description: "Pagamentos com Mercado Pago (PIX e cartÃ£o)",
    productionReady: false,
    version: "1.0.0-beta"
  },

  // ===================== ADMIN (CONTROLADO POR PERFIL) =====================
  admin_painel: {
    enabled: CURRENT_ENV === "development",
    description: "PainÃ©is administrativos completos",
    productionReady: false,
    version: "2.0.0-beta"
  },
  admin_fiscal: {
    enabled: CURRENT_ENV === "development",
    description: "MÃ³dulo fiscal para empresas (plano Fisco)",
    productionReady: false,
    version: "0.5.0-alpha"
  },

  // ===================== MODALIDADES ESPORTIVAS (TODAS ATIVAS) =====================
  modalidade_futebol: {
    enabled: true,
    description: "Cadastro de atletas de futebol",
    productionReady: true
  },
  modalidade_volei: {
    enabled: true,
    description: "Cadastro de atletas de vÃ´lei",
    productionReady: true
  },
  modalidade_basquete: {
    enabled: true,
    description: "Cadastro de atletas de basquete",
    productionReady: true
  },
  modalidade_ciclismo: {
    enabled: CURRENT_ENV === "development",
    description: "Cadastro de atletas de ciclismo",
    productionReady: false,
    version: "0.5.0-alpha"
  },
  modalidade_corrida: {
    enabled: CURRENT_ENV === "development",
    description: "Cadastro de atletas de corrida",
    productionReady: false,
    version: "0.5.0-alpha"
  }
};

// ============================================
// FUNÃ‡Ã•ES UTILITÃRIAS
// ============================================

/** Verifica se um mÃ³dulo estÃ¡ habilitado no ambiente atual */
export function isModuleEnabled(moduleKey: string): boolean {
  return MODULE_FLAGS[moduleKey]?.enabled ?? false;
}

/** Retorna lista de chaves dos mÃ³dulos ativos */
export function getEnabledModules(): string[] {
  return Object.entries(MODULE_FLAGS)
    .filter(([, flag]) => flag.enabled)
    .map(([key]) => key);
}

/** Retorna lista de chaves dos mÃ³dulos prontos para produÃ§Ã£o */
export function getProductionModules(): string[] {
  return Object.entries(MODULE_FLAGS)
    .filter(([, flag]) => flag.productionReady)
    .map(([key]) => key);
}

/** Retorna lista de mÃ³dulos em desenvolvimento (apenas local) */
export function getDevModules(): string[] {
  return Object.entries(MODULE_FLAGS)
    .filter(([, flag]) => !flag.productionReady)
    .map(([key]) => key);
}

/** 
 * Mapa de correlaÃ§Ã£o: mÃ³dulo â†” categorias da home
 * Usado para filtrar categorias na UI
 */
export const MODULE_TO_CATEGORY: Record<string, string[]> = {
  comercio:        ["comercio"],
  alimentacao:     ["alimentacao"],
  academia_esportes: ["academia"],
  mototaxi:        ["mototaxi"],
  servicos:        ["servicos"],
  profissionals:   ["profissionais"],
  empregos:        ["empregos"],
  imoveis:         ["imoveis"],
  veiculos:        ["veiculos"],
  saude:           ["saude"],
  educacao:        ["educacao"],
  beleza:          ["beleza"],
  eventos:         ["eventos"],
  turismo:         ["turismo"],
};

/**
 * Filtra categorias disponÃ­veis baseado nas flags ativas
 * @param categorias Lista completa de categorias
 * @returns Lista filtrada com base nos mÃ³dulos ativos
 */
export function filterCategoriasByFlags<T extends { id: string }>(
  categorias: T[]
): T[] {
  const activeModuleKeys = getEnabledModules();
  
  return categorias.filter(cat => {
    // Sempre mostrar se nÃ£o tem mapeamento (fallback seguro)
    const relatedModules = Object.entries(MODULE_TO_CATEGORY)
      .filter(([, cats]) => cats.includes(cat.id))
      .map(([mod]) => mod);
    
    if (relatedModules.length === 0) return true; // fallback
    
    return relatedModules.some(mod => activeModuleKeys.includes(mod));
  });
}

