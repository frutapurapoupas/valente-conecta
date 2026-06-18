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
  const inputRef = useRef<HTMLInputElement>(null);

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
      const response = await fetch(
        `/api/busca?q=${encodeURIComponent(busca)}`
      );
      const data = await response.json();

      if (data.success && data.produtos && data.produtos.length > 0) {
        setResultados(data.produtos);
        setOrigemBusca(data.origem);
        setMostrarResultados(true);

        // Fallback internet: pendência (2.4)
        if (data.origem === 'internet' && data.mensagemCard) {
          setMensagemCard(data.mensagemCard);
          toast.custom(
            (t) => (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md shadow-lg">
                <div className="flex items-start gap-2">
                  <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Busca registrada!
                    </p>
                    <p className="text-xs text-blue-600">
                      Em até 24h você receberá uma resposta sobre &ldquo;{busca}
                      &rdquo; em Valente, BA.
                    </p>
                  </div>
                </div>
              </div>
            ),
            { duration: 8000 }
          );
        }
      } else {
        setResultados([]);
        setMostrarResultados(true);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

    // Item da internet sem link → Google
    if (produto.categoria === 'internet') {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        produto.nome + ' preço'
      )}`;
      window.open(searchUrl, '_blank');
      return;
    }

    // Item local → callback
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