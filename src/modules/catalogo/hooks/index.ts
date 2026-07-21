// ==================================================
// CATALOGO MODULE - HOOKS
// ==================================================

import { useState, useEffect, useCallback } from "react";
import { CatalogoService } from "../services/CatalogoService";
import type { Produto, Categoria, ProdutoFiltro, ProdutoResponse } from "../types/catalogo";

export function useCatalogo() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [filtro, setFiltro] = useState<ProdutoFiltro>({});

  const carregarProdutos = useCallback(async (pagina: number = page) => {
    try {
      setLoading(true);
      setError(null);
      const response = await CatalogoService.getProdutos(filtro, pagina);
      setProdutos(response.produtos);
      setTotal(response.total);
      setPage(response.pagina);
      setTotalPaginas(response.totalPaginas);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar produtos"));
    } finally {
      setLoading(false);
    }
  }, [filtro, page]);

  const carregarCategorias = useCallback(async () => {
    try {
      const data = await CatalogoService.getCategorias();
      setCategorias(data);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
    }
  }, []);

  const buscarProduto = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      return await CatalogoService.getProdutoById(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao buscar produto"));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const criarProduto = useCallback(async (data: Omit<Produto, "id" | "created_at" | "updated_at">) => {
    try {
      setLoading(true);
      setError(null);
      const result = await CatalogoService.createProduto(data);
      setProdutos(prev => [result, ...prev]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao criar produto"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const atualizarProduto = useCallback(async (id: string, data: Partial<Produto>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await CatalogoService.updateProduto(id, data);
      setProdutos(prev => prev.map(p => p.id === id ? result : p));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao atualizar produto"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removerProduto = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await CatalogoService.deleteProduto(id);
      setProdutos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao remover produto"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const aplicarFiltro = useCallback((novoFiltro: Partial<ProdutoFiltro>) => {
    setFiltro(prev => ({ ...prev, ...novoFiltro }));
    setPage(1);
  }, []);

  const proximaPagina = useCallback(() => {
    if (page < totalPaginas) {
      carregarProdutos(page + 1);
    }
  }, [page, totalPaginas, carregarProdutos]);

  const paginaAnterior = useCallback(() => {
    if (page > 1) {
      carregarProdutos(page - 1);
    }
  }, [page, carregarProdutos]);

  useEffect(() => {
    carregarProdutos();
    carregarCategorias();
  }, []);

  useEffect(() => {
    carregarProdutos(1);
  }, [filtro]);

  return {
    produtos,
    categorias,
    loading,
    error,
    total,
    page,
    totalPaginas,
    filtro,
    carregarProdutos,
    carregarCategorias,
    buscarProduto,
    criarProduto,
    atualizarProduto,
    removerProduto,
    aplicarFiltro,
    proximaPagina,
    paginaAnterior
  };
}
