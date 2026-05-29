"use client";

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import SolicitacaoModal from "@/app/components/SolicitacaoModal";
import { Smartphone, Download, X, Bell, Shield } from "lucide-react";
import { gerarSessaoTemp, isSessaoTempValida, isUserLoggedIn } from "@/lib/auth";

function HomePageContent() {
  const router = useRouter();
  const { user, isAdmin } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState(1);
  const [showAdminNotification, setShowAdminNotification] = useState(true);
  const [modalSolicitacao, setModalSolicitacao] = useState({ open: false, servico: "", categoria: "" });
  const [notificacoesUsuario, setNotificacoesUsuario] = useState([
    { id: 1, mensagem: "🎉 Você recebeu R$ 5,00 de bônus por indicação!", lida: false, tipo: "bonus" },
    { id: 2, mensagem: "🍳 Seu pedido na Cozinha foi confirmado!", lida: false, tipo: "pedido" },
    { id: 3, mensagem: "💪 Novo treino disponível na Academia!", lida: false, tipo: "treino" }
  ]);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSupported, setInstallSupported] = useState(true);

  const homeRef = useRef<HTMLDivElement>(null);
  const lancamentoRef = useRef<HTMLDivElement>(null);
  const categorias1Ref = useRef<HTMLDivElement>(null);
  const categorias2Ref = useRef<HTMLDivElement>(null);
  const categorias3Ref = useRef<HTMLDivElement>(null);
  const categorias4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isUserLoggedIn()) return;
    if (!isSessaoTempValida()) {
      gerarSessaoTemp();
      const sessaoId = localStorage.getItem('sessao_temp_id');
      if (sessaoId) {
        document.cookie = `sessao_temp_id=${sessaoId}; path=/; max-age=1800`;
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallSupported(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const alreadyInstalled = localStorage.getItem("app_installed");
    const alreadyDismissed = localStorage.getItem("install_banner_dismissed");
    if (alreadyInstalled || alreadyDismissed || isStandalone) {
      setShowInstallBanner(false);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isInstalling) return;
    setIsInstalling(true);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem("app_installed", "true");
        setShowInstallBanner(false);
        toast.success("✅ App instalado na tela inicial!");
      }
      setDeferredPrompt(null);
    } else {
      toast.success("📱 Toque em 'Adicionar à Tela Inicial' no menu do navegador", { duration: 5000 });
    }
    setIsInstalling(false);
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem("install_banner_dismissed", "true");
  };

  const gridItens = [
    { titulo: "MOTO TÁXI", cor: "#007bff", icone: "🏍️", href: "/mototaxi" },
    { titulo: "MARMITA", cor: "#ff9800", icone: "🍱", href: "/cozinha" },
    { titulo: "ÁGUA & GÁS", cor: "#e64a19", icone: "💧", href: "/comercio" },
  ];

  const categoriasBloco1 = [
    { nome: "ACADEMIAS & ESPORTES", icone: "💪", href: "/academia" },
    { nome: "ALIMENTAÇÃO", icone: "🍔", href: null },
    { nome: "MARMITA & BOLOS", icone: "🍱", href: "/cozinha" },
    { nome: "TRANSPORTE & DELIVERY", icone: "🏍️", href: "/mototaxi" },
    { nome: "UTILIDADES", icone: "💡", href: "/servicos" },
    { nome: "SERVIÇOS", icone: "🔧", href: "/servicos" },
  ];

  const categoriasBloco2 = [
    { nome: "MERCADOS", icone: "🏪", href: "/comercio" },
    { nome: "IMÓVEL", icone: "🏠", href: "/servicos" },
    { nome: "AGRO E CAMPO", icone: "🌾", href: "/servicos" },
    { nome: "CONSTRUÇÃO", icone: "🏗️", href: "/servicos" },
    { nome: "ALUGUEL MÁQUINAS", icone: "🔨", href: "/servicos" },
    { nome: "TECNOLOGIA", icone: "💻", href: "/servicos" },
  ];

  const categoriasBloco3 = [
    { nome: "AUTOMOTIVO", icone: "🚗", href: "/servicos" },
    { nome: "EDUCAÇÃO", icone: "📚", href: "/servicos" },
    { nome: "SAÚDE", icone: "🏥", href: "/servicos" },
    { nome: "MODA MASCULINA", icone: "👔", href: "/servicos" },
    { nome: "MODA FEMININA", icone: "👗", href: "/servicos" },
    { nome: "BELEZA & ESTÉTICA", icone: "💇", href: "/servicos" },
  ];

  const categoriasBloco4 = [
    { nome: "BELEZA & ESTÉTICA", icone: "💅", href: "/servicos" },
    { nome: "EVENTOS & ENTRETENIMENTO", icone: "🎉", href: "/servicos" },
    { nome: "PET SHOP & ANIMAIS", icone: "🐕", href: "/servicos" },
    { nome: "FINANCEIRO", icone: "💰", href: "/servicos" },
  ];

  const notificacoesAdmin = [
    { id: 1, mensagem: "📢 ATENÇÃO: Novas funcionalidades disponíveis! Confira o cardápio da Cozinha.", importancia: "alta", data: "Hoje" },
    { id: 2, mensagem: "🎁 CAMPANHA: Indique um amigo e ganhe R$5 de bônus!", importancia: "media", data: "Hoje" },
    { id: 3, mensagem: "💪 ACADEMIA: Nova funcionalidade de geolocalização disponível!", importancia: "alta", data: "Ontem" },
  ];

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showQR = () => router.push("/qr-code");

  const handleSearch = () => {
    if (searchTerm.trim()) router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleVoiceSearch = () => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.onresult = (event: any) => {
        setSearchTerm(event.results[0][0].transcript);
        setTimeout(handleSearch, 500);
      };
      recognition.start();
    } else {
      toast.error("Busca por voz não suportada neste navegador");
    }
  };

  const abrirSolicitacao = (servico: string, categoria: string) => {
    setModalSolicitacao({ open: true, servico, categoria });
  };

  const marcarNotificacaoLida = (id: number) => {
    setNotificacoesUsuario(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [homeRef, lancamentoRef, categorias1Ref, categorias2Ref, categorias3Ref, categorias4Ref];
      const scrollPosition = window.scrollY + 100;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i].current;
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(i + 1);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const notificacoesNaoLidas = notificacoesUsuario.filter(n => !n.lida);

  if (!isMounted) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div ref={homeRef} className="min-h-screen">
        <div className="bg-gradient-to-r from-green-400 to-green-700 px-5 pt-8 pb-5 rounded-b-3xl">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-white text-lg font-bold">App Valente Conecta</h1>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">Olá, {user?.nome || user?.name || "Visitante"}</span>
              <button onClick={() => router.push("/profile")} className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center hover:bg-white/40 transition">
                <i className="fas fa-user text-white text-sm"></i>
              </button>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex items-center bg-white rounded-2xl px-3 py-2 shadow-lg">
              <i className="fas fa-search text-gray-400 mr-2 text-sm"></i>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSearch()} placeholder="Buscar produtos ou serviços..." className="flex-1 outline-none text-gray-700 bg-transparent text-sm" />
              <button onClick={handleVoiceSearch} className="text-gray-400 mr-2 hover:text-green-500 transition"><i className="fas fa-microphone text-sm"></i></button>
              <button onClick={handleSearch} className="bg-green-500 text-white px-3 py-1 rounded-xl text-xs font-medium hover:bg-green-600 transition">Buscar</button>
            </div>
          </div>
          <div className="bg-white/20 rounded-2xl p-3">
            <p className="text-white/80 text-xs">Saldo disponível</p>
            <p className="text-white text-xl font-bold mt-0.5">R$ {user?.wallet?.toFixed(2) || "150,00"}</p>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 bg-white text-green-600 py-1 rounded-xl font-semibold text-xs hover:bg-gray-100 transition">Receber</button>
              <button className="flex-1 bg-white/30 text-white py-1 rounded-xl font-semibold text-xs hover:bg-white/40 transition">Pagar</button>
            </div>
          </div>
        </div>

        {showInstallBanner && installSupported && (
          <div className="px-5 mt-4 mb-2 animate-in slide-down duration-500">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-white/20 rounded-full p-2 animate-pulse"><Smartphone className="w-5 h-5 text-white" /></div>
                  <div><p className="text-white font-bold text-sm">📱 Instale o App!</p><p className="text-white/70 text-xs">Acesso rápido pela tela inicial</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleInstall} disabled={isInstalling} className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-100 transition flex items-center gap-1 disabled:opacity-50 shadow-md">
                    {isInstalling ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <Download className="w-4 h-4" />}
                    {isInstalling ? "Instalando..." : "Instalar Agora"}
                  </button>
                  <button onClick={handleDismissBanner} className="text-white/50 hover:text-white transition p-1"><X className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-around px-5 py-4 gap-3">
          {gridItens.map((item, idx) => (<button key={idx} onClick={() => router.push(item.href)} className="flex-1 rounded-xl py-3 flex flex-col items-center gap-1 transition-transform hover:scale-105 shadow-lg" style={{ backgroundColor: item.cor }}><span className="text-2xl">{item.icone}</span><span className="text-white font-bold text-xs">{item.titulo}</span></button>))}
        </div>

        {/* CARD INDIQUE E GANHE CORRIGIDO */}
        <div className="px-5 mb-6">
          <div onClick={showQR} className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-lg hover:shadow-xl transition transform hover:scale-[1.02]">
            <div><p className="text-black font-bold text-lg">🎁 INDIQUE E GANHE</p><p className="text-black/70 text-sm">Ganhe R$5 por amigo + QR Code exclusivo</p></div>
            <div className="moeda-realista w-16 h-16 rounded-full flex items-center justify-center shadow-xl pulse"><span className="text-xl font-bold text-yellow-800">R$</span></div>
          </div>
        </div>

        {/* BOTÃO QR CODE ADICIONAL */}
        <div className="px-5 mb-6">
          <button onClick={() => router.push("/qr-code")} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition">
            📱 Ver QR Code de Indicação
          </button>
        </div>

        {isAdmin && showAdminNotification && (
          <div className="px-5 mb-6">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-yellow-500/30 overflow-hidden">
              <div className="flex justify-between items-center p-3 border-b border-gray-700 bg-gray-800">
                <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-yellow-400" /><span className="text-white font-bold text-sm">Admin Master</span><span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">{notificacoesAdmin.length}</span></div>
                <button onClick={() => setShowAdminNotification(false)} className="text-gray-400 hover:text-white transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-3 space-y-2 max-h-48 overflow-auto">
                {notificacoesAdmin.map((notif) => (<div key={notif.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/5"><div className={`mt-0.5 w-2 h-2 rounded-full ${notif.importancia === "alta" ? "bg-red-500" : notif.importancia === "media" ? "bg-yellow-500" : "bg-blue-500"}`}></div><div className="flex-1"><p className="text-gray-300 text-sm">{notif.mensagem}</p><p className="text-gray-500 text-[10px] mt-0.5">{notif.data}</p></div><div className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${notif.importancia === "alta" ? "bg-red-500/20 text-red-400" : notif.importancia === "media" ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400"}`}>{notif.importancia === "alta" ? "Urgente" : notif.importancia === "media" ? "Importante" : "Info"}</div></div>))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div ref={lancamentoRef} className="bg-gray-900 min-h-screen">
        <div className="p-6 pt-8">
          <div className="bg-white/10 rounded-3xl p-6 mb-8"><h2 className="text-xl font-semibold text-white mb-4">📹 Vídeo de Apresentação</h2><div className="bg-gray-800 h-72 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition"><i className="fas fa-play-circle text-7xl text-blue-400"></i></div></div>
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500 rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold text-white mb-4">LANÇAMENTO</h2>
            <p className="text-green-300 text-lg font-semibold mb-3">Começa agora em Valente a revolução no comércio digital!</p>
            <p className="text-gray-300 text-md mb-2">A experiência que você esperava agora é real e já começou.</p>
            <p className="text-gray-300 text-md mb-4">A Valente Conecta uniu inovação e praticidade para conectar você ao melhor da cidade.</p>
            <p className="text-yellow-400 font-bold text-lg mb-6">Participe agora, dê o play e faça parte desta nova história!</p>
            <button onClick={() => router.push("/qr-code")} className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg px-8 py-4 rounded-2xl w-full hover:scale-105 transition shadow-lg">💰 INDICAR AGORA E GANHAR</button>
          </div>
        </div>
      </div>

      <div ref={categorias1Ref} className="bg-gray-900 py-6"><div className="px-4 space-y-3">{categoriasBloco1.map((cat, idx) => (<div key={`b1-${idx}`} onClick={() => cat.href ? router.push(cat.href) : abrirSolicitacao(cat.nome, cat.nome)} className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-700"><div className="text-5xl">{cat.icone}</div><div className="flex-1"><h3 className="font-bold text-lg text-white">{cat.nome}</h3></div><i className="fas fa-chevron-right text-gray-500 text-xl"></i></div>))}</div></div>
      <div ref={categorias2Ref} className="bg-gray-900 py-6"><div className="px-4 space-y-3">{categoriasBloco2.map((cat, idx) => (<div key={`b2-${idx}`} onClick={() => abrirSolicitacao(cat.nome, cat.nome)} className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-700"><div className="text-5xl">{cat.icone}</div><div className="flex-1"><h3 className="font-bold text-lg text-white">{cat.nome}</h3></div><i className="fas fa-chevron-right text-gray-500 text-xl"></i></div>))}</div></div>
      <div ref={categorias3Ref} className="bg-gray-900 py-6"><div className="px-4 space-y-3">{categoriasBloco3.map((cat, idx) => (<div key={`b3-${idx}`} onClick={() => abrirSolicitacao(cat.nome, cat.nome)} className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-700"><div className="text-5xl">{cat.icone}</div><div className="flex-1"><h3 className="font-bold text-lg text-white">{cat.nome}</h3></div><i className="fas fa-chevron-right text-gray-500 text-xl"></i></div>))}</div></div>
      <div ref={categorias4Ref} className="bg-gray-900 py-6 pb-28"><div className="px-4 space-y-3">{categoriasBloco4.map((cat, idx) => (<div key={`b4-${idx}`} onClick={() => abrirSolicitacao(cat.nome, cat.nome)} className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-700"><div className="text-5xl">{cat.icone}</div><div className="flex-1"><h3 className="font-bold text-lg text-white">{cat.nome}</h3></div><i className="fas fa-chevron-right text-gray-500 text-xl"></i></div>))}</div></div>

      {user && notificacoesNaoLidas.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-gray-100"><div className="flex items-center gap-2"><Bell className="w-4 h-4 text-yellow-500" /><span className="text-gray-700 font-bold text-sm">Suas Notificações</span><span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{notificacoesNaoLidas.length}</span></div><button onClick={() => setNotificacoesUsuario(prev => prev.map(n => ({ ...n, lida: true })))} className="text-gray-400 text-xs hover:text-gray-600 transition">Marcar todas</button></div>
            <div className="p-3 space-y-2 max-h-48 overflow-auto">{notificacoesUsuario.filter(n => !n.lida).map((notif) => (<div key={notif.id} onClick={() => marcarNotificacaoLida(notif.id)} className="bg-gray-50 rounded-xl p-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition"><div className={`w-2 h-2 rounded-full ${notif.tipo === "bonus" ? "bg-green-500" : notif.tipo === "pedido" ? "bg-orange-500" : "bg-purple-500"}`}></div><p className="text-gray-600 text-sm flex-1">{notif.mensagem}</p><X className="w-3 h-3 text-gray-300" /></div>))}</div>
          </div>
        </div>
      )}

      <SolicitacaoModal isOpen={modalSolicitacao.open} onClose={() => setModalSolicitacao({ open: false, servico: "", categoria: "" })} servico={modalSolicitacao.servico} categoria={modalSolicitacao.categoria} userNome={user?.nome || user?.name} userEmail={user?.email} userTelefone={user?.telefone} />

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a1428] border-t border-white/10 py-2 z-50 overflow-x-auto">
        <div className="flex justify-around items-center text-xs min-w-[500px] px-2">
          <button onClick={() => window.location.href = "/"} className="flex flex-col items-center transition"><i className={`fas fa-home text-xl ${activeSection === 1 ? "text-green-400" : "text-gray-500"}`}></i><span className="text-[9px] text-gray-500">Home</span></button>
          <button onClick={() => scrollToSection(lancamentoRef)} className="flex flex-col items-center transition"><i className={`fas fa-play-circle text-xl ${activeSection === 2 ? "text-orange-400" : "text-gray-500"}`}></i><span className="text-[9px] text-gray-500">Lançamento</span></button>
          <button onClick={() => router.push("/ajuda")} className="flex flex-col items-center transition"><i className="fas fa-question-circle text-xl text-gray-500"></i><span className="text-[9px] text-gray-500">Ajuda</span></button>
          <button onClick={() => scrollToSection(categorias1Ref)} className="flex flex-col items-center transition"><i className={`fas fa-th-large text-xl ${activeSection === 3 ? "text-purple-400" : "text-gray-500"}`}></i><span className="text-[9px] text-gray-500">Serviços 1</span></button>
          <button onClick={() => scrollToSection(categorias2Ref)} className="flex flex-col items-center transition"><i className={`fas fa-th-large text-xl ${activeSection === 4 ? "text-blue-400" : "text-gray-500"}`}></i><span className="text-[9px] text-gray-500">Serviços 2</span></button>
          <button onClick={() => scrollToSection(categorias3Ref)} className="flex flex-col items-center transition"><i className={`fas fa-th-large text-xl ${activeSection === 5 ? "text-yellow-400" : "text-gray-500"}`}></i><span className="text-[9px] text-gray-500">Serviços 3</span></button>
          <button onClick={() => scrollToSection(categorias4Ref)} className="flex flex-col items-center transition"><i className={`fas fa-plus-circle text-xl ${activeSection === 6 ? "text-pink-400" : "text-gray-500"}`}></i><span className="text-[9px] text-gray-500">Serviços 4</span></button>
        </div>
      </nav>

      <style jsx>{`
        .moeda-realista { background: radial-gradient(circle at 30% 30%, #f5e050, #d4a017); box-shadow: 0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5); border: 1px solid #ffd700; }
        .pulse { animation: pulse-coin 1.5s ease-in-out infinite; }
        @keyframes pulse-coin { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-down { animation: slide-down 0.5s ease-out; }
      `}</style>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>}>
      <HomePageContent />
    </Suspense>
  );
}