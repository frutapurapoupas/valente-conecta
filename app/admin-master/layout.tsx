"use client";

import {
  AlertCircle,
  Award,
  BarChart3,
  Bell,
  Building,
  Cake,
  Calculator,
  CheckCircle,
  CreditCard,
  Crown,
  Factory,
  FileText,
  Gift,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  List,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  QrCode,
  Settings,
  ShoppingBag,
  Store,
  TrendingUp,
  Truck,
  Users,
  Video,
  Wallet,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminMasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedCity, setSelectedCity] = useState("todas");
  const [cities] = useState(["Valente", "Rafael Jambeiro", "Santa Bárbara", "Santaluz", "Conceição do Coité"]);

  useEffect(() => {
    const user = localStorage.getItem('usuario_logado');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.role === 'master' || parsed.isMaster === true) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLogin = () => {
    if (password === 'admin123') {
      localStorage.setItem('usuario_logado', JSON.stringify({
        id: 'master',
        name: 'Admin Master',
        role: 'master',
        isMaster: true
      }));
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Senha incorreta');
    }
  };

  const menuGroups = [
    {
      title: "📊 Dashboard",
      items: [
        { name: "Principal", href: "/admin-master/dashboard", icon: LayoutDashboard },
        { name: "Métricas", href: "/admin-master/dashboard/metricas", icon: BarChart3 },
      ]
    },
    {
      title: "👥 Usuários",
      items: [
        { name: "Todos os Usuários", href: "/admin-master/usuarios", icon: Users },
        { name: "Por Plano", href: "/admin-master/usuarios/planos", icon: CreditCard },
        { name: "Por Cidade", href: "/admin-master/usuarios/cidades", icon: MapPin },
        { name: "Pendentes", href: "/admin-master/pendentes", icon: Bell },
      ]
    },
    {
      title: "🏪 Comércio",
      items: [
        { name: "Contatos/Lojas", href: "/admin-master/contatos", icon: Store },
        { name: "Planos", href: "/admin-master/planos", icon: CreditCard },
        { name: "PDV Unificado", href: "/admin-master/pdv-unificado", icon: ShoppingBag },
        { name: "Sugestões", href: "/admin-master/sugestoes/comercios", icon: Gift },
      ]
    },
    {
      title: "👤 PESSOAL",
      items: [
        { name: "Conta Pessoal", href: "/admin-master/financeiro-pessoal", icon: Wallet },
        { name: "Dashboard Cozinha", href: "/admin-master/cozinha/dashboard", icon: LayoutGrid },
        { name: "Cardápio", href: "/admin-master/cozinha/cardapio", icon: Package },
        { name: "Cardápio Doces", href: "/admin-master/cozinha/cardapio-doces", icon: Cake },
        { name: "Receitas", href: "/admin-master/cozinha/receitas", icon: List },
        { name: "Lista de Compras", href: "/admin-master/cozinha/lista-compras", icon: Calculator },
        { name: "Produção", href: "/admin-master/cozinha/producao", icon: Factory },
      ]
    },
    {
      title: "🏙️ Cidades",
      items: [
        { name: "Multi Cidade", href: "/admin-master/multi-cidade/relatorios", icon: Globe },
      ]
    },
    {
      title: "📈 Módulos",
      items: [
        { name: "Academia", href: "/admin-master/academia-master", icon: TrendingUp },
        { name: "Transportes", href: "/admin-master/gerenciar-transportes", icon: Truck },
        { name: "Imóveis", href: "/admin-master/configuracoes-imoveis", icon: Building },
        { name: "Bônus", href: "/admin-master/bonus", icon: Award },
      ]
    },
    {
      title: "🎬 Conteúdo",
      items: [
        { name: "Fábrica de Vídeos", href: "/admin-master/videos", icon: Video },
        { name: "Gerenciar Roteiros", href: "/admin-master/videos/roteiros", icon: FileText },
        { name: "QR Code", href: "/admin-master/qrcode", icon: QrCode },
      ]
    },
    {
      title: "📨 Mensagens",
      items: [
        { name: "Mensagens Padrão", href: "/admin-master/mensagens", icon: MessageCircle },
      ]
    },
    {
      title: "⚙️ Configurações",
      items: [
        { name: "Bônus", href: "/admin-master/configuracoes/bonus", icon: Award },
        { name: "Geral", href: "/admin-master/configuracoes", icon: Settings },
      ]
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
          <div className="text-center mb-6">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Crown size={32} className="text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-indigo-700">Admin Master</h1>
            <p className="text-gray-500 text-sm">Controle total do Valente Conecta</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Digite a senha"
            className="w-full p-3 border rounded-lg mb-4"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button onClick={handleLogin} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Entrar</button>
          <p className="text-center text-xs text-gray-400 mt-4">Senha: admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"
          } bg-gradient-to-b from-indigo-800 to-indigo-900 text-white transition-all duration-300 flex flex-col shadow-xl`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-700">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <Crown size={24} className="text-yellow-400" />
              <span className="font-bold text-sm">Admin Master</span>
            </div>
          ) : (
            <Crown size={24} className="text-yellow-400 mx-auto" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-indigo-700 transition"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Selector de Cidade */}
        {sidebarOpen && (
          <div className="p-3 border-b border-indigo-700">
            <label className="text-[10px] text-indigo-300 block mb-1">Cidade</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-2 rounded-lg bg-indigo-700 text-white text-sm border-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="todas">🌍 Todas as cidades</option>
              {cities.map(city => (
                <option key={city} value={city}>📍 {city}</option>
              ))}
            </select>
          </div>
        )}

        {/* Menu Groups */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-4">
              {sidebarOpen && (
                <div className="px-4 py-1 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all ${isActive
                        ? "bg-indigo-700 text-white shadow-md"
                        : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
                      }`}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span className="text-sm">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-indigo-700">
          <button
            onClick={() => {
              localStorage.removeItem('usuario_logado');
              setIsAuthenticated(false);
              router.push('/');
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-indigo-200 hover:bg-indigo-700 hover:text-white transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Sair</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              Valente Conecta - Admin Master
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500" /><span className="text-gray-600">Online</span></div>
              <div className="flex items-center gap-1"><AlertCircle size={12} className="text-yellow-500" /><span className="text-gray-600">3 pendentes</span></div>
              <div className="flex items-center gap-1"><TrendingUp size={12} className="text-blue-500" /><span className="text-gray-600">+12%</span></div>
            </div>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">AM</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin Master</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}