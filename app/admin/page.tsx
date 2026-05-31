"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { Menu, X, ChevronRight, ChevronDown, Crown, Users, Settings, Utensils, Dumbbell, Truck, Wrench, Store, Activity, Shield, LogOut, Gift } from "lucide-react";

// Estrutura completa do menu lateral
const menuEstrutura = [
  {
    titulo: "📊 DASHBOARD",
    icon: "fas fa-chart-line",
    items: [
      { nome: "Dashboard Principal", href: "/admin", status: "ativo" },
      { nome: "Dashboard Gráficos", href: "/admin/graficos", status: "construcao" },
      { nome: "Métricas da IA", href: "/admin/metricas-ia", status: "construcao" },
      { nome: "Relatórios", href: "/admin/relatorios", status: "construcao" }
    ]
  },
  {
    titulo: "⚙️ CONFIGURAÇÕES",
    icon: "fas fa-cog",
    items: [
      { nome: "Configuração da Home", href: "/admin/configuracoes", status: "ativo" },
      { nome: "📢 Notificações do Sistema", href: "/admin/notificacoes", status: "ativo" },
      { nome: "Configurações Gerais", href: "/admin/configuracoes-gerais", status: "construcao" },
      { nome: "Aparência", href: "/admin/aparencia", status: "construcao" },
      { nome: "Segurança", href: "/admin/seguranca", status: "construcao" }
    ]
  },
  {
    titulo: "👥 USUÁRIOS & PLANOS",
    icon: "fas fa-users",
    items: [
      { nome: "Gerenciar Usuários", href: "/admin/usuarios", status: "ativo" },
      { nome: "Gerenciar Planos", href: "/admin/planos", status: "ativo" },
      { nome: "Gerenciar Benefícios", href: "/admin/beneficios", status: "ativo" },
      { nome: "IA & Automação", href: "/admin/ia", status: "construcao" },
      { nome: "Financeiro", href: "/admin/financeiro", status: "construcao" },
      { nome: "Marketing", href: "/admin/marketing", status: "construcao" }
    ]
  },
  {
    titulo: "🍳 COZINHA DONA NEIDE",
    icon: "fas fa-utensils",
    items: [
      { nome: "Dashboard Cozinha", href: "/admin/cozinha/dashboard", status: "construcao" },
      { nome: "Financeiro Pessoal", href: "/admin/cozinha/financeiro", status: "construcao" },
      { nome: "Cozinha Chef Neide", href: "/admin/cozinha", status: "ativo" },
      { nome: "Estoque", href: "/admin/cozinha/estoque", status: "construcao" },
      { nome: "Pratos & Produtos", href: "/admin/cozinha", status: "ativo" },
      { nome: "Lista de Compras", href: "/admin/cozinha/lista-compras", status: "construcao" },
      { nome: "Produção", href: "/admin/cozinha/producao", status: "construcao" },
      { nome: "Preview Cardápio", href: "/cozinha", status: "ativo" }
    ]
  },
  {
    titulo: "💪 ACADEMIAS & ESPORTES",
    icon: "fas fa-dumbbell",
    items: [
      { nome: "Academias Empresa", href: "/admin/academias-empresa", status: "construcao" },
      { nome: "Academia Aluno", href: "/admin/academia", status: "ativo" },
      { nome: "Personal Trainer", href: "/admin/personal-trainer", status: "construcao" },
      { nome: "Dança", href: "/admin/danca", status: "construcao" },
      { nome: "Crossfit", href: "/admin/crossfit", status: "construcao" },
      { nome: "Funcional", href: "/admin/funcional", status: "construcao" }
    ]
  },
  {
    titulo: "🍲 MARMITA & BOLOS",
    icon: "fas fa-birthday-cake",
    items: [
      { nome: "Marmitaria", href: "/admin/marmitaria", status: "construcao" },
      { nome: "Delicatessen", href: "/admin/delicatessen", status: "construcao" },
      { nome: "Confeitarias", href: "/admin/confeitarias", status: "construcao" },
      { nome: "Salgados", href: "/admin/salgados", status: "construcao" },
      { nome: "Doces", href: "/admin/doces", status: "construcao" },
      { nome: "Bolos", href: "/admin/bolos", status: "construcao" }
    ]
  },
  {
    titulo: "🍔 ALIMENTAÇÃO",
    icon: "fas fa-hamburger",
    items: [
      { nome: "Restaurantes", href: "/admin/restaurantes", status: "construcao" },
      { nome: "Lanchonetes", href: "/admin/lanchonetes", status: "construcao" },
      { nome: "Pizzarias", href: "/admin/pizzarias", status: "construcao" },
      { nome: "Hamburguerias", href: "/admin/hamburguerias", status: "construcao" },
      { nome: "Açaí", href: "/admin/acai", status: "construcao" },
      { nome: "Padarias", href: "/admin/padarias", status: "construcao" },
      { nome: "Delivery", href: "/admin/delivery", status: "construcao" },
      { nome: "Espetinhos", href: "/admin/espetinhos", status: "construcao" },
      { nome: "Churrascarias", href: "/admin/churrascarias", status: "construcao" },
      { nome: "Cafeterias", href: "/admin/cafeterias", status: "construcao" },
      { nome: "Comida Regional", href: "/admin/comida-regional", status: "construcao" },
      { nome: "Comida Fitness", href: "/admin/comida-fitness", status: "construcao" }
    ]
  },
  {
    titulo: "🚚 TRANSPORTE & DELIVERY",
    icon: "fas fa-truck",
    items: [
      { nome: "Moto Táxi", href: "/admin/mototaxi", status: "ativo" },
      { nome: "Entregadores", href: "/admin/entregadores", status: "construcao" },
      { nome: "Frete", href: "/admin/frete", status: "construcao" },
      { nome: "Mudanças", href: "/admin/mudancas", status: "construcao" },
      { nome: "Guincho", href: "/admin/guincho", status: "construcao" },
      { nome: "Transporte Escolar", href: "/admin/transporte-escolar", status: "construcao" }
    ]
  },
  {
    titulo: "🛒 UTILIDADES",
    icon: "fas fa-tools",
    items: [
      { nome: "Água e Gás", href: "/admin/agua-gas", status: "construcao" },
      { nome: "Chaveiros", href: "/admin/chaveiros", status: "construcao" },
      { nome: "Internet", href: "/admin/internet", status: "construcao" }
    ]
  },
  {
    titulo: "🔧 SERVIÇOS",
    icon: "fas fa-wrench",
    items: [
      { nome: "Serralheiro", href: "/admin/serralheiro", status: "construcao" },
      { nome: "Montador", href: "/admin/montador", status: "construcao" },
      { nome: "Técnico Informática", href: "/admin/tecnico-informatica", status: "construcao" },
      { nome: "Técnico Celular", href: "/admin/tecnico-celular", status: "construcao" },
      { nome: "Refrigeração", href: "/admin/refrigeracao", status: "construcao" },
      { nome: "Instalações", href: "/admin/instalacoes", status: "construcao" },
      { nome: "Advogado", href: "/admin/advogado", status: "construcao" },
      { nome: "Terapeuta", href: "/admin/terapeuta", status: "construcao" }
    ]
  },
  {
    titulo: "🏪 MERCADOS",
    icon: "fas fa-store",
    items: [
      { nome: "Mercados", href: "/admin/mercados", status: "construcao" },
      { nome: "Mercadinhos", href: "/admin/mercadinhos", status: "construcao" },
      { nome: "Atacadistas", href: "/admin/atacadistas", status: "construcao" },
      { nome: "Hortifruti", href: "/admin/hortifruti", status: "construcao" },
      { nome: "Açougues", href: "/admin/acougues", status: "construcao" },
      { nome: "Distribuidoras", href: "/admin/distribuidoras", status: "construcao" },
      { nome: "Conveniência", href: "/admin/conveniencia", status: "construcao" }
    ]
  },
  {
    titulo: "🏠 IMÓVEL / HOSPEDAGEM",
    icon: "fas fa-home",
    items: [
      { nome: "Venda de Imóvel", href: "/admin/venda-imovel", status: "construcao" },
      { nome: "Aluguel de Imóvel", href: "/admin/aluguel-imovel", status: "construcao" },
      { nome: "Hotel", href: "/admin/hotel", status: "construcao" },
      { nome: "Pousada", href: "/admin/pousada", status: "construcao" },
      { nome: "Dormitório", href: "/admin/dormitorio", status: "construcao" }
    ]
  },
  {
    titulo: "🌾 AGRO & CAMPO",
    icon: "fas fa-tractor",
    items: [
      { nome: "Agropecuária", href: "/admin/agropecuaria", status: "construcao" },
      { nome: "Ração Animal", href: "/admin/racao-animal", status: "construcao" },
      { nome: "Produtos Agrícolas", href: "/admin/produtos-agricolas", status: "construcao" },
      { nome: "Ferramentas Rurais", href: "/admin/ferramentas-rurais", status: "construcao" },
      { nome: "Irrigação", href: "/admin/irrigacao", status: "construcao" },
      { nome: "Veterinário", href: "/admin/veterinario", status: "construcao" },
      { nome: "Insumos Agro", href: "/admin/insumos-agro", status: "construcao" },
      { nome: "Produtos para Sisal", href: "/admin/produtos-sisal", status: "construcao" }
    ]
  },
  {
    titulo: "🏗️ CONSTRUÇÃO",
    icon: "fas fa-hard-hat",
    items: [
      { nome: "Eletricista", href: "/admin/eletricista", status: "construcao" },
      { nome: "Encanador", href: "/admin/encanador", status: "construcao" },
      { nome: "Pedreiro", href: "/admin/pedreiro", status: "construcao" },
      { nome: "Pintor", href: "/admin/pintor", status: "construcao" },
      { nome: "Marceneiro", href: "/admin/marceneiro", status: "construcao" }
    ]
  },
  {
    titulo: "🔨 ALUGUEL DE MÁQUINAS",
    icon: "fas fa-cogs",
    items: [
      { nome: "Aluguel de Trator", href: "/admin/aluguel-trator", status: "construcao" },
      { nome: "Aluguel de Betoneira", href: "/admin/aluguel-betoneira", status: "construcao" },
      { nome: "Aluguel de Rompedor", href: "/admin/aluguel-rompedor", status: "construcao" },
      { nome: "Aluguel de Andaime", href: "/admin/aluguel-andaime", status: "construcao" }
    ]
  },
  {
    titulo: "📱 TECNOLOGIA",
    icon: "fas fa-mobile-alt",
    items: [
      { nome: "Assistência Celular", href: "/admin/assistencia-celular", status: "construcao" },
      { nome: "Loja de Celular", href: "/admin/loja-celular", status: "construcao" },
      { nome: "Informática", href: "/admin/informatica", status: "construcao" },
      { nome: "Internet", href: "/admin/internet-tech", status: "construcao" },
      { nome: "Câmeras", href: "/admin/cameras", status: "construcao" },
      { nome: "Segurança Eletrônica", href: "/admin/seguranca-eletronica", status: "construcao" }
    ]
  },
  {
    titulo: "🚗 AUTOMOTIVO",
    icon: "fas fa-car",
    items: [
      { nome: "Oficina", href: "/admin/oficina", status: "construcao" },
      { nome: "Auto Peças", href: "/admin/auto-pecas", status: "construcao" },
      { nome: "Lava Jato", href: "/admin/lava-jato", status: "construcao" },
      { nome: "Borracharia", href: "/admin/borracharia", status: "construcao" },
      { nome: "Auto Elétrica", href: "/admin/auto-eletrica", status: "construcao" },
      { nome: "Som Automotivo", href: "/admin/som-automotivo", status: "construcao" },
      { nome: "Motos", href: "/admin/motos", status: "construcao" }
    ]
  },
  {
    titulo: "🎓 EDUCAÇÃO",
    icon: "fas fa-graduation-cap",
    items: [
      { nome: "Escolas", href: "/admin/escolas", status: "construcao" },
      { nome: "Cursos", href: "/admin/cursos", status: "construcao" },
      { nome: "Reforço Escolar", href: "/admin/reforco-escolar", status: "construcao" },
      { nome: "Idiomas", href: "/admin/idiomas", status: "construcao" },
      { nome: "Informática", href: "/admin/informatica-edu", status: "construcao" },
      { nome: "Música", href: "/admin/musica", status: "construcao" }
    ]
  },
  {
    titulo: "🏥 SAÚDE",
    icon: "fas fa-heartbeat",
    items: [
      { nome: "Farmácias", href: "/admin/farmacias", status: "construcao" },
      { nome: "Clínicas", href: "/admin/clinicas", status: "construcao" },
      { nome: "Dentistas", href: "/admin/dentistas", status: "construcao" },
      { nome: "Psicólogos", href: "/admin/psicologos", status: "construcao" },
      { nome: "Nutricionistas", href: "/admin/nutricionistas", status: "construcao" },
      { nome: "Laboratórios", href: "/admin/laboratorios", status: "construcao" },
      { nome: "Fisioterapia", href: "/admin/fisioterapia", status: "construcao" },
      { nome: "Óticas", href: "/admin/oticas", status: "construcao" }
    ]
  },
  {
    titulo: "👔 MODA MASCULINA",
    icon: "fas fa-male",
    items: [
      { nome: "Moda Infantil", href: "/admin/moda-infantil-mas", status: "construcao" },
      { nome: "Calçados", href: "/admin/calcados-mas", status: "construcao" },
      { nome: "Bolsas", href: "/admin/bolsas-mas", status: "construcao" },
      { nome: "Moda Íntima", href: "/admin/moda-intima-mas", status: "construcao" },
      { nome: "Moda Evangélica", href: "/admin/moda-evangelica", status: "construcao" }
    ]
  },
  {
    titulo: "👗 MODA FEMININA",
    icon: "fas fa-female",
    items: [
      { nome: "Moda Infantil", href: "/admin/moda-infantil-fem", status: "construcao" },
      { nome: "Calçados", href: "/admin/calcados-fem", status: "construcao" },
      { nome: "Bolsas", href: "/admin/bolsas-fem", status: "construcao" },
      { nome: "Moda Íntima", href: "/admin/moda-intima-fem", status: "construcao" },
      { nome: "Moda Fitness", href: "/admin/moda-fitness", status: "construcao" },
      { nome: "Acessórios", href: "/admin/acessorios", status: "construcao" }
    ]
  },
  {
    titulo: "💄 BELEZA & ESTÉTICA",
    icon: "fas fa-spa",
    items: [
      { nome: "Salão de Beleza", href: "/admin/salao-beleza", status: "construcao" },
      { nome: "Barbearia", href: "/admin/barbearia", status: "construcao" },
      { nome: "Manicure", href: "/admin/manicure", status: "construcao" },
      { nome: "Maquiagem", href: "/admin/maquiagem", status: "construcao" },
      { nome: "Estética Facial", href: "/admin/estetica-facial", status: "construcao" },
      { nome: "Estética Corporal", href: "/admin/estetica-corporal", status: "construcao" },
      { nome: "Produtos Cosméticos", href: "/admin/produtos-cosmeticos", status: "construcao" },
      { nome: "Perfumaria", href: "/admin/perfumaria", status: "construcao" }
    ]
  },
  {
    titulo: "🎉 EVENTOS & ENTRETENIMENTO",
    icon: "fas fa-music",
    items: [
      { nome: "Som Automotivo", href: "/admin/som-eventos", status: "construcao" },
      { nome: "Eventos", href: "/admin/eventos", status: "construcao" },
      { nome: "Decoração", href: "/admin/decoracao", status: "construcao" },
      { nome: "Buffet", href: "/admin/buffet", status: "construcao" },
      { nome: "Fotografia", href: "/admin/fotografia", status: "construcao" },
      { nome: "Filmagem", href: "/admin/filmagem", status: "construcao" },
      { nome: "Convites", href: "/admin/convites", status: "construcao" },
      { nome: "Espaços de Festa", href: "/admin/espacos-festa", status: "construcao" }
    ]
  },
  {
    titulo: "🐶 PET SHOP & ANIMAIS",
    icon: "fas fa-paw",
    items: [
      { nome: "Pet Shop", href: "/admin/petshop", status: "construcao" },
      { nome: "Banho e Tosa", href: "/admin/banho-tosa", status: "construcao" },
      { nome: "Veterinário", href: "/admin/veterinario-pet", status: "construcao" },
      { nome: "Ração", href: "/admin/racao", status: "construcao" },
      { nome: "Medicamentos Animais", href: "/admin/medicamentos-animais", status: "construcao" }
    ]
  },
  {
    titulo: "💰 FINANCEIRO",
    icon: "fas fa-chart-line",
    items: [
      { nome: "Correspondente Bancário", href: "/admin/correspondente", status: "construcao" },
      { nome: "Empréstimos", href: "/admin/emprestimos", status: "construcao" },
      { nome: "Seguros", href: "/admin/seguros", status: "construcao" },
      { nome: "Contabilidade", href: "/admin/contabilidade", status: "construcao" },
      { nome: "Consultoria Financeira", href: "/admin/consultoria-financeira", status: "construcao" }
    ]
  }
];

