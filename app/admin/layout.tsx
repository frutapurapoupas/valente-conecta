"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import {
  Menu, X, Crown, Users, Settings, Utensils, Dumbbell, Truck,
  Wrench, Store, Activity, Gift, Package, ShoppingCart,
  ClipboardList, TrendingUp, ChevronDown, ChevronRight,
  Wallet, ArrowUpCircle, ArrowDownCircle, PieChart, Calendar, PlusCircle
} from "lucide-react";

// Estrutura completa do menu lateral
const menuEstrutura = [
  {
    titulo: "📊 DASHBOARD",
    icon: "📊",
    items: [
      { nome: "Dashboard Principal", href: "/admin", status: "ativo" },
      { nome: "Métricas da IA", href: "/admin/metricas-ia", status: "construcao" },
      { nome: "Relatórios", href: "/admin/relatorios", status: "construcao" }
    ]
  },
  {
    titulo: "⚙️ CONFIGURAÇÕES",
    icon: "⚙️",
    items: [
      { nome: "Configuração da Home", href: "/admin/configuracoes", status: "ativo" },
      { nome: "Notificações do Sistema", href: "/admin/notificacoes", status: "ativo" },
      { nome: "Configurações Gerais", href: "/admin/configuracoes-gerais", status: "construcao" },
      { nome: "Segurança", href: "/admin/seguranca", status: "construcao" }
    ]
  },
  {
    titulo: "👥 USUÁRIOS & PLANOS",
    icon: "👥",
    items: [
      { nome: "Gerenciar Usuários", href: "/admin/usuarios", status: "ativo" },
      { nome: "Gerenciar Planos", href: "/admin/planos", status: "ativo" },
      { nome: "Gerenciar Benefícios", href: "/admin/beneficios", status: "ativo" },
      { nome: "Financeiro", href: "/admin/financeiro", status: "construcao" }
    ]
  },
  {
    titulo: "💰 FINANCEIRO PESSOAL",
    icon: "💰",
    items: [
      { nome: "Dashboard Financeiro", href: "/admin/financeiro-pessoal", status: "ativo" },
      { nome: "Minhas Transações", href: "/admin/financeiro-pessoal/transacoes", status: "ativo" },
      { nome: "Contas a Pagar", href: "/admin/financeiro-pessoal/contas-pagar", status: "ativo" },
      { nome: "Contas a Receber", href: "/admin/financeiro-pessoal/contas-receber", status: "ativo" },
      { nome: "Categorias", href: "/admin/financeiro-pessoal/categorias", status: "ativo" },
      { nome: "Relatórios", href: "/admin/financeiro-pessoal/relatorios", status: "ativo" },
      { nome: "Extrato Bancário", href: "/admin/financeiro-pessoal/extrato", status: "ativo" },
      { nome: "Configurações", href: "/admin/financeiro-pessoal/configuracoes", status: "ativo" }
    ]
  },
  {
    titulo: "🍳 COZINHA DONA NEIDE",
    icon: "🍳",
    items: [
      { nome: "Dashboard Cozinha", href: "/admin/cozinha/dashboard", status: "ativo" },
      { nome: "Fornecedores", href: "/admin/cozinha/fornecedores", status: "ativo" },
      { nome: "Ingredientes", href: "/admin/cozinha/ingredientes", status: "ativo" },
      { nome: "Receitas", href: "/admin/cozinha/receitas", status: "ativo" },
      { nome: "➕ NOVO PRATO", href: "/admin/cozinha/novo-prato", status: "ativo", destaque: true },
      { nome: "Cardápio Público", href: "/admin/cozinha/cardapio", status: "ativo" },
      { nome: "📋 Fila de Pedidos", href: "/admin/cozinha/pedidos", status: "ativo" },
      { nome: "🔧 Produção", href: "/admin/cozinha/producao", status: "ativo" },
      { nome: "📊 Dashboard Métricas", href: "/admin/cozinha/dashboard-metricas", status: "ativo" },
      { nome: "🏆 Top Produtos", href: "/admin/cozinha/top-produtos", status: "ativo" },
      { nome: "📈 Relatório Vendas", href: "/admin/cozinha/relatorio-vendas", status: "ativo" },
      { nome: "Lista de Compras", href: "/admin/cozinha/compras", status: "ativo" },
      { nome: "Movimentações", href: "/admin/cozinha/movimentacoes", status: "ativo" },
      { nome: "Sincronização", href: "/admin/cozinha/sincronizacao", status: "ativo" }
    ]
  },
  {
    titulo: "🍲 MARMITA & BOLOS",
    icon: "🍲",
    items: [
      { nome: "Marmitaria", href: "/admin/marmitaria", status: "construcao" },
      { nome: "Delicatessen", href: "/admin/delicatessen", status: "construcao" },
      { nome: "Confeitarias", href: "/admin/confeitarias", status: "construcao" }
    ]
  },
  {
    titulo: "💪 ACADEMIAS & ESPORTES",
    icon: "💪",
    items: [
      { nome: "Academias", href: "/admin/academias", status: "construcao" },
      { nome: "Personal Trainer", href: "/admin/personal-trainer", status: "construcao" }
    ]
  },
  {
    titulo: "🚚 TRANSPORTE & DELIVERY",
    icon: "🚚",
    items: [
      { nome: "Moto Táxi", href: "/admin/mototaxi", status: "ativo" },
      { nome: "Entregadores", href: "/admin/entregadores", status: "construcao" }
    ]
  },
  {
    titulo: "🛒 UTILIDADES",
    icon: "🛒",
    items: [
      { nome: "Água e Gás", href: "/admin/agua-gas", status: "construcao" },
      { nome: "Chaveiros", href: "/admin/chaveiros", status: "construcao" }
    ]
  },
  {
    titulo: "🔧 SERVIÇOS",
    icon: "🔧",
    items: [
      { nome: "Serralheiro", href: "/admin/serralheiro", status: "construcao" },
      { nome: "Montador", href: "/admin/montador", status: "construcao" },
      { nome: "Técnico Informática", href: "/admin/tecnico-informatica", status: "construcao" }
    ]
  },
  {
    titulo: "🏪 MERCADOS",
    icon: "🏪",
    items: [
      { nome: "Mercados", href: "/admin/mercados", status: "construcao" },
      { nome: "Hortifruti", href: "/admin/hortifruti", status: "construcao" }
    ]
  },
  {
    titulo: "🏠 IMÓVEL / HOSPEDAGEM",
    icon: "🏠",
    items: [
      { nome: "Venda de Imóvel", href: "/admin/venda-imovel", status: "construcao" },
      { nome: "Aluguel de Imóvel", href: "/admin/aluguel-imovel", status: "construcao" }
    ]
  },
  {
    titulo: "🌾 AGRO & CAMPO",
    icon: "🌾",
    items: [
      { nome: "Agropecuária", href: "/admin/agropecuaria", status: "construcao" },
      { nome: "Produtos Agrícolas", href: "/admin/produtos-agricolas", status: "construcao" }
    ]
  },
  {
    titulo: "🏗️ CONSTRUÇÃO",
    icon: "🏗️",
    items: [
      { nome: "Eletricista", href: "/admin/eletricista", status: "construcao" },
      { nome: "Encanador", href: "/admin/encanador", status: "construcao" },
      { nome: "Pedreiro", href: "/admin/pedreiro", status: "construcao" }
    ]
  },
  {
    titulo: "📱 TECNOLOGIA",
    icon: "📱",
    items: [
      { nome: "Assistência Celular", href: "/admin/assistencia-celular", status: "construcao" },
      { nome: "Informática", href: "/admin/informatica", status: "construcao" }
    ]
  },
  {
    titulo: "🚗 AUTOMOTIVO",
    icon: "🚗",
    items: [
      { nome: "Oficina", href: "/admin/oficina", status: "construcao" },
      { nome: "Auto Peças", href: "/admin/auto-pecas", status: "construcao" },
      { nome: "Lava Jato", href: "/admin/lava-jato", status: "construcao" }
    ]
  },
  {
    titulo: "🎓 EDUCAÇÃO",
    icon: "🎓",
    items: [
      { nome: "Escolas", href: "/admin/escolas", status: "construcao" },
      { nome: "Cursos", href: "/admin/cursos", status: "construcao" }
    ]
  },
  {
    titulo: "🏥 SAÚDE",
    icon: "🏥",
    items: [
      { nome: "Farmácias", href: "/admin/farmacias", status: "construcao" },
      { nome: "Clínicas", href: "/admin/clinicas", status: "construcao" },
      { nome: "Dentistas", href: "/admin/dentistas", status: "construcao" }
    ]
  },
  {
    titulo: "💄 BELEZA & ESTÉTICA",
    icon: "💄",
    items: [
      { nome: "Salão de Beleza", href: "/admin/salao-beleza", status: "construcao" },
      { nome: "Barbearia", href: "/admin/barbearia", status: "construcao" },
      { nome: "Manicure", href: "/admin/manicure", status: "construcao" }
    ]
  },
  {
    titulo: "🎉 EVENTOS & ENTRETENIMENTO",
    icon: "🎉",
    items: [
      { nome: "Eventos", href: "/admin/eventos", status: "construcao" },
      { nome: "Buffet", href: "/admin/buffet", status: "construcao" },
      { nome: "Fotografia", href: "/admin/fotografia", status: "construcao" }
    ]
  },
  {
    titulo: "🐶 PET SHOP & ANIMAIS",
    icon: "🐶",
    items: [
      { nome: "Pet Shop", href: "/admin/petshop", status: "construcao" },
      { nome: "Banho e Tosa", href: "/admin/banho-tosa", status: "construcao" }
    ]
  },
  {
    titulo: "🏦 FINANCEIRO GERAL",
    icon: "🏦",
    items: [
      { nome: "Correspondente Bancário", href: "/admin/correspondente", status: "construcao" },
      { nome: "Empréstimos", href: "/admin/emprestimos", status: "construcao" }
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, user } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Carregar preferências salvas
  useEffect(() => {
    const saved = localStorage.getItem('expanded_menus_admin');
    if (saved) {
      setExpandedMenus(JSON.parse(saved));
    } else {
      setExpandedMenus({ "🍳 COZINHA DONA NEIDE": true });
    }
  }, []);

  // Salvar preferências quando mudar
  const toggleMenu = (titulo: string) => {
    setExpandedMenus(prev => {
      const novo = { ...prev, [titulo]: !prev[titulo] };
      localStorage.setItem('expanded_menus_admin', JSON.stringify(novo));
      return novo;
    });
  };

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  if (!isAdmin) {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return null;
  }

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      "📊": <TrendingUp className="w-5 h-5 text-yellow-400" />,
      "⚙️": <Settings className="w-5 h-5 text-yellow-400" />,
      "👥": <Users className="w-5 h-5 text-yellow-400" />,
      "💰": <Wallet className="w-5 h-5 text-yellow-400" />,
      "🍳": <Utensils className="w-5 h-5 text-yellow-400" />,
      "🍲": <Package className="w-5 h-5 text-yellow-400" />,
      "💪": <Activity className="w-5 h-5 text-yellow-400" />,
      "🚚": <Truck className="w-5 h-5 text-yellow-400" />,
      "🛒": <ShoppingCart className="w-5 h-5 text-yellow-400" />,
      "🔧": <Wrench className="w-5 h-5 text-yellow-400" />,
      "🏪": <Store className="w-5 h-5 text-yellow-400" />,
      "🏠": <Store className="w-5 h-5 text-yellow-400" />,
      "🌾": <Activity className="w-5 h-5 text-yellow-400" />,
      "🏗️": <Wrench className="w-5 h-5 text-yellow-400" />,
      "📱": <Activity className="w-5 h-5 text-yellow-400" />,
      "🚗": <Truck className="w-5 h-5 text-yellow-400" />,
      "🎓": <Users className="w-5 h-5 text-yellow-400" />,
      "🏥": <Activity className="w-5 h-5 text-yellow-400" />,
      "💄": <Activity className="w-5 h-5 text-yellow-400" />,
      "🎉": <Gift className="w-5 h-5 text-yellow-400" />,
      "🐶": <Activity className="w-5 h-5 text-yellow-400" />,
      "🏦": <Wallet className="w-5 h-5 text-yellow-400" />
    };
    return icons[iconName] || <Settings className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2 hover:bg-white/20 rounded-xl transition-colors"
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Crown className="w-6 h-6 text-yellow-300" />
          <h1 className="text-white font-bold text-lg hidden sm:block">Admin Master</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm hidden sm:block">{user?.nome || "Admin"}</span>
          <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">{user?.nome?.charAt(0) || "A"}</span>
          </div>
        </div>
      </header>

      <div className="flex relative">
        <div
          className={`
            fixed md:relative z-40 transition-all duration-300 ease-in-out
            bg-gray-800 min-h-screen overflow-y-auto
            ${sidebarOpen ? 'left-0' : '-left-80 md:left-0'}
            w-80 shadow-xl
          `}
        >
          {sidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-[-1] md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="p-4 space-y-2">
            <div className="flex items-center gap-3 p-3 mb-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{user?.nome || "Admin"}</p>
                <p className="text-gray-400 text-xs">Administrador Master</p>
              </div>
            </div>

            {menuEstrutura.map((menu, idx) => (
              <div key={idx} className="border-b border-gray-700 pb-2">
                <button
                  onClick={() => toggleMenu(menu.titulo)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {getIcon(menu.icon)}
                    <span className="text-white font-medium text-sm">{menu.titulo}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedMenus[menu.titulo] ? 'rotate-180' : ''}`} />
                </button>

                {expandedMenus[menu.titulo] && (
                  <div className="ml-8 mt-1 space-y-1">
                    {menu.items.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        onClick={() => {
                          if (item.status === "ativo") {
                            router.push(item.href);
                            if (isMobile) setSidebarOpen(false);
                          } else {
                            alert(`🚧 Módulo em construção: ${item.nome}`);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-between group ${
                          pathname === item.href ? 'bg-white/10' : ''
                        } ${item.destaque ? 'bg-yellow-500/20 border border-yellow-500/50' : ''}`}
                      >
                        <span className={`text-sm ${item.status === "ativo" ? "text-gray-300 group-hover:text-white" : "text-gray-500"} ${item.destaque ? "text-yellow-400 font-bold" : ""}`}>
                          {item.nome}
                        </span>
                        {item.status === "construcao" && (
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">🚧</span>
                        )}
                        {item.status === "ativo" && (
                          <ChevronRight className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  );
}