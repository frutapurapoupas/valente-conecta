'use client';

// ============================================
// BUSCA INTELIGENTE - CÉREBRO
// ============================================
// Apenas lógica de negócio. Zero JSX visível.
// Renderiza via BuscaInteligenteView.
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';
import BuscaInteligenteView from './BuscaInteligenteView';
import type { ProdutoBusca } from './BuscaInteligenteView';

interface BuscaInteligenteProps {
  onResultadoClick?: (produto: ProdutoBusca) => void;
  placeholder?: string;
}

export default function BuscaInteligente({
  onResultadoClick,
  placeholder = 'O que você está procurando?'
}: BuscaInteligenteProps) {
  // ============================================
  // ESTADOS
  // ============================================
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<ProdutoBusca[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [precoDesbloqueio, setPrecoDesbloqueio] = useState(0.5);
  const [modalDesbloqueio, setModalDesbloqueio] = useState<{
    produto: ProdutoBusca;
    show: boolean;
  } | null>(null);
  const [dadosDesbloqueados, setDadosDesbloqueados] = useState<
    Record<string, boolean>
  >({});
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [mensagemCard, setMensagemCard] = useState<string | null>(null);
  const [origemBusca, setOrigemBusca] = useState<string | null>(null);
  const [notificacaoMostrada, setNotificacaoMostrada] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // OBTER LOCALIZAÇÃO E ID DO USUÁRIO
  // ============================================
  useEffect(() => {
    const carregarUserData = async () => {
      try {
        // Obter ID do usuário do localStorage ou context
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserId(user.id || user.email);
        }

        // Obter localização
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            () => console.log('Localização não disponível')
          );
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };
    carregarUserData();
  }, []);

  // ============================================
  // RECONHECIMENTO DE VOZ (2.7)
  // ============================================
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'pt-BR';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTermo(transcript);
        setIsListening(false);
        buscarProdutos(transcript);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
        toast.error('Não foi possível capturar o áudio');
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const iniciarBuscaPorVoz = () => {
    if (!recognition) {
      toast.error('Seu navegador não suporta busca por voz');
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento de voz:', error);
      toast.error('Erro ao iniciar microfone');
    }
  };

  // ============================================
  // CONFIGURAÇÃO DE PREÇO DESBLOQUEIO
  // ============================================
  useEffect(() => {
    const carregarConfig = async () => {
      try {
        const response = await fetch('/api/config/desbloqueio');
        const data = await response.json();
        if (data.success && data.preco) {
          setPrecoDesbloqueio(data.preco);
        }
      } catch (error) {
        console.error('Erro ao carregar configuracao:', error);
      }
    };
    carregarConfig();
  }, []);

  // ============================================
  // BUSCA LOCAL SUPABASE (2.1) + FALLBACK (2.2)
  // REGISTRO DE PENDÊNCIAS (2.4)
  // ============================================
  const buscarProdutos = useCallback(async (busca: string) => {
    if (!busca.trim() || busca.length < 2) {
      setResultados([]);
      setMensagemCard(null);
      setOrigemBusca(null);
      return;
    }

    setLoading(true);
    setMensagemCard(null);

    try {
      // Construir URL com parâmetros
      const params = new URLSearchParams({
        q: busca,
        userId: userId || '',
        ...(userLocation && { lat: userLocation.lat.toString(), lng: userLocation.lng.toString() })
      });

      const response = await fetch(`/api/busca?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.produtos && data.produtos.length > 0) {
        setResultados(data.produtos);
        setOrigemBusca(data.origem);
        setMostrarResultados(true);

        // Uma única notificação por termo de busca
        if (data.demandaRegistrada && data.demandaMensagem && notificacaoMostrada !== busca) {
          setNotificacaoMostrada(busca);
          setMensagemCard(data.demandaMensagem);
        }
      } else {
        setResultados([]);
        setMostrarResultados(true);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setResultados([]);
      toast.error('Erro ao processar busca');
    } finally {
      setLoading(false);
    }
  }, [userId, userLocation, notificacaoMostrada]);

  // ============================================
  // DEBOUNCE (500ms)
  // ============================================
  useEffect(() => {
    const timer = setTimeout(() => {
      buscarProdutos(termo);
    }, 500);
    return () => clearTimeout(timer);
  }, [termo, buscarProdutos]);

  // ============================================
  // DESBLOQUEIO DE CONTATOS (2.3)
  // ============================================
  const handleDesbloquear = (produto: ProdutoBusca) => {
    setModalDesbloqueio({ produto, show: true });
  };

  const confirmarDesbloqueio = async () => {
    if (!modalDesbloqueio?.produto) return;

    try {
      const response = await fetch('/api/pagamento/desbloqueio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoId: modalDesbloqueio.produto.id,
          valor: precoDesbloqueio
        })
      });

      const data = await response.json();

      if (data.success) {
        setDadosDesbloqueados((prev) => ({
          ...prev,
          [modalDesbloqueio.produto.id]: true
        }));
        toast.success(
          `Contato desbloqueado por R$ ${precoDesbloqueio.toFixed(2)}!`
        );
        setModalDesbloqueio(null);
      } else {
        toast.error('Erro no pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no desbloqueio:', error);
      toast.error('Erro ao processar pagamento');
    }
  };

  const fecharModal = () => {
    setModalDesbloqueio(null);
  };

  // ============================================
  // CLICK EM PRODUTO (Google / Local)
  // ============================================
  const handleProdutoClick = (produto: ProdutoBusca) => {
    console.log(
      'Produto clicado:',
      produto.nome,
      'Categoria:',
      produto.categoria
    );

    // Item da internet com link externo
    if (produto.categoria === 'internet' && produto.linkExterno) {
      window.open(produto.linkExterno, '_blank');
      return;
    }

    // Item da internet sem link ? Google
    if (produto.categoria === 'internet') {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        produto.nome + ' preço'
      )}`;
      window.open(searchUrl, '_blank');
      return;
    }

    // Item local ? callback
    if (onResultadoClick) {
      onResultadoClick(produto);
    }
  };

  // ============================================
  // HANDLERS DE FOCO
  // ============================================
  const handleFocus = () => {
    if (resultados.length > 0 || mensagemCard) {
      setMostrarResultados(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setMostrarResultados(false), 200);
  };

  // ============================================
  // RENDER: DELEGA TUDO PARA A VIEW
  // ============================================
  return (
    <BuscaInteligenteView
      termo={termo}
      resultados={resultados}
      loading={loading}
      mostrarResultados={mostrarResultados}
      isListening={isListening}
      dadosDesbloqueados={dadosDesbloqueados}
      mensagemCard={mensagemCard}
      origemBusca={origemBusca}
      precoDesbloqueio={precoDesbloqueio}
      modalDesbloqueio={modalDesbloqueio}
      placeholder={placeholder}
      onTermoChange={setTermo}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onIniciarBuscaVoz={iniciarBuscaPorVoz}
      onProdutoClick={handleProdutoClick}
      onDesbloquear={handleDesbloquear}
      onFecharModal={fecharModal}
      onConfirmarDesbloqueio={confirmarDesbloqueio}
    />
  );
}

