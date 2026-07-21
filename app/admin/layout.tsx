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
    titulo: "ðŸ“Š DASHBOARD",
    icon: "ðŸ“Š",
    items: [
      { nome: "Dashboard Principal", href: "/admin", status: "ativo" },
      { nome: "MÃ©tricas da IA", href: "/admin/metricas-ia", status: "construcao" },
      { nome: "RelatÃ³rios", href: "/admin/relatorios", status: "construcao" }
    ]
  },
  {
    titulo: "âš™ï¸ CONFIGURAÃ‡Ã•ES",
    icon: "âš™ï¸",
    items: [
      { nome: "ConfiguraÃ§Ã£o da Home", href: "/admin/configuracoes", status: "ativo" },
      { nome: "NotificaÃ§Ãµes do Sistema", href: "/admin/notificacoes", status: "ativo" },
      { nome: "ConfiguraÃ§Ãµes Gerais", href: "/admin/configuracoes-gerais", status: "construcao" },
      { nome: "SeguranÃ§a", href: "/admin/seguranca", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸ‘¥ USUÃRIOS & PLANOS",
    icon: "ðŸ‘¥",
    items: [
      { nome: "Gerenciar UsuÃ¡rios", href: "/admin/usuarios", status: "ativo" },
      { nome: "Gerenciar Planos", href: "/admin/planos", status: "ativo" },
      { nome: "Gerenciar BenefÃ­cios", href: "/admin/beneficios", status: "ativo" },
      { nome: "Financeiro", href: "/admin/financeiro", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸ’° FINANCEIRO PESSOAL",
    icon: "ðŸ’°",
    items: [
      { nome: "Dashboard Financeiro", href: "/admin/financeiro-pessoal", status: "ativo" },
      { nome: "Minhas TransaÃ§Ãµes", href: "/admin/financeiro-pessoal/transacoes", status: "ativo" },
      { nome: "Contas a Pagar", href: "/admin/financeiro-pessoal/contas-pagar", status: "ativo" },
      { nome: "Contas a Receber", href: "/admin/financeiro-pessoal/contas-receber", status: "ativo" },
      { nome: "Categorias", href: "/admin/financeiro-pessoal/categorias", status: "ativo" },
      { nome: "RelatÃ³rios", href: "/admin/financeiro-pessoal/relatorios", status: "ativo" },
      { nome: "Extrato BancÃ¡rio", href: "/admin/financeiro-pessoal/extrato", status: "ativo" },
      { nome: "ConfiguraÃ§Ãµes", href: "/admin/financeiro-pessoal/configuracoes", status: "ativo" }
    ]
  },
  {
    titulo: "ðŸ³ COZINHA DONA NEIDE",
    icon: "ðŸ³",
    items: [
      { nome: "Dashboard Cozinha", href: "/admin/cozinha/dashboard", status: "ativo" },
      { nome: "Fornecedores", href: "/admin/cozinha/fornecedores", status: "ativo" },
      { nome: "Ingredientes", href: "/admin/cozinha/ingredientes", status: "ativo" },
      { nome: "Receitas", href: "/admin/cozinha/receitas", status: "ativo" },
      { nome: "âž• NOVO PRATO", href: "/admin/cozinha/novo-prato", status: "ativo", destaque: true },
      { nome: "CardÃ¡pio PÃºblico", href: "/admin/cozinha/cardapio", status: "ativo" },
      { nome: "ðŸ“‹ Fila de Pedidos", href: "/admin/cozinha/pedidos", status: "ativo" },
      { nome: "ðŸ”§ ProduÃ§Ã£o", href: "/admin/cozinha/producao", status: "ativo" },
      { nome: "ðŸ“Š Dashboard MÃ©tricas", href: "/admin/cozinha/dashboard-metricas", status: "ativo" },
      { nome: "ðŸ† Top Produtos", href: "/admin/cozinha/top-produtos", status: "ativo" },
      { nome: "ðŸ“ˆ RelatÃ³rio Vendas", href: "/admin/cozinha/relatorio-vendas", status: "ativo" },
      { nome: "Lista de Compras", href: "/admin/cozinha/compras", status: "ativo" },
      { nome: "MovimentaÃ§Ãµes", href: "/admin/cozinha/movimentacoes", status: "ativo" },
      { nome: "SincronizaÃ§Ã£o", href: "/admin/cozinha/sincronizacao", status: "ativo" }
    ]
  },
  {
    titulo: "ðŸ² MARMITA & BOLOS",
    icon: "ðŸ²",
    items: [
      { nome: "Marmitaria", href: "/admin/marmitaria", status: "construcao" },
      { nome: "Delicatessen", href: "/admin/delicatessen", status: "construcao" },
      { nome: "Confeitarias", href: "/admin/confeitarias", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸ’ª ACADEMIAS & ESPORTES",
    icon: "ðŸ’ª",
    items: [
      { nome: "Academias", href: "/admin/academias", status: "construcao" },
      { nome: "Personal Trainer", href: "/admin/personal-trainer", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸšš TRANSPORTE & DELIVERY",
    icon: "ðŸšš",
    items: [
      { nome: "Moto TÃ¡xi", href: "/admin/mototaxi", status: "ativo" },
      { nome: "Entregadores", href: "/admin/entregadores", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸ›’ UTILIDADES",
    icon: "ðŸ›’",
    items: [
      { nome: "Ãgua e GÃ¡s", href: "/admin/agua-gas", status: "construcao" },
      { nome: "Chaveiros", href: "/admin/chaveiros", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸ”§ SERVIÃ‡OS",
    icon: "ðŸ”§",
    items: [
      { nome: "Serralheiro", href: "/admin/serralheiro", status: "construcao" },
      { nome: "Montador", href: "/admin/montador", status: "construcao" },
      { nome: "TÃ©cnico InformÃ¡tica", href: "/admin/tecnico-informatica", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸª MERCADOS",
    icon: "ðŸª",
    items: [
      { nome: "Mercados", href: "/admin/mercados", status: "construcao" },
      { nome: "Hortifruti", href: "/admin/hortifruti", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸ  IMÃ“VEL / HOSPEDAGEM",
    icon: "ðŸ ",
    items: [
      { nome: "Venda de ImÃ³vel", href: "/admin/venda-imovel", status: "construcao" },
      { nome: "Aluguel de ImÃ³vel", href: "/admin/aluguel-imovel", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸŒ¾ AGRO & CAMPO",
    icon: "ðŸŒ¾",
    items: [
      { nome: "AgropecuÃ¡ria", href: "/admin/agropecuaria", status: "construcao" },
      { nome: "Produtos AgrÃ­colas", href: "/admin/produtos-agricolas", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸ—ï¸ CONSTRUÃ‡ÃƒO",
    icon: "ðŸ—ï¸",
    items: [
      { nome: "Eletricista", href: "/admin/eletricista", status: "construcao" },
      { nome: "Encanador", href: "/admin/encanador", status: "construcao" },
      { nome: "Pedreiro", href: "/admin/pedreiro", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸ“± TECNOLOGIA",
    icon: "ðŸ“±",
    items: [
      { nome: "AssistÃªncia Celular", href: "/admin/assistencia-celular", status: "construcao" },
      { nome: "InformÃ¡tica", href: "/admin/informatica", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸš— AUTOMOTIVO",
    icon: "ðŸš—",
    items: [
      { nome: "Oficina", href: "/admin/oficina", status: "construcao" },
      { nome: "Auto PeÃ§as", href: "/admin/auto-pecas", status: "construcao" },
      { nome: "Lava Jato", href: "/admin/lava-jato", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸŽ“ EDUCAÃ‡ÃƒO",
    icon: "ðŸŽ“",
    items: [
      { nome: "Escolas", href: "/admin/escolas", status: "construcao" },
      { nome: "Cursos", href: "/admin/cursos", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸ¥ SAÃšDE",
    icon: "ðŸ¥",
    items: [
      { nome: "FarmÃ¡cias", href: "/admin/farmacias", status: "construcao" },
      { nome: "ClÃ­nicas", href: "/admin/clinicas", status: "construcao" },
      { nome: "Dentistas", href: "/admin/dentistas", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸ’„ BELEZA & ESTÃ‰TICA",
    icon: "ðŸ’„",
    items: [
      { nome: "SalÃ£o de Beleza", href: "/admin/salao-beleza", status: "construcao" },
      { nome: "Barbearia", href: "/admin/barbearia", status: "construcao" },
      { nome: "Manicure", href: "/admin/manicure", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸŽ‰ EVENTOS & ENTRETENIMENTO",
    icon: "ðŸŽ‰",
    items: [
      { nome: "Eventos", href: "/admin/eventos", status: "construcao" },
      { nome: "Buffet", href: "/admin/buffet", status: "construcao" },
      { nome: "Fotografia", href: "/admin/fotografia", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸ¶ PET SHOP & ANIMAIS",
    icon: "ðŸ¶",
    items: [
      { nome: "Pet Shop", href: "/admin/petshop", status: "construcao" },
      { nome: "Banho e Tosa", href: "/admin/banho-tosa", status: "construcao" }
    ]
  },
  {
    titulo: "ðŸ¦ FINANCEIRO GERAL",
    icon: "ðŸ¦",
    items: [
      { nome: "Correspondente BancÃ¡rio", href: "/admin/correspondente", status: "construcao" },
      { nome: "EmprÃ©stimos", href: "/admin/emprestimos", status: "construcao" }
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

  // Carregar preferÃªncias salvas
  useEffect(() => {
    const saved = localStorage.getItem('expanded_menus_admin');
    if (saved) {
      setExpandedMenus(JSON.parse(saved));
    } else {
      setExpandedMenus({ "ðŸ³ COZINHA DONA NEIDE": true });
    }
  }, []);

  // Salvar preferÃªncias quando mudar
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
      "ðŸ“Š": <TrendingUp className="w-5 h-5 text-yellow-400" />,
      "âš™ï¸": <Settings className="w-5 h-5 text-yellow-400" />,
      "ðŸ‘¥": <Users className="w-5 h-5 text-yellow-400" />,
      "ðŸ’°": <Wallet className="w-5 h-5 text-yellow-400" />,
      "ðŸ³": <Utensils className="w-5 h-5 text-yellow-400" />,
      "ðŸ²": <Package className="w-5 h-5 text-yellow-400" />,
      "ðŸ’ª": <Activity className="w-5 h-5 text-yellow-400" />,
      "ðŸšš": <Truck className="w-5 h-5 text-yellow-400" />,
      "ðŸ›’": <ShoppingCart className="w-5 h-5 text-yellow-400" />,
      "ðŸ”§": <Wrench className="w-5 h-5 text-yellow-400" />,
      "ðŸª": <Store className="w-5 h-5 text-yellow-400" />,
      "ðŸ ": <Store className="w-5 h-5 text-yellow-400" />,
      "ðŸŒ¾": <Activity className="w-5 h-5 text-yellow-400" />,
      "ðŸ—ï¸": <Wrench className="w-5 h-5 text-yellow-400" />,
      "ðŸ“±": <Activity className="w-5 h-5 text-yellow-400" />,
      "ðŸš—": <Truck className="w-5 h-5 text-yellow-400" />,
      "ðŸŽ“": <Users className="w-5 h-5 text-yellow-400" />,
      "ðŸ¥": <Activity className="w-5 h-5 text-yellow-400" />,
      "ðŸ’„": <Activity className="w-5 h-5 text-yellow-400" />,
      "ðŸŽ‰": <Gift className="w-5 h-5 text-yellow-400" />,
      "ðŸ¶": <Activity className="w-5 h-5 text-yellow-400" />,
      "ðŸ¦": <Wallet className="w-5 h-5 text-yellow-400" />
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
                            alert(`ðŸš§ MÃ³dulo em construÃ§Ã£o: ${item.nome}`);
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
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">ðŸš§</span>
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

