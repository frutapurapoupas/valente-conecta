'use client';

// ============================================
// BUSCA INTELIGENTE VIEW - DESIGN PURO
// ============================================
// Componente de UI sem lógica de negócios.
// Recebe todos os dados e callbacks via props.
// Glassmorphism, cantos arredondados amplos,
// sombras suaves, micro-interações hover.
// ============================================

import {
  Search, Mic, Lock, Eye, ShoppingCart, X,
  Bell, Globe, ExternalLink, Sparkles, Zap
} from 'lucide-react';

// ============================================
// TIPOS COMPARTILHADOS
// ============================================
export interface ProdutoBusca {
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
  linkExterno?: string;
}

export interface ModalDesbloqueioState {
  produto: ProdutoBusca;
  show: boolean;
}

export interface BuscaInteligenteViewProps {
  // === Estados ===
  termo: string;
  resultados: ProdutoBusca[];
  loading: boolean;
  mostrarResultados: boolean;
  isListening: boolean;
  dadosDesbloqueados: Record<string, boolean>;
  mensagemCard: string | null;
  origemBusca: string | null;
  precoDesbloqueio: number;
  modalDesbloqueio: ModalDesbloqueioState | null;
  placeholder: string;

  // === Handlers de busca ===
  onTermoChange: (termo: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onIniciarBuscaVoz: () => void;

  // === Handlers de resultados ===
  onProdutoClick: (produto: ProdutoBusca) => void;
  onDesbloquear: (produto: ProdutoBusca) => void;
  onFecharModal: () => void;
  onConfirmarDesbloqueio: () => void;
}

// ============================================
// FORMATADORES
// ============================================
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function getDisplayInfo(
  produto: ProdutoBusca,
  dadosDesbloqueados: Record<string, boolean>
): {
  fornecedorNome: string;
  fornecedorEndereco: string;
  fornecedorTelefone: string;
  precisaDesbloquear: boolean;
} {
  const desbloqueado = dadosDesbloqueados[produto.id];
  const isInternet = produto.categoria === 'internet';

  if (isInternet) {
    return {
      fornecedorNome: produto.fornecedorNome,
      fornecedorEndereco: produto.fornecedorEndereco,
      fornecedorTelefone: produto.fornecedorTelefone,
      precisaDesbloquear: false
    };
  }

  return {
    fornecedorNome: desbloqueado
      ? produto.fornecedorNome
      : '*** BLOQUEADO ***',
    fornecedorEndereco: desbloqueado
      ? produto.fornecedorEndereco
      : '*** Desbloqueie para ver ***',
    fornecedorTelefone: desbloqueado
      ? produto.fornecedorTelefone
      : '*** Desbloqueie para ver ***',
    precisaDesbloquear: !desbloqueado
  };
}

// ============================================
// COMPONENTE - BUSCA INTELIGENTE VIEW
// ============================================
export default function BuscaInteligenteView({
  termo,
  resultados,
  loading,
  mostrarResultados,
  isListening,
  dadosDesbloqueados,
  mensagemCard,
  origemBusca,
  precoDesbloqueio,
  modalDesbloqueio,
  placeholder,
  onTermoChange,
  onFocus,
  onBlur,
  onIniciarBuscaVoz,
  onProdutoClick,
  onDesbloquear,
  onFecharModal,
  onConfirmarDesbloqueio
}: BuscaInteligenteViewProps) {

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    <>
      <div className="relative w-full max-w-2xl mx-auto">
        {/* ==========================================
            CAMPO DE BUSCA COM GLASSMORPHISM
            ========================================== */}
        <div className="
          group
          relative
          flex items-center
          bg-white/90 backdrop-blur-md
          border-2 border-gray-200/80
          focus-within:border-blue-400
          focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]
          rounded-2xl
          transition-all duration-300
        ">
          {/* Ícone de busca */}
          <div className="pl-4 pr-2">
            <Search className="
              w-5 h-5
              text-gray-400
              group-focus-within:text-blue-500
              transition-colors duration-200
            " />
          </div>

