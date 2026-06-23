// hooks/home/useHome.ts
// 🪝 LÓGICA COMPLETA - Home

"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import toast from 'react-hot-toast';
import { gerarSessaoTemp, isSessaoTempValida, isUserLoggedIn } from '@/lib/auth';
import { walletService } from '@/services/walletService';
import { homeService } from '@/services/homeService';

export interface NotificacaoAdmin {
  id: string | number;
  mensagem: string;
  importancia: string;
  data: string;
  status?: string;
}

export const useHome = () => {
  const router = useRouter();
  const { user, isAdmin } = useApp();
  
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState(1);
  const [saldoUsuario, setSaldoUsuario] = useState(0);
  const [carregandoSaldo, setCarregandoSaldo] = useState(true);
  const [notificacoesAdmin, setNotificacoesAdmin] = useState<NotificacaoAdmin[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSupported, setInstallSupported] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  // ✅ ESTADO DO MODAL (AGORA AQUI)
  const [modalSolicitacao, setModalSolicitacao] = useState({ 
    open: false, 
    servico: "", 
    categoria: "" 
  });

  // Refs
  const homeRef = useRef<HTMLDivElement>(null);
  const lancamentoRef = useRef<HTMLDivElement>(null);
  const categorias1Ref = useRef<HTMLDivElement>(null);
  const categorias2Ref = useRef<HTMLDivElement>(null);
  const categorias3Ref = useRef<HTMLDivElement>(null);
  const categorias4Ref = useRef<HTMLDivElement>(null);

  // Dados estáticos
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

  // ✅ FUNÇÃO PARA ABRIR SOLICITAÇÃO (AGORA AQUI)
  const abrirSolicitacao = useCallback((servico: string, categoria: string) => {
    setModalSolicitacao({ open: true, servico, categoria });
  }, []);

  // ✅ FUNÇÃO PARA FECHAR SOLICITAÇÃO (AGORA AQUI)
  const fecharSolicitacao = useCallback(() => {
    setModalSolicitacao({ open: false, servico: "", categoria: "" });
  }, []);

  // Carregar saldo
  const carregarSaldo = useCallback(async () => {
    if (user?.id) {
      walletService.setUsuarioId(user.id, user.nome || user.name);
      const saldo = await walletService.getSaldo();
      setSaldoUsuario(saldo.disponivel);
    } else {
      setSaldoUsuario(0);
    }
    setCarregandoSaldo(false);
  }, [user]);

  // Carregar notificações
  const carregarNotificacoesAdmin = useCallback(() => {
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
      console.error("Erro ao carregar notificações:", error);
      setNotificacoesAdmin([
        { id: "error", mensagem: "📢 Fique ligado nas novidades!", importancia: "info", data: new Date().toLocaleDateString() }
      ]);
    }
  }, []);

  // Efeitos
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      carregarSaldo();
    } else {
      setCarregandoSaldo(false);
    }
  }, [user, carregarSaldo]);

  useEffect(() => {
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
  }, [carregarNotificacoesAdmin]);

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

  // Funções de navegação
  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
  }, [searchTerm, router]);

  const handleVoiceSearch = useCallback(() => {
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
  }, [handleSearch]);

  const handleBuscaFallback = useCallback((termo: string) => {
    setSearchTerm(termo);
    setTimeout(handleSearch, 100);
  }, [handleSearch]);

  const handleInstall = useCallback(async () => {
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
  }, [deferredPrompt, isInstalling]);

  const handleDismissBanner = useCallback(() => {
    setShowInstallBanner(false);
    localStorage.setItem("install_banner_dismissed", "true");
  }, []);

  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const showQR = useCallback(() => router.push("/qr-code"), [router]);
  const verExtrato = useCallback(() => router.push("/extrato"), [router]);

  return {
    // Estado
    user,
    isAdmin,
    searchTerm,
    setSearchTerm,
    activeSection,
    saldoUsuario,
    carregandoSaldo,
    notificacoesAdmin,
    showInstallBanner,
    isInstalling,
    installSupported,
    isMounted,
    
    // Modal
    modalSolicitacao,
    abrirSolicitacao,
    fecharSolicitacao,
    
    // Refs
    homeRef,
    lancamentoRef,
    categorias1Ref,
    categorias2Ref,
    categorias3Ref,
    categorias4Ref,
    
    // Dados
    gridItens,
    categoriasBloco1,
    categoriasBloco2,
    categoriasBloco3,
    categoriasBloco4,
    
    // Funções
    handleSearch,
    handleVoiceSearch,
    handleBuscaFallback,
    handleInstall,
    handleDismissBanner,
    scrollToSection,
    showQR,
    verExtrato,
    router,
  };
};