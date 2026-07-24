$arquivo = "C:\valente_conecta\app\page.tsx"

$novoConteudo = @'
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import {
  Search,
  MapPin,
  ShoppingBag,
  Utensils,
  Pill,
  Shirt,
  Sprout,
  Wrench,
  Plus,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Home as HomeIcon,
  FileText,
  User,
  Gift,
  PlayCircle,
  Shield,
  Bell,
  X,
  ChevronRight,
  Dumbbell,
  Bike,
  Hammer,
  Laptop,
  Car,
  GraduationCap,
  HeartPulse,
  Sparkles,
  PartyPopper,
  PawPrint,
  DollarSign,
  Mic,
  Store,
} from "lucide-react";

interface LocalUser {
  id?: number;
  nome?: string;
  email?: string;
  wallet?: number;
}

interface CategoriaItem {
  nome: string;
  Icone: any;
  href: string;
}

export default function HomePage() {
  const router = useRouter();
  const appContext = useApp();
  const user = (appContext as any).user as LocalUser | null;
  const isAdmin = (appContext as any).isAdmin || false;

  const [searchTerm, setSearchTerm] = useState("");
  const [showAdminNotifications, setShowAdminNotifications] = useState(true);
  const [showTodasCategorias, setShowTodasCategorias] = useState(false);

  const notificacoesAdmin = [
    { id: 1, mensagem: "Novas funcionalidades disponiveis! Confira o cardapio da Cozinha.", importancia: "alta", data: "Hoje" },
    { id: 2, mensagem: "Campanha de indicacao: ganhe R$5 por amigo indicado!", importancia: "media", data: "Hoje" },
    { id: 3, mensagem: "Academia agora com geolocalizacao para registrar treinos!", importancia: "alta", data: "Ontem" },
    { id: 4, mensagem: "Moto Taxi com novos motoristas cadastrados!", importancia: "baixa", data: "Ontem" },
  ];

  const categoriasPrincipais: CategoriaItem[] = [
    { nome: "Mercados", Icone: ShoppingBag, href: "/comercio" },
    { nome: "Alimentação", Icone: Utensils, href: "/cozinha" },
    { nome: "Farmácias", Icone: Pill, href: "/servicos" },
    { nome: "Moda", Icone: Shirt, href: "/servicos" },
    { nome: "Agro e Campo", Icone: Sprout, href: "/servicos" },
    { nome: "Utilidades", Icone: Wrench, href: "/agua-gas" },
    { nome: "Serviços", Icone: Wrench, href: "/servicos" },
  ];

  const categoriasExtras: CategoriaItem[] = [
    { nome: "Academias & Esportes", Icone: Dumbbell, href: "/academia" },
    { nome: "Transporte & Delivery", Icone: Bike, href: "/mototaxi" },
    { nome: "Imóvel", Icone: HomeIcon, href: "/servicos" },
    { nome: "Construção", Icone: Hammer, href: "/servicos" },
    { nome: "Aluguel Máquinas", Icone: Wrench, href: "/publico/maquinas" },
    { nome: "Tecnologia", Icone: Laptop, href: "/servicos" },
    { nome: "Automotivo", Icone: Car, href: "/servicos" },
    { nome: "Educação", Icone: GraduationCap, href: "/servicos" },
    { nome: "Saúde", Icone: HeartPulse, href: "/servicos" },
    { nome: "Moda Masculina", Icone: Shirt, href: "/servicos" },
    { nome: "Moda Feminina", Icone: Shirt, href: "/servicos" },
    { nome: "Beleza & Estética", Icone: Sparkles, href: "/servicos" },
    { nome: "Eventos", Icone: PartyPopper, href: "/servicos" },
    { nome: "Pet Shop", Icone: PawPrint, href: "/servicos" },
    { nome: "Financeiro", Icone: DollarSign, href: "/servicos" },
  ];

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push("/busca?q=" + encodeURIComponent(searchTerm));
    }
  };

  const handleVoiceSearch = () => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          setSearchTerm(event.results[0][0].transcript);
          setTimeout(handleSearch, 500);
        }
      };
      recognition.start();
    } else {
      toast.error("Busca por voz não suportada");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">
      {/* HEADER */}
      <header className="bg-white px-4 pt-4 pb-3 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              VC
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-tight text-blue-900">VALENTE CONECTA</h1>
              <p className="text-[10px] text-slate-500 font-medium">A economia da cidade na palma da mão</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100"
          >
            <MapPin size={13} className="text-blue-600" />
            <span>Valente, BA</span>
          </button>
        </div>

        <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-xl">
          <Search className="absolute left-3.5 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar produtos ou serviços em Valente..."
            className="w-full bg-transparent py-3 pl-11 pr-16 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={handleVoiceSearch}
            className="absolute right-10 text-slate-400"
            aria-label="Busca por voz"
          >
            <Mic size={16} />
          </button>
          <button
            onClick={handleSearch}
            className="absolute right-2 bg-blue-600 text-white p-1.5 rounded-lg"
            aria-label="Buscar"
          >
            <Search size={14} />
          </button>
        </div>
      </header>

      <main className="px-4 pt-4 space-y-5">
        {/* CARTEIRA DIGITAL */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wallet size={14} className="text-amber-500" /> Carteira Digital
            </span>
            <button onClick={() => router.push("/extrato")} className="text-xs text-blue-600 font-medium">
              Ver extrato
            </button>
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-2xl font-black text-slate-900">
              R$ {(user?.wallet ?? 0).toFixed(2)}
            </h2>
            <span className="text-xs text-slate-500 font-normal">Moeda Corrente: VCC</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/carteira/recarga")}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <ArrowDownLeft size={16} /> Receber
            </button>
            <button
              onClick={() => router.push("/carteira")}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <ArrowUpRight size={16} /> Pagar
            </button>
          </div>
        </div>

        {/* BANNERS */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => router.push("/lancamento")}
            className="bg-gradient-to-br from-blue-900 to-blue-950 text-white p-4 rounded-2xl relative overflow-hidden shadow-sm flex flex-col justify-between h-32 cursor-pointer"
          >
            <div>
              <span className="bg-amber-500 text-blue-950 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">Novidade</span>
              <h3 className="font-bold text-sm mt-1 leading-snug flex items-center gap-1">
                <PlayCircle size={14} /> Lançamento
              </h3>
            </div>
            <p className="text-[10px] text-blue-200">Conecte-se ao comércio local agora!</p>
          </div>

          <div
            onClick={() => router.push("/qr-code")}
            className="bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 p-4 rounded-2xl relative overflow-hidden shadow-sm flex flex-col justify-between h-32 cursor-pointer"
          >
            <div>
              <span className="bg-white/80 text-amber-900 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">Indique</span>
              <h3 className="font-bold text-sm mt-1 leading-snug flex items-center gap-1">
                <Gift size={14} /> Indique e Ganhe
              </h3>
            </div>
            <p className="text-[10px] text-amber-950 font-medium">Ganhe bônus por indicação!</p>
          </div>
        </div>

        {/* CATEGORIAS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Categorias</h3>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            {categoriasPrincipais.map((cat, idx) => {
              const Icone = cat.Icone;
              return (
                <button
                  key={idx}
                  onClick={() => router.push(cat.href)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-slate-100">
                    <Icone size={22} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 leading-tight">{cat.nome}</span>
                </button>
              );
            })}
            <button
              onClick={() => setShowTodasCategorias(!showTodasCategorias)}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm border border-slate-100">
                <Plus size={22} className={showTodasCategorias ? "rotate-45 transition-transform" : "transition-transform"} />
              </div>
              <span className="text-[11px] font-medium text-slate-700 leading-tight">
                {showTodasCategorias ? "Ver menos" : "Ver Mais"}
              </span>
            </button>
          </div>

          {showTodasCategorias && (
            <div className="grid grid-cols-4 gap-3 text-center mt-4">
              {categoriasExtras.map((cat, idx) => {
                const Icone = cat.Icone;
                return (