export default function AdminMasterPage() {
  const router = useRouter();
  const { isAdmin, user } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const toggleMenu = (titulo: string) => {
    setExpandedMenus(prev => ({ ...prev, [titulo]: !prev[titulo] }));
  };

  const stats = {
    totalUsuarios: 1523,
    usuariosAtivos: 1289,
    usuariosSuspensos: 234,
    novosHoje: 12,
    receitaMes: 8450
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
            <i className="fas fa-user text-white"></i>
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
                    <i className={`${menu.icon} text-yellow-400 w-5`}></i>
                    <span className="text-white font-medium text-sm">{menu.titulo}</span>
                  </div>
                  <i className={`fas fa-chevron-${expandedMenus[menu.titulo] ? "up" : "down"} text-gray-400 text-xs`}></i>
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
                            router.push(`/em-construcao?servico=${encodeURIComponent(item.nome)}&categoria=${encodeURIComponent(menu.titulo)}`);
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-between"
                      >
                        <span className={`text-sm ${item.status === "ativo" ? "text-gray-300" : "text-gray-500"}`}>
                          {item.nome}
                        </span>
                        {item.status === "construcao" && (
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">🚧</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-3">
              <p className="text-white/80 text-xs">Total Usuários</p>
              <p className="text-xl md:text-2xl font-bold text-white">{stats.totalUsuarios}</p>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-3">
              <p className="text-white/80 text-xs">Ativos</p>
              <p className="text-xl md:text-2xl font-bold text-white">{stats.usuariosAtivos}</p>
            </div>
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-3">
              <p className="text-white/80 text-xs">Suspensos</p>
              <p className="text-xl md:text-2xl font-bold text-white">{stats.usuariosSuspensos}</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 rounded-2xl p-3">
              <p className="text-white/80 text-xs">Novos Hoje</p>
              <p className="text-xl md:text-2xl font-bold text-white">{stats.novosHoje}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-3">
              <p className="text-white/80 text-xs">Receita Mês</p>
              <p className="text-xl md:text-2xl font-bold text-white">R$ {stats.receitaMes}</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 text-center">
            <i className="fas fa-crown text-6xl text-yellow-500 mb-4"></i>
            <h2 className="text-white text-xl font-bold mb-2">Bem-vindo ao Admin Master</h2>
            <p className="text-gray-400 text-sm">Selecione uma opção no menu lateral para gerenciar o sistema</p>
            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button onClick={() => router.push("/admin/configuracoes")} className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold text-sm">
                ⚙️ Configurar Home
              </button>
              <button onClick={() => router.push("/admin/usuarios")} className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm">
                👥 Gerenciar Usuários
              </button>
              <button onClick={() => router.push("/admin/beneficios")} className="bg-purple-500 text-white px-4 py-2 rounded-xl font-bold text-sm">
                🎁 Gerenciar Benefícios
              </button>
            </div>
          </div>

          <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center md:hidden">
            <p className="text-yellow-400 text-xs">
              📱 Toque no ícone ☰ no topo para abrir o menu lateral
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}