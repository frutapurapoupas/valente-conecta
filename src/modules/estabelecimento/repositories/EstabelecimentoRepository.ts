import { supabase } from "@/lib/supabase/client";
import type { Estabelecimento, EstabelecimentoFiltro, EstabelecimentoStats } from "../types/estabelecimento";

export class EstabelecimentoRepository {
  static async getEstabelecimentos(filtro?: EstabelecimentoFiltro): Promise<Estabelecimento[]> {
    let query = supabase.from("estabelecimentos").select("*").order("created_at", { ascending: false });
    if (filtro?.cidade) query = query.eq("cidade", filtro.cidade);
    if (filtro?.categoria) query = query.eq("categoria", filtro.categoria);
    if (filtro?.status) query = query.eq("status", filtro.status);
    if (filtro?.busca) {
      query = query.or(`nome.ilike.%${filtro.busca}%,descricao.ilike.%${filtro.busca}%`);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  static async getEstabelecimentoById(id: string): Promise<Estabelecimento | null> {
    const { data, error } = await supabase
      .from("estabelecimentos")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  }

  static async createEstabelecimento(data: Omit<Estabelecimento, "id" | "created_at" | "updated_at">): Promise<Estabelecimento> {
    const { data: result, error } = await supabase
      .from("estabelecimentos")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  }

  static async updateStatus(id: string, status: string): Promise<Estabelecimento> {
    const { data: result, error } = await supabase
      .from("estabelecimentos")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  }

  static async getStats(): Promise<EstabelecimentoStats> {
    const { data, error } = await supabase.from("estabelecimentos").select("status, categoria");
    if (error) throw new Error(error.message);
    const porCategoria: Record<string, number> = {};
    data.forEach((e: any) => {
      porCategoria[e.categoria] = (porCategoria[e.categoria] || 0) + 1;
    });
    return {
      total: data.length,
      pendentes: data.filter(e => e.status === "pendente").length,
      aprovados: data.filter(e => e.status === "aprovado").length,
      rejeitados: data.filter(e => e.status === "rejeitado").length,
      porCategoria
    };
  }
}
