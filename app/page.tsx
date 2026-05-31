"use client";

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import SolicitacaoModal from "@/app/components/SolicitacaoModal";
import { Smartphone, Download, X, Bell, Shield, Wallet, QrCode, ArrowUpRight, ArrowDownLeft, Copy, Check, Camera, Search } from "lucide-react";
import { gerarSessaoTemp, isSessaoTempValida, isUserLoggedIn } from "@/lib/auth";
import BuscaInteligente from "@/components/BuscaInteligente";
import { walletService, QRCodeTransferencia } from "@/services/walletService";
// ✅ Biblioteca moderna para leitura de QR Code
import { QrScanner } from "@yudiel/react-qr-scanner";

function HomePageContent() {
  const router = useRouter();
  const { user, isAdmin } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState(1);
  const [modalSolicitacao, setModalSolicitacao] = useState({ open: false, servico: "", categoria: "" });
  const [saldoUsuario, setSaldoUsuario] = useState(0);
  const [carregandoSaldo, setCarregandoSaldo] = useState(true);
  
  // Modais de pagamento
  const [showModalPagamento, setShowModalPagamento] = useState(false);
  const [modalTipo, setModalTipo] = useState<"receber" | "pagar">("receber");
  const [valorTransacao, setValorTransacao] = useState("");
  const [descricaoTransacao, setDescricaoTransacao] = useState("");
  
  // QR Code
  const [qrCodeGerado, setQrCodeGerado] = useState<QRCodeTransferencia | null>(null);
  const [qrCodeLido, setQrCodeLido] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [showGerarQR, setShowGerarQR] = useState(false);
  const [showLerQR, setShowLerQR] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const [notificacoesUsuario, setNotificacoesUsuario] = useState([]);
  const [notificacoesAdmin, setNotificacoesAdmin] = useState<Array<{
    id: string | number;
    mensagem: string;
    importancia: string;
    data: string;
    status?: string;
  }>>([]);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSupported, setInstallSupported] = useState(true);

  const homeRef = useRef<HTMLDivElement>(null);
  const lancamentoRef = useRef<HTMLDivElement>(null);
  const categorias1Ref = useRef<HTMLDivElement>(null);
  const categorias2Ref = useRef<HTMLDivElement>(null);
  const categorias3Ref = useRef<HTMLDivElement>(null);
  const categorias4Ref = useRef<HTMLDivElement>(null);

  // Carregar saldo do usuário
  useEffect(() => {
    const carregarSaldo = async () => {
      if (user?.id) {
        walletService.setUsuarioId(user.id, user.nome || user.name);
        const saldo = await walletService.getSaldo();
        setSaldoUsuario(saldo.disponivel);
      } else {
        setSaldoUsuario(0);
      }
      setCarregandoSaldo(false);
    };
    
    carregarSaldo();
  }, [user]);

  // Carregar notificações do Admin Master do localStorage
  useEffect(() => {
    const carregarNotificacoesAdmin = () => {
      try {
        const solicitacoes = localStorage.getItem("solicitacoes_servicos");
        if (solicitacoes) {
          const dados = JSON.parse(solicitacoes);
          if (Array.isArray(dados) && dados.length > 0) {
            const ativas = dados.filter((s: any) => s.status === "pendente" || s.status === "em_andamento");
            if (ativas.length > 0) {
              const notas = ativas.map((solicitacao: any) => ({
                id: solicitacao.id,
                mensagem: `📋 ${solicitacao.servico} - ${solicitacao.cliente?.nome || "Alguém"} solicitou ${solicitacao.servico}`,
                importancia: solicitacao.status === "pendente" ? "alta" : "media",
                data: new Date(solicitacao.data).toLocaleDateString(),
                status: solicitacao.status
              }));
              setNotificacoesAdmin(notas);
              return;
            }
          }
        }

        const notasAdmin = localStorage.getItem("notas_admin");
        if (notasAdmin) {
          const dados = JSON.parse(notasAdmin);
          if (Array.isArray(dados) && dados.length > 0) {
            setNotificacoesAdmin(dados);
            return;
          }
        }

        const demandas = localStorage.getItem("demandas");
        if (demandas) {
          const dados = JSON.parse(demandas);
          if (Array.isArray(dados) && dados.length > 0) {
            setNotificacoesAdmin(dados);
            return;
          }
        }

        const notificacoes = localStorage.getItem("notificacoes");
        if (notificacoes) {
          const dados = JSON.parse(notificacoes);
          if (Array.isArray(dados) && dados.length > 0) {
            setNotificacoesAdmin(dados);
            return;
          }
        }

        setNotificacoesAdmin([
          { id: "default", mensagem: "✅ Sistema operando normalmente", importancia: "info", data: new Date().toLocaleDateString() }
        ]);
      } catch (error) {
        console.error("Erro ao carregar notificações do admin:", error);
        setNotificacoesAdmin([
          { id: "error", mensagem: "📢 Fique ligado nas novidades!", importancia: "info", data: new Date().toLocaleDateString() }
        ]);
      }
    };

    carregarNotificacoesAdmin();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "solicitacoes_servicos" || e.key === "notas_admin" || e.key === "demandas" || e.key === "notificacoes") {
        carregarNotificacoesAdmin();
        if (e.key === "solicitacoes_servicos") {
          toast.success("📢 Nova demanda recebida! Confira o card abaixo.");
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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

  // FUNÇÕES DA CARTEIRA
  const abrirModalReceber = () => {
    if (!user) {
      toast.error("Faça login para acessar sua carteira");
      router.push("/login");
      return;
    }
    setModalTipo("receber");
    setValorTransacao("");
    setDescricaoTransacao("");
    setQrCodeGerado(null);
    setQrCodeLido("");
    setShowGerarQR(false);
    setShowLerQR(false);
    setIsCameraOpen(false);
    setShowModalPagamento(true);
  };

  const abrirModalPagar = () => {
    if (!user) {
      toast.error("Faça login para acessar sua carteira");
      router.push("/login");
      return;
    }
    setModalTipo("pagar");
    setValorTransacao("");
    setDescricaoTransacao("");
    setQrCodeLido("");
    setIsCameraOpen(false);
    setShowModalPagamento(true);
  };

  const gerarQRCode = async () => {
    const valor = parseFloat(valorTransacao);
    if (isNaN(valor) || valor <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    if (modalTipo === "receber") {
      const qrData = await walletService.gerarQRCodeTransferencia(valor, descricaoTransacao);
      if (qrData) {
        setQrCodeGerado(qrData);
        toast.success("QR Code gerado! Compartilhe com quem vai pagar");
      }
    } else {
      if (!qrCodeLido.trim()) {
        toast.error("Digite ou cole o código do QR Code");
        return;
      }
      const result = await walletService.processarQRCodeTransferencia(qrCodeLido);
      if (result.success) {
        toast.success(result.message);
        setShowModalPagamento(false);
        setQrCodeLido("");
        setValorTransacao("");
        setDescricaoTransacao("");
        setIsCameraOpen(false);
        const saldo = await walletService.getSaldo();
        setSaldoUsuario(saldo.disponivel);
      } else {
        toast.error(result.message);
      }
    }
  };

  const processarRecebimentoQR = async () => {
    if (!qrCodeLido.trim()) {
      toast.error("Digite ou cole o código do QR Code");
      return;
    }
    const result = await walletService.processarQRCodeTransferencia(qrCodeLido);
    if (result.success) {
      toast.success(result.message);
      setShowModalPagamento(false);
      setQrCodeLido("");
      setValorTransacao("");
      setDescricaoTransacao("");
      setIsCameraOpen(false);
      const saldo = await walletService.getSaldo();
      setSaldoUsuario(saldo.disponivel);
    } else {
      toast.error(result.message);
    }
  };

  const copiarCodigoQR = () => {
    if (qrCodeGerado) {
      navigator.clipboard.writeText(qrCodeGerado.codigo);
      setCopiado(true);
      toast.success("Código copiado!");
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const verExtrato = () => {
    router.push("/extrato");
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
    } else {
      toast.error("Digite algo para buscar");
    }
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

  const handleBuscaFallback = (termo: string) => {
    console.log("BuscaInteligente: fallback acionado para", termo);
    setSearchTerm(termo);
    setTimeout(() => handleSearch(), 100);
  };

  const abrirSolicitacao = (servico: string, categoria: string) => {
    setModalSolicitacao({ open: true, servico, categoria });
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
          
          {/* APENAS O CAMPO DE BUSCA (sem botão) */}
          <BuscaInteligente 
            onSearch={handleSearch}
            onVoiceSearch={handleVoiceSearch}
            onFallback={handleBuscaFallback}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {/* LINHA DE BOTÕES: ESQUERDA (Ver extrato) e DIREITA (Buscar) */}
          <div className="flex justify-between items-center gap-3 mt-3">
            <button 
              onClick={verExtrato}
              className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Ver extrato
            </button>
            <button 
              onClick={handleSearchClick}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:from-yellow-600 hover:to-orange-600 transition flex items-center gap-2 shadow-md"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>

          {/* CONTAINER DE SALDO - COM SIMBOLO C$ ANTES DO VALOR */}
          <div className="bg-white/20 rounded-2xl p-4 mt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-base mb-1">Saldo disponível</p>
                <p className="text-white text-3xl font-bold">
                  {carregandoSaldo ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    `C$ ${saldoUsuario.toFixed(2)}`
                  )}
                </p>
                <p className="text-white/50 text-sm mt-0.5">Moeda Conecta (C$)</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-3">
              <button 
                onClick={abrirModalReceber} 
                className="flex-1 bg-white text-green-600 py-2 rounded-xl font-semibold text-sm hover:bg-gray-100 transition flex items-center justify-center gap-2"
              >
                <ArrowDownLeft className="w-4 h-4" />
                Receber
              </button>
              <button 
                onClick={abrirModalPagar} 
                className="flex-1 bg-white/30 text-white py-2 rounded-xl font-semibold text-sm hover:bg-white/40 transition flex items-center justify-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                Pagar
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-around px-5 py-4 gap-3">
          {gridItens.map((item, idx) => (<button key={idx} onClick={() => router.push(item.href)} className="flex-1 rounded-xl py-3 flex flex-col items-center gap-1 transition-transform hover:scale-105 shadow-lg" style={{ backgroundColor: item.cor }}><span className="text-2xl">{item.icone}</span><span className="text-white font-bold text-xs">{item.titulo}</span></button>))}
        </div>

        {/* CARD INDIQUE E GANHE */}
        <div className="px-5 mb-6">
          <div onClick={showQR} className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-lg hover:shadow-xl transition transform hover:scale-[1.02]">
            <div>
              <p className="text-black font-bold text-lg">🎁 INDIQUE E GANHE</p>
              <p className="text-black/70 text-sm">Compartilhe o app e ganhe bônus por indicação!</p>
            </div>
            <div className="moeda-sombreada w-16 h-16 rounded-full flex items-center justify-center shadow-xl">
              <span className="text-xl font-bold text-white drop-shadow-md">C$</span>
            </div>
          </div>
        </div>

        {/* NOTAS DO ADMIN MASTER */}
        <div className="px-5 mb-6">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-yellow-500/30 overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-gray-700 bg-gray-800">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-bold text-sm">👑 Admin Master</span>
              <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
                {notificacoesAdmin.length}
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-[450px] min-h-[270px] overflow-auto">
              {notificacoesAdmin.length > 0 ? (
                notificacoesAdmin.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
                    <div className={`mt-0.5 w-2 h-2 rounded-full ${
                      notif.importancia === "alta" ? "bg-red-500 animate-pulse" : 
                      notif.importancia === "media" ? "bg-yellow-500" : "bg-blue-500"
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm">{notif.mensagem}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 text-[10px]">{notif.data}</p>
                        {notif.status === "pendente" && (
                          <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">Pendente</span>
                        )}
                        {notif.status === "em_andamento" && (
                          <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">Em andamento</span>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${
                      notif.importancia === "alta" ? "bg-red-500/20 text-red-400" : 
                      notif.importancia === "media" ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {notif.importancia === "alta" ? "🔴 Urgente" : notif.importancia === "media" ? "⚠️ Importante" : "ℹ️ Info"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-[220px]">
                  <div className="text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhuma notificação ativa</p>
                    <p className="text-xs opacity-70 mt-1">As notificações do Admin aparecerão aqui</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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

      <SolicitacaoModal isOpen={modalSolicitacao.open} onClose={() => setModalSolicitacao({ open: false, servico: "", categoria: "" })} servico={modalSolicitacao.servico} categoria={modalSolicitacao.categoria} userNome={user?.nome || user?.name} userEmail={user?.email} userTelefone={user?.telefone} />

      {/* MODAL DE PAGAMENTO/RECEBIMENTO - COM LEITOR DE CÂMERA (QrScanner) */}
      {showModalPagamento && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {modalTipo === "receber" ? (
                  <><ArrowDownLeft className="w-5 h-5 text-green-400" /> Receber Moeda Conecta</>
                ) : (
                  <><ArrowUpRight className="w-5 h-5 text-blue-400" /> Pagar com Moeda Conecta</>
                )}
              </h2>
              <button onClick={() => {
                setShowModalPagamento(false);
                setQrCodeGerado(null);
                setQrCodeLido("");
                setShowGerarQR(false);
                setShowLerQR(false);
                setIsCameraOpen(false);
              }} className="text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {modalTipo === "receber" ? (
                // MODO RECEBER
                <>
                  {!showGerarQR && !showLerQR && !qrCodeGerado && qrCodeLido === "" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setShowGerarQR(true)}
                        className="bg-gray-700 hover:bg-gray-600 p-6 rounded-xl text-center transition"
                      >
                        <QrCode className="w-12 h-12 text-green-400 mx-auto mb-2" />
                        <p className="text-white font-medium">Gerar QR Code</p>
                        <p className="text-gray-400 text-xs mt-1">Receber pagamento</p>
                      </button>
                      <button
                        onClick={() => setShowLerQR(true)}
                        className="bg-gray-700 hover:bg-gray-600 p-6 rounded-xl text-center transition"
                      >
                        <Camera className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                        <p className="text-white font-medium">Ler QR Code</p>
                        <p className="text-gray-400 text-xs mt-1">Pagar alguém</p>
                      </button>
                    </div>
                  ) : showGerarQR && !qrCodeGerado ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Valor a receber (C$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={valorTransacao}
                          onChange={(e) => setValorTransacao(e.target.value)}
                          placeholder="0,00"
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl text-2xl font-bold text-center"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Descrição (opcional)
                        </label>
                        <input
                          type="text"
                          value={descricaoTransacao}
                          onChange={(e) => setDescricaoTransacao(e.target.value)}
                          placeholder="Ex: Pagamento do almoço"
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl text-sm"
                        />
                      </div>
                      <button
                        onClick={gerarQRCode}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-5 h-5" />
                        Gerar QR Code
                      </button>
                      <button
                        onClick={() => {
                          setShowGerarQR(false);
                          setValorTransacao("");
                          setDescricaoTransacao("");
                        }}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        ← Voltar
                      </button>
                    </>
                  ) : showLerQR && qrCodeLido === "" ? (
                    <>
                      <div className="bg-gray-700 rounded-xl p-4 text-center">
                        <Camera className="w-16 h-16 text-blue-400 mx-auto mb-3" />
                        <p className="text-white text-sm">Cole o código QR recebido abaixo:</p>
                      </div>
                      <textarea
                        value={qrCodeLido}
                        onChange={(e) => setQrCodeLido(e.target.value)}
                        placeholder="Cole aqui o código gerado pela pessoa que vai te pagar..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl text-sm font-mono"
                      />
                      <button
                        onClick={processarRecebimentoQR}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                      >
                        Confirmar Recebimento
                      </button>
                      <button
                        onClick={() => {
                          setShowLerQR(false);
                          setQrCodeLido("");
                        }}
                        className="text-gray-400 hover:text-white text-sm text-center w-full"
                      >
                        ← Voltar
                      </button>
                    </>
                  ) : qrCodeGerado ? (
                    <div className="text-center space-y-4">
                      <div className="bg-white p-4 rounded-xl inline-block mx-auto">
                        <div className="w-48 h-48 bg-black flex items-center justify-center rounded-xl">
                          <QrCode className="w-32 h-32 text-white" />
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        QR Code para receber <strong>{qrCodeGerado.valor} C$</strong>
                      </p>
                      <p className="text-gray-400 text-xs">{qrCodeGerado.descricao}</p>
                      <div className="bg-gray-700 rounded-xl p-3">
                        <p className="text-gray-400 text-xs mb-2">Código:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={qrCodeGerado.codigo}
                            readOnly
                            className="flex-1 bg-gray-600 text-white text-xs px-3 py-2 rounded-lg font-mono"
                          />
                          <button
                            onClick={copiarCodigoQR}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                          >
                            {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setQrCodeGerado(null);
                          setShowGerarQR(false);
                          setValorTransacao("");
                          setDescricaoTransacao("");
                        }}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        ← Voltar
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                // MODO PAGAR - COM LEITOR DE CÂMERA (QrScanner)
                <>
                  {isCameraOpen ? (
                    <div className="space-y-4">
                      <div className="bg-black rounded-xl overflow-hidden">
                        <QrScanner
                          onDecode={async (result) => {
                            setQrCodeLido(result);
                            setIsCameraOpen(false);
                            toast.success("QR Code lido com sucesso!");
                            
                            const transferResult = await walletService.processarQRCodeTransferencia(result);
                            if (transferResult.success) {
                              toast.success(transferResult.message);
                              setShowModalPagamento(false);
                              setQrCodeLido("");
                              setValorTransacao("");
                              setDescricaoTransacao("");
                              const saldo = await walletService.getSaldo();
                              setSaldoUsuario(saldo.disponivel);
                            } else {
                              toast.error(transferResult.message);
                            }
                          }}
                          onError={(error) => {
                            console.error("Erro na leitura do QR Code:", error);
                            toast.error("Erro ao ler QR Code. Tente novamente ou cole o código manualmente.");
                          }}
                          constraints={{ facingMode: "environment" }}
                          className="w-full h-80"
                        />
                      </div>
                      <p className="text-center text-gray-400 text-xs">
                        Aponte a câmera para o QR Code
                      </p>
                      <button
                        onClick={() => setIsCameraOpen(false)}
                        className="w-full py-2 bg-gray-700 text-white rounded-xl font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsCameraOpen(true)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Escanear QR Code
                      </button>
                      
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-gray-800 px-2 text-gray-400">ou cole o código manualmente</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Código QR
                        </label>
                        <textarea
                          value={qrCodeLido}
                          onChange={(e) => setQrCodeLido(e.target.value)}
                          placeholder="Cole aqui o código gerado pela pessoa que você quer pagar..."
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl text-sm font-mono"
                        />
                      </div>
                      
                      <button
                        onClick={gerarQRCode}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        Confirmar Pagamento
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
        .moeda-sombreada { 
          background: radial-gradient(circle at 35% 35%, #c49a1a, #8b6914); 
          box-shadow: 0 6px 15px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 2px rgba(0,0,0,0.2); 
          border: 1px solid #e6b422; 
          text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
        }
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