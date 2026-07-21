"use client";

// ==================================================
// MÓDULO COZINHA - COMPONENTE PRODUTO CARD
// ==================================================

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria?: string;
  imagem?: string;
  disponivel?: boolean;
}

interface ProdutoCardProps {
  produto: Produto;
  onClick?: (produto: Produto) => void;
}

export function ProdutoCard({ produto, onClick }: ProdutoCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(produto);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 
        overflow-hidden cursor-pointer border border-gray-100
        ${onClick ? 'hover:scale-[1.02]' : 'cursor-default'}
      `}
    >
      {/* Imagem */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {produto.imagem ? (
          <img
            src={produto.imagem}
            alt={produto.nome}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-product.png';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        
        {/* Status */}
        {produto.disponivel !== undefined && (
          <div className="absolute top-2 right-2">
            <span
              className={`
                text-xs font-medium px-2 py-1 rounded-full
                ${produto.disponivel
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                }
              `}
            >
              {produto.disponivel ? 'Disponível' : 'Indisponível'}
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">
          {produto.nome}
        </h3>
        
        {produto.categoria && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
            {produto.categoria}
          </span>
        )}
        
        {produto.descricao && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {produto.descricao}
          </p>
        )}
        
        <div className="mt-3 flex justify-between items-center border-t border-gray-100 pt-3">
          <span className="text-lg font-bold text-blue-600">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(produto.preco)}
          </span>
          
          {onClick && (
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Ver detalhes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}