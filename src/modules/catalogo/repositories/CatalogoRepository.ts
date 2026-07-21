// ==================================================
// CATALOGO MODULE - REPOSITORY
// ==================================================

import { supabase } from "@/lib/supabase/client";
import type { Produto, Categoria, ProdutoFiltro, ProdutoResponse } from "../types/catalogo";

export class CatalogoRepository {
  static async getProdutos(filtro?: ProdutoFiltro, page: number = 1, limit: number = 20): Promise<ProdutoResponse> {
    let query = supabase
      .from("produtos")
      .select(`
        *,
        categoria:categorias(*)
      `, { count: "exact" });

    // Aplicar filtros
    if (filtro?.categoria) {
      query = query.eq("categoria_id", filtro.categoria);
    }

    if (filtro?.busca) {
      query = query.ilike("nome", `%${filtro.busca}%`);
    }

    if (filtro?.disponivel !== undefined) {
      query = query.eq("disponivel", filtro.disponivel);
    }

    if (filtro?.destaque) {
      query = query.eq("destaque", true);
    }

    if (filtro?.precoMin) {
      query = query.gte("preco", filtro.precoMin);
    }

    if (filtro?.precoMax) {
      query = query.lte("preco", filtro.precoMax);
    }

    // Paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      produtos: data || [],
      total: count || 0,
      pagina: page,
      totalPaginas: Math.ceil((count || 0) / limit)
    };
  }

  static async getProdutoById(id: string): Promise<Produto | null> {
    const { data, error } = await supabase
      .from("produtos")
      .select(`
        *,
        categoria:categorias(*)
      `)
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  }

  static async getCategorias(): Promise<Categoria[]> {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("ordem", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  static async createProduto(data: Omit<Produto, "id" | "created_at" | "updated_at">): Promise<Produto> {
    const { data: result, error } = await supabase
      .from("produtos")
      .insert(data)
      .select(`
        *,
        categoria:categorias(*)
      `)
      .single();

    if (error) throw new Error(error.message);
    return result;
  }

  static async updateProduto(id: string, data: Partial<Produto>): Promise<Produto> {
    const { data: result, error } = await supabase
      .from("produtos")
      .update(data)
      .eq("id", id)
      .select(`
        *,
        categoria:categorias(*)
      `)
      .single();

    if (error) throw new Error(error.message);
    return result;
  }

  static async deleteProduto(id: string): Promise<void> {
    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
  }
}
