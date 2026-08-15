// components/admin/adminMenuFull.ts
// 📊 MENU COMPLETO - Valente Conecta

import {
  LayoutDashboard,
  BarChart3,
  Brain,
  FileText,
  Users,
  CreditCard,
  Bot,
  DollarSign,
  Megaphone,
  MessageCircle,
  UserPlus,
  MapPin,
  Settings,
  Wallet,
  Shield,
  TrendingUp,
  Coins,
  Lock,
  User,
  ChefHat,
  Package,
  Utensils,
  ShoppingCart,
  Factory,
  Eye,
  Dumbbell,
  Cake,
  Pizza,
  Truck,
  Wrench,
  Store,
  Home,
  Smartphone,
  Car,
  School,
  Hospital,
  Scissors,
  PartyPopper,
  Dog,
  Video,
  Droplet,
  Key,
  Wifi,
  Hammer,
  Monitor,
  Snowflake,
  Zap,
  Scale,
  Heart,
  Sofa,
  Tv,
  Refrigerator,
  Paintbrush,
  Calendar,
  ExternalLink,
  Briefcase,
  BellRing,
  PlayCircle,
  Percent,
  Timer,
  LifeBuoy,
  type LucideIcon
} from "lucide-react";

export interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  status?: 'active' | 'construction';
}

export interface MenuGroup {
  name: string;
  icon: LucideIcon;
  collapsible?: boolean;
  items: MenuItem[];
  description?: string;
}

