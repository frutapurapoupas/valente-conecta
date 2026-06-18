// ============================================
// TYPES - HOME PRINCIPAL
// ============================================

export interface PratoDoDia {
  id: number;
  titulo: string;
  descricao: string;
  preco: number;
  original: number;
  link: string;
  emoji: string;
  badge: string | null;
}

export interface Banner {
  id: number;
  titulo: string;
  descricao: string;
  cor: string;
  link: string;
}

export interface Categoria {
  id: string;
  nome: string;
  icon: string;
  cor: string;
  href: string;
}

export interface Plano {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  features: string[];
  icon: string;
  cor: string;
}

export interface AbaIndique {
  texto: string;
  cor: string;
}

export interface HomeConstants {
  titulos: {
    pratosDoDia: string;
    indicacaoPremiada: string;
    categorias: string;
    planos: string;
    video: string;
    videoDesc: string;
  };
  cores: {
    header: string;
    cardPratos: string;
    cardIndicacao: string;
    videoBg: string;
    estatisticasBg: string;
  };
  pratos: PratoDoDia[];
  categorias: Categoria[];
  banners: Banner[];
  abasIndique: AbaIndique[];
  planos: Plano[];
  estatisticas: Array<{ valor: string; label: string }>;
}

export interface HomeData {
  bannerAtual: number;
  abaAtual: number;
  isAdmin: boolean;
  user: any;
}