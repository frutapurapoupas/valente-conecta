"use client";

import { useCatalogo } from "@/modules/catalogo";
import { useState } from "react";

export default function CatalogoPage() {
  const {
    produtos,
    categorias,
    loading,
    error,
    total,
    page,
    totalPaginas,
    aplicarFiltro,
    proximaPagina,
    paginaAnterior
  } = useCatalogo();

  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("");

  const handleBusca = () => {
    aplicarFiltro({ busca: busca || undefined });
  };

  const handleCategoria = (categoriaId: string) => {
    setCategoriaSelecionada(categoriaId);
    aplicarFiltro({ categoria: categoriaId || undefined });
  };

  if (loading && produtos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-600 font-medium">Erro ao carregar catálogo</p>
          <p className="text-red-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Catálogo de Produtos</h1>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBusca()}
              placeholder="Buscar produtos..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleBusca}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Buscar
          </button>
          <button
            onClick={() => {
              setBusca("");
              setCategoriaSelecionada("");
              aplicarFiltro({});
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Limpar
          </button>
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => handleCategoria("")}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              categoriaSelecionada === ""
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoria(cat.id)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                categoriaSelecionada === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Produtos */}
      {produtos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          <p className="text-gray-400 text-sm">Tente ajustar os filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative">
                {produto.imagem ? (
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.png";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Sem imagem
                  </div>
                )}
                {produto.destaque && (
                  <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    Destaque
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1">{produto.nome}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {produto.descricao || "Sem descrição"}
                </p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  }).format(produto.preco)}
                </p>
                {produto.categoria && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-2 inline-block">
                    {produto.categoria.nome}
                  </span>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    onClick={() => window.location.href = `/catalogo/produto/${produto.id}`}
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-gray-600">
            Mostrando {produtos.length} de {total} produtos
          </span>
          <div className="flex gap-2">
            <button
              onClick={paginaAnterior}
              disabled={page <= 1}
              className={`px-4 py-2 rounded-lg transition-colors ${
                page <= 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {page} / {totalPaginas}
            </span>
            <button
              onClick={proximaPagina}
              disabled={page >= totalPaginas}
              className={`px-4 py-2 rounded-lg transition-colors ${
                page >= totalPaginas
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
