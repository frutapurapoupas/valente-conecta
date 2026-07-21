'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Mic, Lock, Eye, ShoppingCart, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProdutoBusca {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  categoria: string;
  fornecedorId: string;
  fornecedorNome: string;
  fornecedorEndereco: string;
  fornecedorTelefone: string;
}

interface BuscaInteligenteProps {
  onResultadoClick?: (produto: ProdutoBusca) => void;
  placeholder?: string;
}

export default function BuscaInteligente({ onResultadoClick, placeholder = "O que voce esta procurando?" }: BuscaInteligenteProps) {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<ProdutoBusca[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [precoDesbloqueio, setPrecoDesbloqueio] = useState(0.50);
  const [modalDesbloqueio, setModalDesbloqueio] = useState<{ produto: ProdutoBusca; show: boolean } | null>(null);
  const [dadosDesbloqueados, setDadosDesbloqueados] = useState<Record<string, boolean>>({});

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

  const buscarProdutos = useCallback(async (busca: string) => {
    if (!busca.trim() || busca.length < 2) {
      setResultados([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/busca?q=${encodeURIComponent(busca)}`);
      const data = await response.json();

      if (data.success && data.produtos) {
        setResultados(data.produtos);
        setMostrarResultados(true);
      } else {
        setResultados([]);
        if (data.fallback && data.fallback.length > 0) {
          setResultados(data.fallback);
        }
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarProdutos(termo);
    }, 500);
    return () => clearTimeout(timer);
  }, [termo, buscarProdutos]);

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
        setDadosDesbloqueados(prev => ({
          ...prev,
          [modalDesbloqueio.produto.id]: true
        }));
        toast.success(`Contato desbloqueado por R$ ${precoDesbloqueio.toFixed(2)}!`);
        setModalDesbloqueio(null);
      } else {
        toast.error('Erro no pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no desbloqueio:', error);
      toast.error('Erro ao processar pagamento');
    }
  };

  const getDisplayInfo = (produto: ProdutoBusca) => {
    const desbloqueado = dadosDesbloqueados[produto.id];
    return {
      fornecedorNome: desbloqueado ? produto.fornecedorNome : '*** BLOQUEADO ***',
      fornecedorEndereco: desbloqueado ? produto.fornecedorEndereco : '*** Desbloqueie para ver ***',
      fornecedorTelefone: desbloqueado ? produto.fornecedorTelefone : '*** Desbloqueie para ver ***'
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <>
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            onFocus={() => resultados.length > 0 && setMostrarResultados(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Mic className="w-5 h-5 text-gray-400 hover:text-blue-500" />
          </button>
        </div>

        {mostrarResultados && (termo.length >= 2) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm">Buscando...</p>
              </div>
            ) : resultados.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>Nenhum resultado encontrado</p>
                <p className="text-xs mt-1">Sugestao enviada ao administrador</p>
              </div>
            ) : (
              resultados.map((produto) => {
                const displayInfo = getDisplayInfo(produto);
                const desbloqueado = dadosDesbloqueados[produto.id];
                
                return (
                  <div
                    key={produto.id}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onResultadoClick?.(produto)}
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {produto.imagem ? (
                          <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCart className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{produto.nome}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{produto.descricao}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {formatCurrency(produto.preco)}
                            </p>
                            <p className="text-xs text-gray-400">{produto.categoria}</p>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className={`text-sm ${desbloqueado ? 'text-gray-700' : 'text-gray-400 blur-sm select-none'}`}>
                                ðŸ“ {displayInfo.fornecedorNome}
                              </p>
                              <p className={`text-xs ${desbloqueado ? 'text-gray-500' : 'text-gray-400 blur-sm select-none'}`}>
                                ðŸ  {displayInfo.fornecedorEndereco}
                              </p>
                              <p className={`text-xs ${desbloqueado ? 'text-blue-600' : 'text-gray-400 blur-sm select-none'}`}>
                                ðŸ“ž {displayInfo.fornecedorTelefone}
                              </p>
                            </div>
                            {!desbloqueado && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDesbloquear(produto);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
                              >
                                <Lock className="w-3 h-3" />
                                R$ {precoDesbloqueio.toFixed(2)}
                              </button>
                            )}
                            {desbloqueado && (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Desbloqueado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {modalDesbloqueio?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Desbloquear Contato</h2>
              <button onClick={() => setModalDesbloqueio(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                {modalDesbloqueio.produto.imagem ? (
                  <img src={modalDesbloqueio.produto.imagem} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{modalDesbloqueio.produto.nome}</h3>
                <p className="text-sm text-gray-500">{modalDesbloqueio.produto.descricao}</p>
                <p className="font-bold text-green-600 mt-1">{formatCurrency(modalDesbloqueio.produto.preco)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Ao desbloquear, voce tera acesso a:</p>
              <ul className="text-sm space-y-1">
                <li>âœ… Nome do fornecedor</li>
                <li>âœ… Endereco completo</li>
                <li>âœ… Telefone para contato</li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Valor do desbloqueio:</span>
                <span className="text-2xl font-bold text-green-600">R$ {precoDesbloqueio.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalDesbloqueio(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDesbloqueio}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Pagar R$ {precoDesbloqueio.toFixed(2)}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">
              Pagamento seguro via PIX ou Cartao de Credito
            </p>
          </div>
        </div>
      )}
    </>
  );
}