          {/* Input */}
          <input
            type="text"
            value={termo}
            onChange={(e) => onTermoChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            className="
              flex-1
              py-3.5 pr-3
              bg-transparent
              text-gray-900 placeholder-gray-400
              text-base
              outline-none
            "
          />

          {/* Botão microfone */}
          <button
            onClick={onIniciarBuscaVoz}
            title={isListening ? 'Ouvindo...' : 'Buscar por voz'}
            className={`
              mr-2 p-2.5 rounded-xl
              transition-all duration-200
              ${isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
              }
            `}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* ==========================================
            INDICADOR DE ESCUTA POR VOZ
            ========================================== */}
        {isListening && (
          <div className="
            absolute top-full left-0 right-0 mt-2
            bg-white/90 backdrop-blur-xl
            border border-gray-200/80
            rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)]
            z-50 p-4
          ">
            <div className="flex items-center justify-center gap-3">
              {/* Círculo pulsante vermelho */}
              <span className="relative flex w-4 h-4">
                <span className="
                  absolute inline-flex w-full h-full
                  bg-red-400 rounded-full opacity-75
                  animate-ping
                " />
                <span className="
                  relative inline-flex w-4 h-4
                  bg-red-500 rounded-full
                " />
              </span>
              <span className="text-sm font-medium text-gray-700">
                Ouvindo... Fale agora
              </span>
              <Zap className="w-4 h-4 text-red-400 animate-pulse" />
            </div>
          </div>
        )}

        {/* ==========================================
            DROPDOWN DE RESULTADOS
            ========================================== */}
        {mostrarResultados && termo.length >= 2 && (
          <div className="
            absolute top-full left-0 right-0 mt-2
            bg-white/95 backdrop-blur-xl
            border border-gray-200/80
            rounded-2xl
            shadow-[0_12px_40px_rgba(0,0,0,0.1)]
            z-50
            max-h-96 overflow-y-auto
            divide-y divide-gray-100
          ">
            {/* Loading */}
            {loading && (
              <div className="p-6 text-center">
                <div className="
                  w-8 h-8 border-2 border-blue-500
                  border-t-transparent rounded-full
                  animate-spin mx-auto
                " />
                <p className="mt-2 text-sm text-gray-500 font-medium">Buscando...</p>
              </div>
            )}

            {/* Nenhum resultado */}
            {!loading && resultados.length === 0 && (
              <div className="p-6 text-center">
                <div className="
                  w-14 h-14 rounded-2xl
                  bg-gray-100 mx-auto
                  flex items-center justify-center
                  mb-3
                ">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Nenhum resultado encontrado
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tente buscar por outro termo
                </p>
              </div>
            )}

            {/* Resultados */}
            {!loading && resultados.length > 0 && (
              <>
                {/* Banner de busca registrada (fallback internet) */}
                {mensagemCard && origemBusca === 'internet' && (
                  <div className="
                    p-3
                    bg-gradient-to-r from-amber-50 to-yellow-50
                    border-b border-amber-100
                  ">
                    <div className="flex gap-2.5 items-start">
                      <div className="
                        w-8 h-8 rounded-xl
                        bg-amber-100 flex items-center justify-center
                        flex-shrink-0 mt-0.5
                      ">
                        <Bell className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          📢 Busca registrada!
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                          {mensagemCard}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Badge de origem internet */}
                {origemBusca === 'internet' && (
                  <div className="
                    px-3 py-2.5
                    bg-gradient-to-r from-blue-50 to-indigo-50
                    border-b border-blue-100
                    flex items-center justify-center gap-1.5
                  ">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-medium text-blue-600">
                      Resultados da internet — Clique para ver ofertas
                    </span>
                  </div>
                )}

                {/* Lista de produtos */}
                {resultados.map((produto) => {
                  const displayInfo = getDisplayInfo(produto, dadosDesbloqueados);
                  const isInternet = produto.categoria === 'internet';
                  const desbloqueado = dadosDesbloqueados[produto.id];

                  return (
                    <div
                      key={produto.id}
                      onClick={() => onProdutoClick(produto)}
                      className="
                        p-3.5
                        hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-white
                        cursor-pointer
                        transition-all duration-150
                        active:scale-[0.995]
                      "
                    >
                      <div className="flex gap-3.5">
                        {/* Imagem / placeholder */}
                        <div className="
                          w-16 h-16 rounded-2xl
                          bg-gradient-to-br from-gray-50 to-gray-100
                          overflow-hidden flex-shrink-0
                          border border-gray-100
                          shadow-sm
                        ">
                          {produto.imagem ? (
                            <img
                              src={produto.imagem}
                              alt={produto.nome}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="
                              w-full h-full
                              flex items-center justify-center
                              text-gray-300
                            ">
                              <ShoppingCart className="w-7 h-7" />
                            </div>
                          )}
                        </div>

                        {/* Informações */}
                        <div className="flex-1 min-w-0">
                          {/* Título + Preço */}
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h3 className="
                                font-semibold text-gray-900 text-sm
                                truncate
                              ">
                                {produto.nome}
                              </h3>
                              <p className="
                                text-xs text-gray-500
                                line-clamp-1 mt-0.5
                              ">
                                {produto.descricao}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-green-600 text-sm">
                                {formatCurrency(produto.preco)}
                              </p>
                              {isInternet && (
                                <span className="
                                  text-[10px] font-medium text-blue-500
                                  flex items-center gap-0.5 justify-end mt-0.5
                                ">
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  Ver oferta
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Fornecedor */}
                          <div className="
                            mt-2 pt-2
                            border-t border-gray-50
                          ">
                            <div className="flex justify-between items-center">
                              <div className="min-w-0 flex-1">
                                <p className={`
                                  text-xs font-medium truncate
                                  ${isInternet
                                    ? 'text-gray-700'
                                    : desbloqueado
                                      ? 'text-gray-700'
                                      : 'text-gray-400 blur-sm select-none'
                                  }
                                `}>
                                  📍 {displayInfo.fornecedorNome}
                                </p>
                                <p className={`
                                  text-[11px] truncate
                                  ${isInternet
                                    ? 'text-gray-500'
                                    : desbloqueado
                                      ? 'text-gray-500'
                                      : 'text-gray-400 blur-sm select-none'
                                  }
                                `}>
                                  🏠 {displayInfo.fornecedorEndereco}
                                </p>
                                <p className={`
                                  text-[11px] truncate
                                  ${isInternet
                                    ? 'text-blue-600 font-medium'
                                    : desbloqueado
                                      ? 'text-blue-600 font-medium'
                                      : 'text-gray-400 blur-sm select-none'
                                  }
                                `}>
                                  📞 {displayInfo.fornecedorTelefone}
                                </p>
                              </div>

                              {/* Botão de desbloqueio */}
                              {!isInternet && displayInfo.precisaDesbloquear && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDesbloquear(produto);
                                  }}
                                  className="
                                    flex items-center gap-1.5
                                    px-3 py-1.5 rounded-xl
                                    bg-gradient-to-r from-amber-500 to-yellow-500
                                    text-white text-xs font-semibold
                                    hover:from-amber-600 hover:to-yellow-600
                                    hover:shadow-lg hover:shadow-amber-500/25
                                    active:scale-95
                                    transition-all duration-200
                                    flex-shrink-0
                                  "
                                >
                                  <Lock className="w-3 h-3" />
                                  R$ {precoDesbloqueio.toFixed(2)}
                                </button>
                              )}
                              {!isInternet && !displayInfo.precisaDesbloquear && (
                                <span className="
                                  text-xs text-green-600 font-medium
                                  flex items-center gap-1
                                  flex-shrink-0
                                ">
                                  <Eye className="w-3.5 h-3.5" />
                                  Desbloqueado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* ==========================================
          MODAL DE DESBLOQUEIO (GLASSMORPHISM)
          ========================================== */}
      {modalDesbloqueio?.show && (
        <div className="
          fixed inset-0 z-50
          bg-black/60 backdrop-blur-sm
          flex items-center justify-center p-4
          animate-fadeIn
        ">
          <div className="
            bg-white/95 backdrop-blur-xl
            rounded-3xl max-w-md w-full
            border border-white/20
            shadow-[0_24px_64px_rgba(0,0,0,0.15)]
            overflow-hidden
          ">
            {/* Header */}
            <div className="
              bg-gradient-to-r from-gray-50 to-white
              px-6 py-4
              border-b border-gray-100
              flex items-center justify-between
            ">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-gray-800">
                  Desbloquear Contato
                </h2>
              </div>
              <button
                onClick={onFecharModal}
                className="
                  w-8 h-8 rounded-xl
                  bg-gray-100 hover:bg-gray-200
                  flex items-center justify-center
                  transition-colors
                "
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              {/* Produto */}
              <div className="flex gap-4 mb-5">
                <div className="
                  w-20 h-20 rounded-2xl
                  bg-gradient-to-br from-gray-50 to-gray-100
                  overflow-hidden flex-shrink-0
                  border border-gray-100
                ">
                  {modalDesbloqueio.produto.imagem ? (
                    <img
                      src={modalDesbloqueio.produto.imagem}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {modalDesbloqueio.produto.nome}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {modalDesbloqueio.produto.descricao}
                  </p>
                  <p className="font-bold text-green-600 mt-1.5 text-lg">
                    {formatCurrency(modalDesbloqueio.produto.preco)}
                  </p>
                </div>
              </div>

              {/* Benefícios */}
              <div className="
                bg-gradient-to-br from-gray-50 to-gray-100/50
                rounded-2xl p-4 mb-5
                border border-gray-100
              ">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Ao desbloquear, você terá acesso a:
                </p>
                <ul className="space-y-1.5 text-sm">
                  {['Nome do fornecedor', 'Endereço completo', 'Telefone para contato'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-600">
                      <span className="
                        w-5 h-5 rounded-lg
                        bg-green-100 flex items-center justify-center
                        flex-shrink-0
                      ">
                        <Sparkles className="w-3 h-3 text-green-600" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preço */}
              <div className="
                border-t border-gray-100
                pt-4 pb-1
              ">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">
                    Valor do desbloqueio:
                  </span>
                  <span className="text-2xl font-extrabold text-green-600">
                    R$ {precoDesbloqueio.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="px-6 pb-6 space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={onFecharModal}
                  className="
                    flex-1 px-4 py-3 rounded-xl
                    border-2 border-gray-200
                    text-gray-700 font-semibold text-sm
                    hover:bg-gray-50 hover:border-gray-300
                    active:scale-[0.98]
                    transition-all duration-200
                  "
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirmarDesbloqueio}
                  className="
                    flex-1 px-4 py-3 rounded-xl
                    bg-gradient-to-r from-green-600 to-emerald-600
                    text-white font-bold text-sm
                    hover:from-green-700 hover:to-emerald-700
                    hover:shadow-lg hover:shadow-green-600/25
                    active:scale-[0.98]
                    transition-all duration-200
                  "
                >
                  Pagar R$ {precoDesbloqueio.toFixed(2)}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 text-center">
                Pagamento seguro via PIX ou Cartão de Crédito
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
