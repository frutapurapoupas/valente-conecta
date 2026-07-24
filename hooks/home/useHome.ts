// hooks/home/useHome.ts
// ðŸ§  LÃ“GICA COMPLETA - Home

"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import toast from 'react-hot-toast';
import { gerarSessaoTemp, isSessaoTempValida, isUserLoggedIn } from '@/lib/auth';
import { walletService } from '@/services/walletService';
import { homeService } from '@/services/homeService';
import { supabase } from '@/lib/supabase';
import { calculateReferralWallet } from '@/utils/referralBonus';

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
  const [saldoIndicacaoDisponivel, setSaldoIndicacaoDisponivel] = useState(0);
  const [saldoIndicacaoBloqueado, setSaldoIndicacaoBloqueado] = useState(0);
  const [notificacoesAdmin, setNotificacoesAdmin] = useState<NotificacaoAdmin[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSupported, setInstallSupported] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // âœ… ESTADO DO MODAL (AGORA AQUI)
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

  // ============================================================================
  // DADOS ESTÃTICOS - GRID DE ÃCONES RÃPIDOS
  // ============================================================================

  const gridItens = [
    { titulo: "MOTO TÃXI", cor: "#007bff", icone: "ðŸï¸", href: "/mototaxi" },
    { titulo: "MARMITA", cor: "#ff9800", icone: "ðŸ±", href: "/cozinha" },
    { titulo: "ÃGUA & GÃS", cor: "#0288d1", icone: "ðŸ’§", href: "/agua-gas" },
  ];

  // ============================================================================
  // CATEGORIAS - BLOCO 1 (SERVIÃ‡OS PRINCIPAIS)
  // ============================================================================

  const categoriasBloco1 = [
    { nome: "ACADEMIAS & ESPORTES", icone: "ðŸ’ª", href: "/academia" },
    { nome: "ALIMENTAÃ‡ÃƒO", icone: "ðŸ”", href: null },
    { nome: "MARMITA & BOLOS", icone: "ðŸ±", href: "/cozinha" },
    { nome: "TRANSPORTE & DELIVERY", icone: "ðŸï¸", href: "/mototaxi" },
    { nome: "UTILIDADES", icone: "ðŸ’¡", href: "/servicos" },
    { nome: "PROFISSIONAIS / SERVIÃ‡OS", icone: "ðŸ‘·", href: "/profissionais" },
    // âœ… ADICIONADO: EMPREGOS
    { nome: "EMPREGOS", icone: "ðŸ’¼", href: "/empregos" },
  ];

  // ============================================================================
  // CATEGORIAS - BLOCO 2 (MERCADOS E SERVIÃ‡OS)
  // ============================================================================

  const categoriasBloco2 = [
    { nome: "MERCADOS", icone: "ðŸª", href: "/comercio" },
    { nome: "IMÃ“VEL", icone: "ðŸ ", href: "/servicos" },
    { nome: "AGRO E CAMPO", icone: "ðŸŒ¾", href: "/servicos" },
    { nome: "CONSTRUÃ‡ÃƒO", icone: "ðŸ—ï¸", href: "/profissionais?categoria=pedreiro" },
    { nome: "ALUGUEL MÃQUINAS", icone: "ðŸ”¨", href: "/publico/maquinas" },
    { nome: "TECNOLOGIA", icone: "ðŸ’»", href: "/servicos" },
  ];

  // ============================================================================
  // CATEGORIAS - BLOCO 3 (AUTOMOTIVO, SAÃšDE, MODA)
  // ============================================================================

  const categoriasBloco3 = [
    { nome: "AUTOMOTIVO", icone: "ðŸš—", href: "/servicos" },
    { nome: "EDUCAÃ‡ÃƒO", icone: "ðŸ“š", href: "/servicos" },
    { nome: "SAÃšDE", icone: "ðŸ¥", href: "/servicos" },
    { nome: "MODA MASCULINA", icone: "ðŸ‘”", href: "/servicos" },
    { nome: "MODA FEMININA", icone: "ðŸ‘—", href: "/servicos" },
    { nome: "BELEZA & ESTÃ‰TICA", icone: "ðŸ’‡", href: "/servicos" },
  ];

  // ============================================================================
  // CATEGORIAS - BLOCO 4 (EVENTOS, PET, FINANCEIRO)
  // ============================================================================

  const categoriasBloco4 = [
    { nome: "BELEZA & ESTÃ‰TICA", icone: "ðŸ’…", href: "/servicos" },
    { nome: "EVENTOS & ENTRETENIMENTO", icone: "ðŸŽ‰", href: "/servicos" },
    { nome: "PET SHOP & ANIMAIS", icone: "ðŸ•", href: "/servicos" },
    { nome: "FINANCEIRO", icone: "ðŸ’°", href: "/servicos" },
  ];

  // ============================================================================
  // FUNÃ‡Ã•ES DO MODAL
  // ============================================================================

  const abrirSolicitacao = useCallback((servico: string, categoria: string) => {
    setModalSolicitacao({ open: true, servico, categoria });
  }, []);

  const fecharSolicitacao = useCallback(() => {
    setModalSolicitacao({ open: false, servico: "", categoria: "" });
  }, []);

  // ============================================================================
  // FUNÃ‡Ã•ES DE CARREGAMENTO
  // ============================================================================

  const carregarSaldo = useCallback(async () => {
    if (user?.id) {
      walletService.setUsuarioId(user.id, user.nome);
      const saldo = await walletService.getSaldo();
      setSaldoUsuario(saldo.disponivel);
    } else {
      setSaldoUsuario(0);
    }
    setCarregandoSaldo(false);
  }, [user]);

  const carregarSaldoIndicacoes = useCallback(async () => {
    if (!user?.id) {
      setSaldoIndicacaoDisponivel(0);
      setSaldoIndicacaoBloqueado(0);
      return;
    }

    try {
      const [configResp, payoutResp, usuariosResp, indicacoesResp] = await Promise.all([
        fetch('/api/referrals/config').then((res) => res.json()).catch(() => ({ success: false })),
        fetch(`/api/referrals/payout-requests?userId=${user.id}`).then((res) => res.json()).catch(() => ({ success: false, data: [] })),
        supabase.from('usuarios').select('id').eq('convidado_por_id', user.id),
        supabase.from('indicacoes_estabelecimentos').select('tipo, status').eq('usuario_id', user.id)
      ]);

      if (!configResp?.success) return;

      const wallet = calculateReferralWallet(
        configResp.data,
        {
          usuariosGerais: Array.isArray(usuariosResp.data) ? usuariosResp.data.length : 0,
          empresasLojas: Array.isArray(indicacoesResp.data) ? indicacoesResp.data.filter((item: any) => item.tipo === 'comercio' && (item.status === 'aprovado' || item.status === 'pago')).length : 0,
          profissionaisLiberais: Array.isArray(indicacoesResp.data) ? indicacoesResp.data.filter((item: any) => item.tipo === 'servico' && (item.status === 'aprovado' || item.status === 'pago')).length : 0,
        },
        Array.isArray(payoutResp?.data) ? payoutResp.data : []
      );

      setSaldoIndicacaoDisponivel(wallet.disponivel);
      setSaldoIndicacaoBloqueado(wallet.bloqueado);
    } catch (error) {
      console.error('Erro ao carregar saldo de indicaÃ§Ãµes:', error);
    }
  }, [user]);

  const carregarNotificacoesAdmin = useCallback(() => {
    try {
      const oficiais = localStorage.getItem("admin_notificacoes_sistema");
      if (oficiais) {
        const dadosOficiais = JSON.parse(oficiais);
        if (Array.isArray(dadosOficiais) && dadosOficiais.length > 0) {
          const ativas = dadosOficiais
            .filter((item: any) => item?.ativa)
            .map((item: any) => ({
              id: item.id,
              mensagem: item.mensagem,
              importancia: item.importancia || "media",
              data: item.data || new Date().toLocaleDateString(),
              status: "ativa"
            }));

          if (ativas.length > 0) {
            setNotificacoesAdmin(ativas);
            return;
          }
        }
      }

      const solicitacoes = localStorage.getItem("solicitacoes_servicos");
      if (solicitacoes) {
        const dados = JSON.parse(solicitacoes);
        if (Array.isArray(dados) && dados.length > 0) {
          const ativas = dados.filter((s: any) => s.status === "pendente" || s.status === "em_andamento");
          if (ativas.length > 0) {
            const notas = ativas.map((solicitacao: any) => ({
              id: solicitacao.id,
              mensagem: `ðŸ“‹ ${solicitacao.servico} - ${solicitacao.cliente?.nome || "AlguÃ©m"} solicitou ${solicitacao.servico}`,
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

      setNotificacoesAdmin([]);
    } catch (error) {
      console.error('Erro ao carregar notificaÃ§Ãµes:', error);
      setNotificacoesAdmin([]);
    }
  }, []);

  // ============================================================================
  // FUNÃ‡Ã•ES DE NAVEGAÃ‡ÃƒO E AÃ‡ÃƒO
  // ============================================================================

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  }, [searchTerm, router]);

  const handleVoiceSearch = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setTimeout(() => {
          router.push(`/busca?q=${encodeURIComponent(transcript)}`);
        }, 500);
      };
    } else {
      toast.error('Reconhecimento de voz nÃ£o disponÃ­vel neste navegador');
    }
  }, [router]);

  const handleBuscaFallback = useCallback((termo: string) => {
    router.push(`/busca?q=${encodeURIComponent(termo)}`);
  }, [router]);

  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const showQR = useCallback(() => router.push("/qr-code"), [router]);
  const verExtrato = useCallback(() => router.push("/extrato"), [router]);

  // ============================================================================
  // INSTALAÃ‡ÃƒO DO APP
  // ============================================================================

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      toast.error('InstalaÃ§Ã£o nÃ£o disponÃ­vel no momento');
      return;
    }
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('âœ… App instalado com sucesso!');
        setShowInstallBanner(false);
        localStorage.setItem("app_installed", "true");
      } else {
        toast.error('InstalaÃ§Ã£o cancelada');
      }
    } catch (error) {
      console.error('Erro na instalaÃ§Ã£o:', error);
      toast.error('Erro ao instalar o app');
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismissBanner = useCallback(() => {
    setShowInstallBanner(false);
    localStorage.setItem("install_banner_dismissed", "true");
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      carregarSaldo();
      carregarSaldoIndicacoes();
      carregarNotificacoesAdmin();
    }
  }, [isMounted, carregarSaldo, carregarSaldoIndicacoes, carregarNotificacoesAdmin]);

  // ============================================================================
  // RETORNO
  // ============================================================================

  return {
    // Estados
    user,
    isAdmin,
    searchTerm,
    setSearchTerm,
    activeSection,
    setActiveSection,
    saldoUsuario,
    carregandoSaldo,
    saldoIndicacaoDisponivel,
    saldoIndicacaoBloqueado,
    notificacoesAdmin,
    isMounted,
    deferredPrompt,
    showInstallBanner,
    isInstalling,
    installSupported,

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

    // Modal
    modalSolicitacao,
    abrirSolicitacao,
    fecharSolicitacao,

    // FunÃ§Ãµes
    carregarSaldo,
    carregarSaldoIndicacoes,
    carregarNotificacoesAdmin,
    handleSearch,
    handleVoiceSearch,
    handleBuscaFallback,
    scrollToSection,
    showQR,
    verExtrato,
    handleInstall,
    handleDismissBanner,

    // Router
    router,
  };
};