export const adminMenuFull: MenuGroup[] = [
  // ==================== DASHBOARD ====================
  {
    name: "📊 Dashboard",
    icon: LayoutDashboard,
    collapsible: true,
    items: [
      { name: "Dashboard", path: "/admin-master", icon: LayoutDashboard, status: 'active' },
      { name: "Dashboard Gráficos", path: "/admin-master/dashboard-graficos", icon: BarChart3, status: 'active' },
      { name: "Métricas da Inteligência", path: "/admin-master/metricas-ia", icon: Brain, status: 'construction' },
      { name: "Relatórios", path: "/admin-master/relatorios", icon: FileText, status: 'construction' },
    ]
  },

  // ==================== USUÁRIOS & PLANOS ====================
  {
    name: "👥 Usuários & Planos",
    icon: Users,
    collapsible: true,
    items: [
      { name: "Usuários", path: "/admin-master/usuarios", icon: Users, status: 'active' },
      { name: "Cidades adicionais (pedidos)", path: "/admin-master/usuarios/cidades-adicionais", icon: MapPin, status: 'active' },
      { name: "Assinaturas de planos", path: "/admin-master/usuarios/assinaturas-planos", icon: CreditCard, status: 'active' },
      { name: "Planos", path: "/admin-master/planos", icon: CreditCard, status: 'active' },
      { name: "IA & Automação", path: "/admin-master/ia", icon: Bot, status: 'active' },
      { name: "Fábrica de Vídeos", path: "/admin-master/fabrica-videos", icon: Video, status: 'active' },
    ]
  },

  // ==================== FINANCEIRO & MARKETING ====================
  {
    name: "💰 Financeiro & Marketing",
    icon: DollarSign,
    collapsible: true,
    items: [
      { name: "Financeiro", path: "/admin-master/financeiro", icon: DollarSign, status: 'active' },
      { name: "Marketing", path: "/admin-master/marketing", icon: Megaphone, status: 'construction' },
      { name: "Configurações", path: "/admin-master/config", icon: Settings, status: 'active' },
    ]
  },

  // ==================== MOEDA CONECTA ====================
  {
    name: "💱 Moeda Conecta",
    icon: Coins,
    collapsible: true,
    description: "Transações, moderação e nome por cidade",
    items: [
      { name: "Transações e moderação", path: "/admin-master/moeda-conecta/transacoes", icon: TrendingUp, status: 'active' },
      { name: "Nome da moeda por cidade", path: "/admin-master/moeda-conecta/cidades", icon: Coins, status: 'active' },
      { name: "Compensações a fornecedores", path: "/admin-master/moeda-conecta/compensacoes", icon: Store, status: 'active' },
      { name: "Bônus por indicação por cidade", path: "/admin-master/configuracoes/bonus", icon: UserPlus, status: 'active' },
    ]
  },

  // ==================== CARONA SOLIDARIA ====================
  {
    name: "🚗 Carona Solidária",
    icon: Car,
    collapsible: true,
    description: "Taxas de exibição e desbloqueio de contato",
    items: [
      { name: "Taxas", path: "/admin-master/carona/config", icon: Car, status: 'active' },
    ]
  },

  // ==================== CRIPTOMOEDA CONECTA ====================
  {
    name: "🪙 CriptoMoeda Conecta",
    icon: Coins,
    collapsible: true,
    description: "Em construção",
    items: [
      { name: "CriptoMoeda Conecta", path: "/admin-master/criptomoeda-conecta", icon: Coins, status: 'construction' },
    ]
  },

  // ==================== COZINHA CHEF NEIDE ====================
  {
    name: "🍳 COZINHA CHEF NEIDE",
    icon: ChefHat,
    collapsible: true,
    items: [
      // ✅ 1º - DASHBOARD
      { name: "Dashboard Cozinha", path: "/admin-master/cozinha-chef", icon: LayoutDashboard, status: 'active' },
      // ✅ 2º - FINANCEIRO (MOVIDO PARA CÁ)
      { name: "Financeiro Cozinha", path: "/admin-master/cozinha-chef/financeiro", icon: DollarSign, status: 'active' },
      // ✅ 3º - PRATOS
      { name: "Pratos & Produtos", path: "/admin-master/cozinha-chef/pratos", icon: Utensils, status: 'active' },
      // ✅ 4º - RECEITAS
      { name: "Receitas", path: "/admin-master/cozinha-chef/receitas", icon: ChefHat, status: 'active' },
      // ✅ 5º - ESTOQUE
      { name: "Estoque", path: "/admin-master/cozinha-chef/estoque", icon: Package, status: 'active' },
      { name: "Movimentação Estoque", path: "/admin-master/cozinha-chef/movimentacoes", icon: TrendingUp, status: 'active' },
      // ✅ 6º - PRODUÇÃO
      { name: "Produção", path: "/admin-master/cozinha-chef/producao", icon: Factory, status: 'active' },
      // ✅ 7º - LISTA DE COMPRAS
      { name: "Lista de Compras", path: "/admin-master/cozinha-chef/compras", icon: ShoppingCart, status: 'active' },
      { name: "Pedidos", path: "/admin-master/cozinha-chef/pedidos", icon: ShoppingCart, status: 'active' },
      // ✅ 8º - PREVIEW
      { name: "Preview Cardápio", path: "/admin-master/cozinha-chef/preview", icon: Eye, status: 'active' },
      // ✅ 9º - DESCONTOS POR PERFIL
      { name: "Descontos por Perfil", path: "/admin-master/cozinha-chef/descontos", icon: Percent, status: 'active' },
    ]
  },

  // ==================== PESSOAL ====================
  {
    name: "🏦 PESSOAL",
    icon: User,
    collapsible: true,
    items: [
      { name: "Financeiro Pessoal", path: "/admin-master/financeiro-pessoal", icon: Wallet, status: 'active' },
    ]
  },

  // ==================== ACADEMIAS ====================
  {
    name: "🏋️ ACADEMIAS & ESPORTES",
    icon: Dumbbell,
    collapsible: true,
    items: [
      { name: "Academia (visão geral)", path: "/admin-master/academia-master", icon: Dumbbell, status: 'active' },
      { name: "Academia Aluno", path: "/admin-master/academia-master?tab=alunos", icon: Users, status: 'active' },
      { name: "Academias Empresa", path: "/admin-master/academia-master?tab=empresas", icon: Dumbbell, status: 'active' },
      { name: "Personal trainer", path: "/admin-master/personal-trainer", icon: Dumbbell, status: 'construction' },
    ]
  },

  // ==================== MARMITA & BOLOS ====================
  {
    name: "🍲 MARMITA & BOLOS",
    icon: Cake,
    collapsible: true,
    items: [
      { name: "Marmitaria", path: "/admin-master/marmitaria", icon: Utensils, status: 'construction' },
      { name: "Confeitarias", path: "/admin-master/confeitarias", icon: Cake, status: 'construction' },
      { name: "Bolos", path: "/admin-master/bolos", icon: Cake, status: 'construction' },
    ]
  },

  // ==================== ALIMENTAÇÃO ====================
  {
    name: "🍲 ALIMENTAÇÃO",
    icon: Utensils,
    collapsible: true,
    items: [
      { name: "Painel completo (todos)", path: "/admin-master/alimentacao", icon: Utensils, status: 'active' },
      { name: "Página Pública", path: "/alimentacao", icon: ExternalLink, status: 'active' },
      { name: "Restaurantes", path: "/admin-master/restaurantes", icon: Utensils, status: 'construction' },
      { name: "Lanchonetes", path: "/admin-master/lanchonetes", icon: Utensils, status: 'construction' },
      { name: "Pizzarias", path: "/admin-master/pizzarias", icon: Pizza, status: 'construction' },
    ]
  },

  // ==================== TRANSPORTE ====================
  {
    name: "🚚 TRANSPORTE & DELIVERY",
    icon: Truck,
    collapsible: true,
    items: [
      { name: "Moto táxi", path: "/admin-master/mototaxi", icon: Truck, status: 'active' },
      { name: "Entregadores", path: "/admin-master/entregadores", icon: Users, status: 'construction' },
    ]
  },

  // ==================== UTILIDADES ====================
  {
    name: "🛒 UTILIDADES",
    icon: Store,
    collapsible: true,
    items: [
      { name: "Água e gás", path: "/admin-master/utilidades/agua-gas", icon: Droplet, status: 'construction' },
      { name: "Chaveiros", path: "/admin-master/utilidades/chaveiros", icon: Key, status: 'construction' },
      { name: "Internet", path: "/admin-master/utilidades/internet", icon: Wifi, status: 'construction' },
    ]
  },

  // ==================== ÁGUA E GÁS ====================
  {
    name: "💧 ÁGUA E GÁS",
    icon: Droplet,
    collapsible: true,
    items: [
      { name: "Gerenciar Fornecedores", path: "/admin-master/agua-gas", icon: Store },
      { name: "Pedidos Recebidos",      path: "/admin-master/agua-gas?aba=pedidos", icon: ShoppingCart },
      { name: "Página Pública",         path: "/agua-gas", icon: ExternalLink },
    ]
  },

  // ==================== PROFISSIONAIS / SERVIÇOS ====================
  {
    name: "👷 PROFISSIONAIS / SERVIÇOS",
    icon: Hammer,
    collapsible: true,
    items: [
      { name: "Gerenciar Todos", path: "/admin-master/profissionais", icon: Users },
      { name: "Pedidos / Agendamentos", path: "/admin-master/profissionais?aba=agendamentos", icon: Calendar },
      { name: "Página Pública", path: "/profissionais", icon: ExternalLink },
    ]
  },

  // ==================== SERVIÇOS ====================
  {
    name: "🛠️ SERVIÇOS",
    icon: Wrench,
    collapsible: true,
    items: [
      { name: "Painel completo (todos)", path: "/admin-master/servicos", icon: Wrench, status: 'active' },
      { name: "Página Pública", path: "/servicos", icon: ExternalLink, status: 'active' },
      { name: "Serralheiro", path: "/admin-master/servicos/serralheiro", icon: Wrench, status: 'construction' },
      { name: "Montador", path: "/admin-master/servicos/montador", icon: Hammer, status: 'construction' },
      { name: "Técnico informática", path: "/admin-master/servicos/tecnico-informatica", icon: Monitor, status: 'construction' },
      { name: "Técnico celular", path: "/admin-master/servicos/tecnico-celular", icon: Smartphone, status: 'construction' },
      { name: "Refrigeração", path: "/admin-master/servicos/refrigeracao", icon: Snowflake, status: 'construction' },
      { name: "Instalações", path: "/admin-master/servicos/instalacoes", icon: Zap, status: 'construction' },
      { name: "Advogado", path: "/admin-master/servicos/advogado", icon: Scale, status: 'construction' },
      { name: "Terapeuta", path: "/admin-master/servicos/terapeuta", icon: Heart, status: 'construction' },
    ]
  },

  // ==================== MERCADOS ====================
  {
    name: "🛒 MERCADOS",
    icon: Store,
    collapsible: true,
    items: [
      { name: "Painel completo (todos)", path: "/admin-master/mercados", icon: Store, status: 'active' },
      { name: "Página Pública", path: "/mercados", icon: ExternalLink, status: 'active' },
      { name: "Mercados", path: "/admin-master/mercados/mercados", icon: Store, status: 'construction' },
      { name: "Mercadinhos", path: "/admin-master/mercados/mercadinhos", icon: Store, status: 'construction' },
      { name: "Atacadistas", path: "/admin-master/mercados/atacadistas", icon: Store, status: 'construction' },
      { name: "Hortifruti", path: "/admin-master/mercados/hortifruti", icon: Store, status: 'construction' },
      { name: "Açougues", path: "/admin-master/mercados/acougues", icon: Store, status: 'construction' },
      { name: "Distribuidoras", path: "/admin-master/mercados/distribuidoras", icon: Store, status: 'construction' },
      { name: "Conveniência", path: "/admin-master/mercados/conveniencia", icon: Store, status: 'construction' },
    ]
  },

  // ==================== IMÓVEL ====================
  {
    name: "👗 IMÓVEL / HOSPEDAGEM",
    icon: Home,
    collapsible: true,
    items: [
      { name: "Painel completo (todos)", path: "/admin-master/imoveis", icon: Home, status: 'active' },
      { name: "Página Pública", path: "/imoveis", icon: ExternalLink, status: 'active' },
      { name: "Venda de imóvel", path: "/admin-master/imovel/venda", icon: Home, status: 'construction' },
      { name: "Aluguel de imóvel", path: "/admin-master/imovel/aluguel", icon: Home, status: 'construction' },
      { name: "Hotel", path: "/admin-master/imovel/hotel", icon: Home, status: 'construction' },
      { name: "Pousada", path: "/admin-master/imovel/pousada", icon: Home, status: 'construction' },
      { name: "Dormitório", path: "/admin-master/imovel/dormitorio", icon: Home, status: 'construction' },
    ]
  },

  // ==================== AGRO ====================
  {
    name: "🐄 AGRO & CAMPO",
    icon: Store,
    collapsible: true,
    items: [
      { name: "Agropecuária", path: "/admin-master/agro/agropecuaria", icon: Store, status: 'construction' },
      { name: "Ração animal", path: "/admin-master/agro/racao", icon: Store, status: 'construction' },
      { name: "Produtos agrícolas", path: "/admin-master/agro/produtos", icon: Store, status: 'construction' },
      { name: "Ferramentas rurais", path: "/admin-master/agro/ferramentas", icon: Store, status: 'construction' },
      { name: "Irrigação", path: "/admin-master/agro/irrigacao", icon: Store, status: 'construction' },
      { name: "Veterinário", path: "/admin-master/agro/veterinario", icon: Store, status: 'construction' },
      { name: "Insumos agro", path: "/admin-master/agro/insumos", icon: Store, status: 'construction' },
      { name: "Produtos para sisal", path: "/admin-master/agro/sisal", icon: Store, status: 'construction' },
    ]
  },

  // ==================== CONSTRUÇÃO ====================
  {
    name: "🛠️ CONSTRUÇÃO",
    icon: Hammer,
    collapsible: true,
    items: [
      { name: "Painel completo (todos)", path: "/admin-master/construcao", icon: Hammer, status: 'active' },
      { name: "Página Pública", path: "/construcao", icon: ExternalLink, status: 'active' },
      { name: "Eletricista", path: "/admin-master/construcao/eletricista", icon: Zap, status: 'construction' },
      { name: "Encanador", path: "/admin-master/construcao/encanador", icon: Droplet, status: 'construction' },
      { name: "Pedreiro", path: "/admin-master/construcao/pedreiro", icon: Hammer, status: 'construction' },
      { name: "Pintor", path: "/admin-master/construcao/pintor", icon: Paintbrush, status: 'construction' },
      { name: "Marceneiro", path: "/admin-master/construcao/marceneiro", icon: Hammer, status: 'construction' },
      { name: "Material de Construção", path: "/admin-master/construcao/material", icon: Store, status: 'construction' },
    ]
  },

  // ==================== MÓVEIS E ELETRODOMÉSTICOS ====================
  {
    name: "🪑 MÓVEIS E ELETRODOMÉSTICOS",
    icon: Sofa,
    collapsible: true,
    items: [
      { name: "Móveis", path: "/admin-master/moveis/moveis", icon: Sofa, status: 'construction' },
      { name: "Eletrodomésticos", path: "/admin-master/moveis/eletrodomesticos", icon: Tv, status: 'construction' },
      { name: "Refrigeração", path: "/admin-master/moveis/refrigeracao", icon: Refrigerator, status: 'construction' },
    ]
  },

  // ==================== ALUGUEL DE MÁQUINAS ====================
  {
    name: "👗 ALUGUEL DE MÁQUINAS",
    icon: Store,
    collapsible: true,
    description: "Muito forte no interior",
    items: [
      { name: "Aluguel de trator", path: "/admin-master/maquinas/trator", icon: Store, status: 'construction' },
      { name: "Aluguel de Betoneira", path: "/admin-master/maquinas/betoneira", icon: Store, status: 'construction' },
      { name: "Aluguel de Rompedor", path: "/admin-master/maquinas/rompedor", icon: Store, status: 'construction' },
      { name: "Aluguel de Andaime", path: "/admin-master/maquinas/andaime", icon: Store, status: 'construction' },
    ]
  },

  // ==================== ELETRÔNICO/TECNOLOGIA ====================
  {
    name: "📱 ELETRÔNICO/TECNOLOGIA",
    icon: Smartphone,
    collapsible: true,
    items: [
      { name: "Assistência celular", path: "/admin-master/tecnologia/assistencia-celular", icon: Smartphone, status: 'construction' },
      { name: "Loja de celular", path: "/admin-master/tecnologia/loja-celular", icon: Smartphone, status: 'construction' },
      { name: "Informática", path: "/admin-master/tecnologia/informatica", icon: Smartphone, status: 'construction' },
      { name: "Internet", path: "/admin-master/tecnologia/internet", icon: Smartphone, status: 'construction' },
      { name: "Câmeras", path: "/admin-master/tecnologia/cameras", icon: Smartphone, status: 'construction' },
      { name: "Segurança eletrônica", path: "/admin-master/tecnologia/seguranca", icon: Smartphone, status: 'construction' },
    ]
  },

  // ==================== AUTOMOTIVO ====================
  {
    name: "🚗 AUTOMOTIVO",
    icon: Car,
    collapsible: true,
    items: [
      { name: "Oficina", path: "/admin-master/automotivo/oficina", icon: Car, status: 'construction' },
      { name: "Auto peças", path: "/admin-master/automotivo/pecas", icon: Car, status: 'construction' },
      { name: "Lava jato", path: "/admin-master/automotivo/lava-jato", icon: Car, status: 'construction' },
      { name: "Borracharia", path: "/admin-master/automotivo/borracharia", icon: Car, status: 'construction' },
      { name: "Auto elétrica", path: "/admin-master/automotivo/eletrica", icon: Car, status: 'construction' },
      { name: "Som automotivo", path: "/admin-master/automotivo/som", icon: Car, status: 'construction' },
      { name: "Motos", path: "/admin-master/automotivo/motos", icon: Car, status: 'construction' },
    ]
  },

  // ==================== EDUCAÇÃO ====================
  {
    name: "🎓 EDUCAÇÃO",
    icon: School,
    collapsible: true,
    items: [
      { name: "Escolas", path: "/admin-master/educacao/escolas", icon: School, status: 'construction' },
      { name: "Cursos", path: "/admin-master/educacao/cursos", icon: School, status: 'construction' },
      { name: "Reforço escolar", path: "/admin-master/educacao/reforco", icon: School, status: 'construction' },
      { name: "Idiomas", path: "/admin-master/educacao/idiomas", icon: School, status: 'construction' },
      { name: "Informática", path: "/admin-master/educacao/informatica", icon: School, status: 'construction' },
      { name: "Música", path: "/admin-master/educacao/musica", icon: School, status: 'construction' },
    ]
  },

  // ==================== SAÚDE ====================
  {
    name: "🏥 SAÚDE",
    icon: Hospital,
    collapsible: true,
    items: [
      { name: "Painel completo (todos)", path: "/admin-master/saude", icon: Hospital, status: 'active' },
      { name: "Página Pública", path: "/saude", icon: ExternalLink, status: 'active' },
      { name: "Farmácias", path: "/admin-master/saude/farmacias", icon: Hospital, status: 'construction' },
      { name: "Clínicas", path: "/admin-master/saude/clinicas", icon: Hospital, status: 'construction' },
      { name: "Dentistas", path: "/admin-master/saude/dentistas", icon: Hospital, status: 'construction' },
      { name: "Psicólogos", path: "/admin-master/saude/psicologos", icon: Hospital, status: 'construction' },
      { name: "Nutricionistas", path: "/admin-master/saude/nutricionistas", icon: Hospital, status: 'construction' },
      { name: "Laboratórios", path: "/admin-master/saude/laboratorios", icon: Hospital, status: 'construction' },
      { name: "Fisioterapia", path: "/admin-master/saude/fisioterapia", icon: Hospital, status: 'construction' },
      { name: "Óticas", path: "/admin-master/saude/oticas", icon: Hospital, status: 'construction' },
    ]
  },

  // ==================== MODA (LOJA / MARKETPLACE) ====================
  {
    name: "👗 MODA (LOJA)",
    icon: Scissors,
    collapsible: true,
    items: [
      { name: "Painel completo (todos)", path: "/admin-master/moda", icon: Scissors, status: 'active' },
      { name: "Página Pública", path: "/moda", icon: ExternalLink, status: 'active' },
    ]
  },

  // ==================== MODA MASCULINA ====================
  {
    name: "👗 MODA MASCULINA",
    icon: Scissors,
    collapsible: true,
    description: "Muito forte no interior",
    items: [
      { name: "Moda infantil", path: "/admin-master/moda-masculina/infantil", icon: Scissors, status: 'construction' },
      { name: "Calçados", path: "/admin-master/moda-masculina/calcados", icon: Scissors, status: 'construction' },
      { name: "Bolsas", path: "/admin-master/moda-masculina/bolsas", icon: Scissors, status: 'construction' },
      { name: "Moda íntima", path: "/admin-master/moda-masculina/intima", icon: Scissors, status: 'construction' },
      { name: "Moda evangélica", path: "/admin-master/moda-masculina/evangelica", icon: Scissors, status: 'construction' },
    ]
  },

  // ==================== MODA FEMININA ====================
  {
    name: "👗 MODA FEMININA",
    icon: Scissors,
    collapsible: true,
    items: [
      { name: "Moda infantil", path: "/admin-master/moda-feminina/infantil", icon: Scissors, status: 'construction' },
      { name: "Calçados", path: "/admin-master/moda-feminina/calcados", icon: Scissors, status: 'construction' },
      { name: "Bolsas", path: "/admin-master/moda-feminina/bolsas", icon: Scissors, status: 'construction' },
      { name: "Moda íntima", path: "/admin-master/moda-feminina/intima", icon: Scissors, status: 'construction' },
      { name: "Moda fitness", path: "/admin-master/moda-feminina/fitness", icon: Scissors, status: 'construction' },
      { name: "Acessórios", path: "/admin-master/moda-feminina/acessorios", icon: Scissors, status: 'construction' },
    ]
  },

  // ==================== BELEZA ====================
  {
    name: "💄 BELEZA & ESTÉTICA",
    icon: Scissors,
    collapsible: true,
    items: [
      { name: "Salão de beleza", path: "/admin-master/beleza/salao", icon: Scissors, status: 'construction' },
      { name: "Barbearia", path: "/admin-master/beleza/barbearia", icon: Scissors, status: 'construction' },
      { name: "Manicure", path: "/admin-master/beleza/manicure", icon: Scissors, status: 'construction' },
      { name: "Maquiagem", path: "/admin-master/beleza/maquiagem", icon: Scissors, status: 'construction' },
      { name: "Estética facial", path: "/admin-master/beleza/facial", icon: Scissors, status: 'construction' },
      { name: "Estética corporal", path: "/admin-master/beleza/corporal", icon: Scissors, status: 'construction' },
      { name: "Produtos cosméticos", path: "/admin-master/beleza/cosmeticos", icon: Scissors, status: 'construction' },
      { name: "Perfumaria", path: "/admin-master/beleza/perfumaria", icon: Scissors, status: 'construction' },
    ]
  },

  // ==================== EVENTOS ====================
  {
    name: "🎉 EVENTOS & ENTRETENIMENTO",
    icon: PartyPopper,
    collapsible: true,
    items: [
      { name: "Eventos", path: "/admin-master/eventos/eventos", icon: PartyPopper, status: 'construction' },
      { name: "Decoração", path: "/admin-master/eventos/decoracao", icon: PartyPopper, status: 'construction' },
      { name: "Buffet", path: "/admin-master/eventos/buffet", icon: PartyPopper, status: 'construction' },
      { name: "Fotografia", path: "/admin-master/eventos/fotografia", icon: PartyPopper, status: 'construction' },
      { name: "Filmagem", path: "/admin-master/eventos/filmagem", icon: PartyPopper, status: 'construction' },
      { name: "Convites", path: "/admin-master/eventos/convites", icon: PartyPopper, status: 'construction' },
      { name: "Espaços de festa", path: "/admin-master/eventos/espacos", icon: PartyPopper, status: 'construction' },
    ]
  },

  // ==================== PET ====================
  {
    name: "🐶 PET SHOP & ANIMAIS",
    icon: Dog,
    collapsible: true,
    items: [
      { name: "Painel completo (todos)", path: "/admin-master/pet", icon: Dog, status: 'active' },
      { name: "Página Pública", path: "/pet", icon: ExternalLink, status: 'active' },
      { name: "Pet shop", path: "/admin-master/pet/pet-shop", icon: Dog, status: 'construction' },
      { name: "Banho e tosa", path: "/admin-master/pet/banho-tosa", icon: Dog, status: 'construction' },
      { name: "Veterinário", path: "/admin-master/pet/veterinario", icon: Dog, status: 'construction' },
      { name: "Ração", path: "/admin-master/pet/racao", icon: Dog, status: 'construction' },
      { name: "Medicamentos animais", path: "/admin-master/pet/medicamentos", icon: Dog, status: 'construction' },
    ]
  },

  // ==================== EMPREGO ====================
  {
    name: "💼 EMPREGO",
    icon: Briefcase,
    collapsible: true,
    items: [
      { name: "Painel completo (todos)", path: "/admin-master/emprego", icon: Briefcase, status: 'active' },
      { name: "Página Pública", path: "/empregos", icon: ExternalLink, status: 'active' },
    ]
  },

  // ==================== FINANCEIRO ====================
  {
    name: "🏦 FINANCEIRO",
    icon: DollarSign,
    collapsible: true,
    items: [
      { name: "Módulo Fiado (liberar por loja)", path: "/admin-master/fiado", icon: DollarSign, status: 'active' },
      { name: "Módulo Agenda + Fila (liberar por loja)", path: "/admin-master/agenda", icon: Calendar, status: 'active' },
      { name: "Correspondente bancário", path: "/admin-master/financeiro/correspondente", icon: DollarSign, status: 'construction' },
      { name: "Empréstimos", path: "/admin-master/financeiro/emprestimos", icon: DollarSign, status: 'construction' },
      { name: "Seguros", path: "/admin-master/financeiro/seguros", icon: DollarSign, status: 'construction' },
      { name: "Contabilidade", path: "/admin-master/financeiro/contabilidade", icon: DollarSign, status: 'construction' },
      { name: "Consultoria financeira", path: "/admin-master/financeiro/consultoria", icon: DollarSign, status: 'construction' },
    ]
  },

  // ==================== DEMANDA DE BUSCA ====================
  {
    name: "🔔 DEMANDAS DE BUSCA",
    icon: BellRing,
    collapsible: true,
    items: [
      { name: "Buscas sem resultado", path: "/admin-master/demandas", icon: BellRing, status: 'active' },
    ]
  },

  // ==================== SUPORTE ====================
  {
    name: "📞 SUPORTE",
    icon: LifeBuoy,
    collapsible: true,
    items: [
      { name: "Contato de suporte (WhatsApp/email)", path: "/admin-master/configuracoes/suporte", icon: LifeBuoy, status: 'active' },
      { name: "Aviso geral (push pra todos)", path: "/admin-master/configuracoes/aviso-geral", icon: Megaphone, status: 'active' },
      { name: "Comunicado oficial (card da home)", path: "/admin-master/configuracoes/comunicados", icon: Megaphone, status: 'active' },
      { name: "Divulgação (convites em massa)", path: "/admin-master/configuracoes/divulgacao", icon: UserPlus, status: 'active' },
      { name: "Chat com usuários", path: "/admin-master/chat", icon: MessageCircle, status: 'active' },
    ]
  },

  // ==================== HOME ====================
  {
    name: "🏠 HOME",
    icon: Timer,
    collapsible: true,
    items: [
      { name: "Carrossel de destaques", path: "/admin-master/configuracoes/carrossel", icon: Timer, status: 'active' },
    ]
  },

  // ==================== PDV COLABORATIVO ====================
  {
    name: "📦 PDV COLABORATIVO",
    icon: Package,
    collapsible: true,
    items: [
      { name: "Relatório do catálogo", path: "/admin-master/pdv/relatorios", icon: Package, status: 'active' },
    ]
  },

  // ==================== LANÇAMENTO ====================
  {
    name: "🎬 LANÇAMENTO",
    icon: PlayCircle,
    collapsible: true,
    items: [
      { name: "Vídeo de apresentação", path: "/admin-master/configuracoes/lancamento", icon: PlayCircle, status: 'active' },
      { name: "Página Pública", path: "/lancamento", icon: ExternalLink, status: 'active' },
      { name: "Vídeo de boas-vindas", path: "/admin-master/configuracoes/boas-vindas", icon: PlayCircle, status: 'active' },
    ]
  },
];

export default adminMenuFull;


