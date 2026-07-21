// ============================================
// CONSTANTES - HOME PRINCIPAL
// ============================================

import { HomeConstants } from '@/types/home.types';

export const homeConstants: HomeConstants = {
  // TÍTULOS
  titulos: {
    pratosDoDia: 'PROMOÇÃO DO DIA',
    indicacaoPremiada: 'INDICAÇÃO PREMIADA',
    categorias: 'Categorias em Destaque',
    planos: 'Planos para seu Negócio',
    video: 'Assista ao Vídeo',
    videoDesc: 'Conheça o Valente Conecta'
  },

  // CORES (centralizadas)
  cores: {
    header: 'from-blue-600 to-indigo-600',
    cardPratos: 'from-red-500 to-orange-500',
    cardIndicacao: 'from-green-600 to-emerald-600',
    videoBg: 'from-gray-900 to-gray-800',
    estatisticasBg: 'from-blue-600 to-indigo-600'
  },

  // PRATOS DO DIA / PROMOÇÕES
      pratos: [
    {
      id: 1,
      titulo: 'Marmita Executiva',
      descricao: 'Arroz, feijão, frango grelhado, salada e farofa',
      preco: 18.90,
      original: 25.90,
      link: '/cozinha',
      emoji: '???',
      badge: 'COZINHA CHEF NEIDE'
    },
    {
      id: 2,
      titulo: 'Academia para Aluno',
      descricao: 'Treino personalizado com IA, acompanhamento completo',
      preco: 49.90,
      original: 69.90,
      link: '/academia',
      emoji: '??',
      badge: 'ACADEMIA'
    },
    {
      id: 3,
      titulo: 'Carne de Panela',
      descricao: 'Carne macia com batatas, arroz e feijão',
      preco: 24.90,
      original: 32.90,
      link: '/cozinha',
      emoji: '??',
      badge: 'PROMOÇÃO'
    },
    {
      id: 4,
      titulo: 'Frango Xadrez',
      descricao: 'Frango com legumes ao molho agridoce, arroz',
      preco: 21.90,
      original: 28.90,
      link: '/cozinha',
      emoji: '??',
      badge: 'ESPECIAL'
    }
  ],

  // CATEGORIAS
  categorias: [
    { id: 'comercio', nome: 'Comércio', icon: 'ShoppingCart', cor: 'bg-blue-500', href: '/catalogo?categoria=comercio' },
    { id: 'alimentacao', nome: 'Alimentação', icon: 'UtensilsCrossed', cor: 'bg-orange-500', href: '/catalogo?categoria=alimentacao' },
    { id: 'academia', nome: 'Academia', icon: 'Dumbbell', cor: 'bg-red-500', href: '/academia' },
    { id: 'mototaxi', nome: 'Moto Táxi', icon: 'faMotorcycle', cor: 'bg-yellow-500', href: '/mototaxi' },
    { id: 'servicos', nome: 'Serviços', icon: 'Sparkles', cor: 'bg-purple-500', href: '/servicos' },
    { id: 'profissionais', nome: 'Profissionais', icon: 'Briefcase', cor: 'bg-indigo-500', href: '/profissionais' },
    { id: 'empregos', nome: 'Empregos', icon: 'Handshake', cor: 'bg-teal-500', href: '/empregos' },
    { id: 'imoveis', nome: 'Imóveis', icon: 'Building2', cor: 'bg-pink-500', href: '/imoveis' },
    { id: 'veiculos', nome: 'Veículos', icon: 'Car', cor: 'bg-cyan-500', href: '/catalogo?categoria=veiculos' },
    { id: 'saude', nome: 'Saúde', icon: 'HeartPulse', cor: 'bg-emerald-500', href: '/catalogo?categoria=saude' },
    { id: 'educacao', nome: 'Educação', icon: 'GraduationCap', cor: 'bg-sky-500', href: '/catalogo?categoria=educacao' },
    { id: 'beleza', nome: 'Beleza', icon: 'Scissors', cor: 'bg-rose-500', href: '/catalogo?categoria=beleza' },
    { id: 'eventos', nome: 'Eventos', icon: 'Gamepad2', cor: 'bg-violet-500', href: '/catalogo?categoria=eventos' },
    { id: 'turismo', nome: 'Turismo', icon: 'Plane', cor: 'bg-amber-500', href: '/catalogo?categoria=turismo' }
  ],

  // BANNERS PUBLICITÁRIOS
  banners: [
    { id: 1, titulo: 'Black Friday Valente', descricao: 'Descontos de até 70%', cor: 'from-red-600 to-orange-600', link: '/ofertas' },
    { id: 2, titulo: 'Indique e Ganhe', descricao: 'R$10 por indicação', cor: 'from-green-600 to-emerald-600', link: '/indicacoes' },
    { id: 3, titulo: 'App Premiado', descricao: 'Melhor app da região', cor: 'from-purple-600 to-pink-600', link: '/sobre' }
  ],

  // ABAS ROTATIVAS DO CARD INDIQUE
  abasIndique: [
    { texto: '?? Indique um amigo e ganhe R$10!', cor: 'text-yellow-600' },
    { texto: '?? Indique uma loja e ganhe bônus!', cor: 'text-green-600' },
    { texto: '?? Indique um motorista e ganhe desconto!', cor: 'text-blue-600' },
    { texto: '? Indique um profissional e ganhe créditos!', cor: 'text-purple-600' },
    { texto: '?? Indique um comerciante e ganhe comissão!', cor: 'text-orange-600' },
    { texto: '?? Indique a academia e ganhe mês grátis!', cor: 'text-red-600' },
    { texto: '?? Indique o moto táxi e ganhe corrida!', cor: 'text-yellow-700' },
    { texto: '?? Indique um imóvel e ganhe % da venda!', cor: 'text-pink-600' },
    { texto: '?? Indique um curso e ganhe desconto!', cor: 'text-indigo-600' },
    { texto: '?? Indique um evento e ganhe ingresso!', cor: 'text-amber-600' }
  ],

  // PLANOS
  planos: [
    {
      id: 'gratis',
      nome: 'Grátis',
      preco: 0,
      descricao: 'Básico',
      features: ['Perfil gratuito', '5 produtos', 'Contato básico'],
      icon: 'Users',
      cor: 'bg-gray-500'
    },
    {
      id: 'basico',
      nome: 'Básico',
      preco: 29.90,
      descricao: 'Para pequenos negócios',
      features: ['50 produtos', 'Contatos visíveis', 'Suporte prioritário'],
      icon: 'Store',
      cor: 'bg-blue-500'
    },
    {
      id: 'premium',
      nome: 'Premium',
      preco: 49.90,
      descricao: 'Para negócios em crescimento',
      features: ['Produtos ilimitados', 'PDV completo', 'Destaque na busca'],
      icon: 'Crown',
      cor: 'bg-yellow-500'
    },
    {
      id: 'fisco',
      nome: 'Fisco',
      preco: 99.90,
      descricao: 'Módulo fiscal completo',
      features: ['Nota fiscal', 'Contabilidade', 'Relatórios avançados'],
      icon: 'Shield',
      cor: 'bg-green-500'
    }
  ],

  // ESTATÍSTICAS
  estatisticas: [
    { valor: '1000+', label: 'Usuários Ativos' },
    { valor: '50+', label: 'Lojas Parceiras' },
    { valor: '100+', label: 'Profissionais' },
    { valor: '5000+', label: 'Pedidos Realizados' }
  ]
};


