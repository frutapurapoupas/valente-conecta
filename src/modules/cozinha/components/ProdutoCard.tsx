"use client";

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria?: string;
  imagem?: string;
  disponivel?: boolean;
}

export function ProdutoCard({ produto, onClick }: { produto: Produto; onClick?: (p: Produto) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer">
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {produto.imagem ? (
          <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400">Sem imagem</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-lg">{produto.nome}</h3>
        {produto.categoria && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{produto.categoria}</span>}
        {produto.descricao && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{produto.descricao}</p>}
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600">
            R$ {produto.preco.toFixed(2)}
          </span>
          {onClick && <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">Detalhes</button>}
        </div>
      </div>
    </div>
  );
}
