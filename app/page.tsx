"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";
import { getCurrentUser } from "@/lib/auth";
import { ContadorUsuarios } from "@/components/home/ContadorUsuarios";
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
  Droplets,
  Plus,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Home as HomeIcon,
  CreditCard,
  User,
  Gift,
  PlayCircle,
  Shield,
  Bell,
  X,
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
  Briefcase,
  Users,
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
  const [saldoMoedaConecta, setSaldoMoedaConecta] = useState(0);
  const [siglaMoedaConecta, setSiglaMoedaConecta] = useState("MC");
  // Nome de quem esta logado, pra mostrar em cima do badge de cidade no
  // cabecalho — appContext.user nunca e' preenchido hoje (sem login real
  // ligado a ele, mesmo caso ja documentado em app/qr-code/page.tsx), entao
  // usa getCurrentUser() (localStorage, sessao real gravada no cadastro).
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);

  useEffect(() => {
    const usuarioReal = getCurrentUser();
    if (!usuarioReal) return;
    setNomeUsuario(usuarioReal.nome || null);
    fetch(`/api/moeda-conecta/saldo?usuarioId=${usuarioReal.id}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) return;
        setSaldoMoedaConecta(Number(res.data.saldo || 0));
        const cidade = res.data.cidade_base || (usuarioReal as any).cidade_base;
        if (cidade) {
          fetch(`/api/moeda-conecta/cidade-config?cidade=${encodeURIComponent(cidade)}`)
            .then((r2) => r2.json())
            .then((res2) => res2.success && setSiglaMoedaConecta(res2.data.moeda_prefixo));
        }
      })
      .catch(() => {});
  }, []);

  const carrosselRef = useRef<HTMLDivElement>(null);
  const [intervaloCarrossel, setIntervaloCarrossel] = useState(5);

  useEffect(() => {
    fetch("/api/config-carrossel")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.intervaloSegundos) setIntervaloCarrossel(res.data.intervaloSegundos);
      })
      .catch(() => {});
  }, []);

  // Avanca o carrossel de destaques sozinho, no intervalo configurado pelo
  // admin master (padrao 5s) — cicla pro primeiro slide depois do ultimo.
  useEffect(() => {
    const intervalId = setInterval(() => {
      const container = carrosselRef.current;
      if (!container) return;
      const slides = Array.from(container.children) as HTMLElement[];
      if (slides.length < 2) return;
      const indiceAtual = slides.findIndex(
        (slide) => Math.abs(slide.offsetLeft - container.scrollLeft) < slide.offsetWidth / 2
      );
      const proximoIndice = (Math.max(indiceAtual, 0) + 1) % slides.length;
      container.scrollTo({ left: slides[proximoIndice].offsetLeft, behavior: "smooth" });
    }, intervaloCarrossel * 1000);
    return () => clearInterval(intervalId);
  }, [intervaloCarrossel]);

  const [notificacoesAdmin, setNotificacoesAdmin] = useState<
    { id: string; mensagem: string; titulo: string; data: string }[]
  >([]);

  useEffect(() => {
    const carregarComunicados = async () => {
      try {
        const comunicadosRes = await fetch("/api/comunicados", { cache: "no-store" }).then((r) => r.json());
        if (!comunicadosRes.success) return;

        // Segmentacao: so' filtra se o visitante tiver uma inscricao de push
        // com cidade/grupos preenchidos (ver PushSubscriptionManager). Sem
        // inscricao, ve so' os comunicados nao-segmentados (grupos e
        // cidades nulos = "todos").
        let minhaCidade: string | null = null;
        let meusGrupos: string[] = [];
        try {
          const usuarioLocalId = obterUsuarioLocalId();
          const prefRes = await fetch(`/api/push/preferencias?usuarioId=${usuarioLocalId}`).then((r) => r.json());
          if (prefRes.success) {
            minhaCidade = prefRes.data.cidade || null;
            meusGrupos = prefRes.data.grupos_interesse || [];
          }
        } catch {
          // segue sem segmentacao
        }

        const filtrados = (comunicadosRes.data as any[]).filter((c) => {
          const bateGrupo = !c.grupos?.length || c.grupos.some((g: string) => meusGrupos.includes(g));
          const bateCidade = !c.cidades?.length || (minhaCidade && c.cidades.includes(minhaCidade));
          return bateGrupo && bateCidade;
        });

        setNotificacoesAdmin(
          filtrados.map((c) => ({
            id: c.id,
            titulo: c.titulo,
            mensagem: c.mensagem,
            data: new Date(c.publicado_em || c.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          }))
        );
      } catch {
        // comunicado e' um extra, nunca deve quebrar a home
      }
    };
    carregarComunicados();
  }, []);

  const categoriasPrincipais: CategoriaItem[] = [
    { nome: "Mercados", Icone: ShoppingBag, href: "/mercados" },
    { nome: "Alimentação", Icone: Utensils, href: "/alimentacao" },
    { nome: "Farmácias", Icone: Pill, href: "/saude?tipo=farmacia" },
    { nome: "Moto Táxi", Icone: Bike, href: "/mototaxi" },
    { nome: "Academias & Esportes", Icone: Dumbbell, href: "/academia" },
    { nome: "Água e Gás", Icone: Droplets, href: "/agua-gas" },
    { nome: "Serviços", Icone: Wrench, href: "/servicos" },
  ];

  const categoriasExtras: CategoriaItem[] = [
    { nome: "Moda", Icone: Shirt, href: "/moda" },
    { nome: "Agro e Campo", Icone: Sprout, href: "/servicos" },
    { nome: "Construção", Icone: Hammer, href: "/construcao" },
    { nome: "Emprego", Icone: Briefcase, href: "/empregos" },
    { nome: "Imóvel", Icone: HomeIcon, href: "/imoveis" },
    { nome: "Aluguel Máquinas", Icone: Wrench, href: "/publico/maquinas" },
    { nome: "Tecnologia", Icone: Laptop, href: "/servicos" },
    { nome: "Automotivo", Icone: Car, href: "/servicos" },
    { nome: "Educação", Icone: GraduationCap, href: "/servicos" },
    { nome: "Saúde", Icone: HeartPulse, href: "/saude" },
    { nome: "Moda Masculina", Icone: Shirt, href: "/moda" },
    { nome: "Moda Feminina", Icone: Shirt, href: "/moda" },
    { nome: "Beleza & Estética", Icone: Sparkles, href: "/servicos" },
    { nome: "Eventos", Icone: PartyPopper, href: "/servicos" },
    { nome: "Pet Shop", Icone: PawPrint, href: "/pet" },
    { nome: "Financeiro", Icone: DollarSign, href: "/servicos" },
    { nome: "Carona Solidária", Icone: Users, href: "/carona" },
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
          const transcript = event.results[0][0].transcript;
          setSearchTerm(transcript);
          // Busca direto com o texto reconhecido em vez de chamar
          // handleSearch (que ficaria preso no searchTerm antigo, vazio,
          // por causa da closure — a busca automatica nunca disparava).
          if (transcript.trim()) {
            router.push("/busca?q=" + encodeURIComponent(transcript));
          }
        }
      };
      recognition.start();
    } else {
      toast.error("Busca por voz não suportada");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">
      <header className="bg-white px-4 pt-4 pb-3 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img
              src="/icons/logo-novo.png"
              alt="Valente Conecta"
              className="w-10 h-10 rounded-xl object-cover shadow-md"
            />
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-tight text-blue-900">VALENTE CONECTA</h1>
              <p className="text-[13px] text-slate-600 font-medium">A economia da cidade na palma da mão</p>
              <ContadorUsuarios />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {nomeUsuario && (
              <span className="text-sm font-semibold text-slate-700 max-w-[140px] truncate">{nomeUsuario}</span>
            )}
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100"
            >
              <MapPin size={13} className="text-blue-600" />
              <span>Valente, BA</span>
            </button>
          </div>
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
          <button onClick={handleVoiceSearch} className="absolute right-10 text-slate-400" aria-label="Busca por voz">
            <Mic size={16} />
          </button>
          <button onClick={handleSearch} className="absolute right-2 bg-blue-600 text-white p-1.5 rounded-lg" aria-label="Buscar">
            <Search size={14} />
          </button>
        </div>
      </header>

      <main className="px-4 pt-4 space-y-5">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Wallet size={14} className="text-amber-500" /> Carteira Digital
            </span>
            <button onClick={() => router.push("/extrato")} className="text-sm text-blue-600 font-medium">
              Ver extrato
            </button>
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-2xl font-black text-slate-900">{saldoMoedaConecta.toFixed(2)} {siglaMoedaConecta}</h2>
            <span className="text-sm text-slate-500 font-normal">Moeda Conecta</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/carteira?abrir=receber")}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <ArrowDownLeft size={16} /> Receber
            </button>
            <button
              onClick={() => router.push("/carteira?abrir=pagar")}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <ArrowUpRight size={16} /> Pagar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => router.push("/lancamento")}
            className="bg-gradient-to-br from-blue-900 to-blue-950 text-white p-4 rounded-2xl relative overflow-hidden shadow-sm flex flex-col justify-between h-32 cursor-pointer"
          >
            <div>
              <span className="bg-amber-500 text-blue-950 font-bold text-[11px] px-2 py-0.5 rounded-full uppercase">Novidade</span>
              <h3 className="font-bold text-sm mt-1 leading-snug flex items-center gap-1">
                <PlayCircle size={14} /> Lançamento
              </h3>
            </div>
            <p className="text-[13px] text-blue-100">Conecte-se ao comércio local agora!</p>
          </div>

          <div
            onClick={() => router.push("/qr-code")}
            className="bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 p-4 rounded-2xl relative overflow-hidden shadow-sm flex flex-col justify-between h-32 cursor-pointer"
          >
            <div>
              <span className="bg-white/80 text-amber-900 font-bold text-[11px] px-2 py-0.5 rounded-full uppercase">Indique</span>
              <h3 className="font-bold text-sm mt-1 leading-snug flex items-center gap-1">
                <Gift size={14} /> Indique e Ganhe
              </h3>
            </div>
            <p className="text-[13px] text-amber-950 font-medium">Ganhe bônus por indicação!</p>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Categorias</h3>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            {categoriasPrincipais.map((cat, idx) => {
              const Icone = cat.Icone;
              return (
                <button key={idx} onClick={() => router.push(cat.href)} className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-200">
                    <Icone size={22} />
                  </div>
                  <span className="text-[13px] font-medium text-slate-700 leading-tight">{cat.nome}</span>
                </button>
              );
            })}
            <button onClick={() => setShowTodasCategorias(!showTodasCategorias)} className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm border border-slate-300">
                <Plus size={22} />
              </div>
              <span className="text-[13px] font-medium text-slate-700 leading-tight">
                {showTodasCategorias ? "Ver menos" : "Ver Mais"}
              </span>
            </button>
          </div>

          {showTodasCategorias && (
            <div className="grid grid-cols-4 gap-3 text-center mt-4">
              {categoriasExtras.map((cat, idx) => {
                const Icone = cat.Icone;
                return (
                  <button key={idx} onClick={() => router.push(cat.href)} className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center shadow-sm border border-slate-200">
                      <Icone size={22} />
                    </div>
                    <span className="text-[13px] font-medium text-slate-700 leading-tight">{cat.nome}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Comércio Local em Destaque</h3>
            <button onClick={() => router.push("/comercio")} className="text-sm text-blue-600 font-medium">
              Ver todos
            </button>
          </div>

          <div
            ref={carrosselRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 -mx-4 px-4"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="snap-center shrink-0 w-[calc(100%-1.5rem)] bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
              <Store className="mx-auto mb-2 text-slate-300" size={32} />
              <p className="text-sm text-slate-500">Em breve, os comércios cadastrados aparecerão aqui.</p>
              <button
                onClick={() => router.push("/indicar-estabelecimento")}
                className="mt-3 text-sm text-blue-600 font-medium underline"
              >
                Quero cadastrar meu comércio
              </button>
            </div>

            <div
              onClick={() => router.push("/cozinha")}
              className="snap-center shrink-0 w-[calc(100%-1.5rem)] rounded-2xl shadow-sm cursor-pointer overflow-hidden"
            >
              <img
                src="/banner-cozinha-chef-neide.png"
                alt="Cozinha Chef Neide — Cardápio público do dia"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {showAdminNotifications && notificacoesAdmin.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-slate-100 bg-blue-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell size={13} className="text-blue-600" />
                </div>
                <div>
                  <span className="text-slate-800 font-bold text-sm">Comunicado Oficial</span>
                  <p className="text-slate-500 text-[13px]">Admin Master</p>
                </div>
              </div>
              <button onClick={() => setShowAdminNotifications(false)} className="text-slate-300 hover:text-slate-500">
                <X size={14} />
              </button>
            </div>
            <div className="p-3 space-y-2 max-h-48 overflow-auto">
              {notificacoesAdmin.map((notif) => (
                <div key={notif.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition">
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-slate-800 text-sm font-medium">{notif.titulo}</p>
                    <p className="text-slate-600 text-sm">{notif.mensagem}</p>
                    <p className="text-slate-500 text-[13px] mt-0.5">{notif.data}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {isAdmin && (
        <button
          onClick={() => router.push("/admin-master")}
          className="fixed bottom-24 right-4 z-40 bg-slate-900 text-white p-3 rounded-full shadow-lg"
          aria-label="Admin Master"
        >
          <Shield size={20} />
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-50 shadow-lg">
        <button onClick={() => router.push("/")} className="flex flex-col items-center text-blue-600">
          <HomeIcon size={20} />
          <span className="text-[13px] font-bold mt-1">Início</span>
        </button>
        <button onClick={() => router.push("/planos")} className="flex flex-col items-center text-slate-500 hover:text-slate-700">
          <CreditCard size={20} />
          <span className="text-[13px] font-medium mt-1">Planos</span>
        </button>
        <button onClick={() => router.push("/carteira")} className="flex flex-col items-center text-slate-500 hover:text-slate-700">
          <Wallet size={20} />
          <span className="text-[13px] font-medium mt-1">Carteira</span>
        </button>
        <button onClick={() => router.push("/profile")} className="flex flex-col items-center text-slate-500 hover:text-slate-700">
          <User size={20} />
          <span className="text-[13px] font-medium mt-1">Perfil</span>
        </button>
      </nav>
    </div>
  );
}