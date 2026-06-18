"use client";

import {
  Briefcase,
  Car,
  ChefHat,
  ClipboardList,
  CreditCard,
  Dumbbell,
  HelpCircle,
  Home,
  LayoutDashboard,
  MessageSquare,
  Package,
  QrCode,
  Settings,
  ShoppingBag,
  Store,
  Users,
  Video
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  titulo: string;
  icone: string;
  href: string;
  descricao: string;
  categoria?: "principal" | "comercio" | "servicos" | "ferramentas" | "pessoal";
}

const menuItems: MenuItem[] = [
  { titulo: "Dashboard", icone: "LayoutDashboard", href: "/admin-master/dashboard", descricao: "Visão geral do sistema", categoria: "principal" },
  { titulo: "Central de Controle", icone: "Settings", href: "/admin-master/central", descricao: "Configurações gerais", categoria: "principal" },
  { titulo: "Usuários", icone: "Users", href: "/admin-master/usuarios", descricao: "Gerenciar usuários", categoria: "comercio" },
  { titulo: "Comércio Local", icone: "Store", href: "/admin-master/comercio", descricao: "Lojas e produtos", categoria: "comercio" },
  { titulo: "PDV Colaborativo", icone: "ShoppingBag", href: "/admin-master/pdv", descricao: "Ponto de venda", categoria: "comercio" },
  { titulo: "Profissionais", icone: "Briefcase", href: "/admin-master/profissionais", descricao: "Profissionais liberais", categoria: "servicos" },
  { titulo: "Academia", icone: "Dumbbell", href: "/admin-master/academia", descricao: "Atletas e treinos", categoria: "servicos" },
  { titulo: "Transporte", icone: "Car", href: "/admin-master/transporte", descricao: "Motoristas e entregas", categoria: "servicos" },
  { titulo: "Imóveis", icone: "Home", href: "/admin-master/imoveis", descricao: "Anúncios imobiliários", categoria: "servicos" },
  { titulo: "Empregos", icone: "Briefcase", href: "/admin-master/empregos", descricao: "Vagas e currículos", categoria: "servicos" },
  { titulo: "Fábrica de Vídeos", icone: "Video", href: "/admin-master/ferramentas/fabrica-videos", descricao: "Criar vídeos com IA", categoria: "ferramentas" },
  { titulo: "Cozinha Chef Neide", icone: "ChefHat", href: "/admin-master/cozinha-admin", descricao: "Gerenciar cardápio", categoria: "ferramentas" },
  { titulo: "QR Code", icone: "QrCode", href: "/admin-master/ferramentas/qrcode", descricao: "Gerar QR codes", categoria: "ferramentas" },
  { titulo: "Conta Pessoal", icone: "User", href: "/admin-master/conta", descricao: "Minha conta", categoria: "pessoal" },
  { titulo: "Financeiro", icone: "CreditCard", href: "/admin-master/financeiro", descricao: "Carteira e transações", categoria: "pessoal" },
  { titulo: "Produtos", icone: "Package", href: "/admin-master/produtos", descricao: "Gerenciar catálogo", categoria: "pessoal" },
  { titulo: "Cardapio Semanal", icone: "ClipboardList", href: "/admin-master/cardapio", descricao: "Configurar pratos por dia", categoria: "pessoal" },
  { titulo: "Mensagens", icone: "MessageSquare", href: "/admin-master/comunicacao", descricao: "Comunicações", categoria: "comercio" },
  { titulo: "Ajuda", icone: "HelpCircle", href: "/admin-master/ajuda", descricao: "Suporte", categoria: "principal" }
];

const iconMap: Record<string, any> = {
  LayoutDashboard, Users, Store, ShoppingBag, Briefcase, Dumbbell, Car, Home,
  Video, QrCode, MessageSquare, Settings, ChefHat, CreditCard, HelpCircle, Package, ClipboardList
};

export default function MenuAdmin() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {["principal", "comercio", "servicos", "ferramentas", "pessoal"].map((categoria) => {
        const itens = menuItems.filter(item => item.categoria === categoria);
        if (itens.length === 0) return null;

        const tituloCategoria = {
          principal: "PRINCIPAL",
          comercio: "COMERCIO",
          servicos: "SERVICOS",
          ferramentas: "FERRAMENTAS",
          pessoal: "PESSOAL"
        }[categoria];

        return (
          <div key={categoria}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
              {tituloCategoria}
            </h3>
            <div className="space-y-1">
              {itens.map((item) => {
                const Icon = iconMap[item.icone];
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {Icon && <Icon size={18} />}
                    <span className="text-sm font-medium">{item.titulo}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}