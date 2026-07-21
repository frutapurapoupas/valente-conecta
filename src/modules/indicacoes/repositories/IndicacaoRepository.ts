import { supabase } from "@/lib/supabase/client";
import type { Indicacao, IndicacaoFiltro, IndicacaoStats } from "../types/indicacao";

export class IndicacaoRepository {
  static async getIndicacoes(filtro?: IndicacaoFiltro): Promise<Indicacao[]> {
    let query = supabase.from("indicacoes").select("*").order("created_at", { ascending: false });
    if (filtro?.status) query = query.eq("status", filtro.status);
    if (filtro?.busca) {
      query = query.or(`nome_indicante.ilike.%${filtro.busca}%,nome_indicado.ilike.%${filtro.busca}%`);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  static async createIndicacao(data: Omit<Indicacao, "id" | "created_at" | "updated_at">): Promise<Indicacao> {
    const { data: result, error } = await supabase
      .from("indicacoes").insert(data).select().single();
    if (error) throw new Error(error.message);
    return result;
  }

  static async updateStatus(id: string, status: string): Promise<Indicacao> {
    const { data: result, error } = await supabase
      .from("indicacoes").update({ status, updated_at: new Date().toISOString() })
      .eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return result;
  }

  static async getStats(userId: string): Promise<IndicacaoStats> {
    const { data, error } = await supabase
      .from("indicacoes").select("status, bonus").eq("user_id", userId);
    if (error) throw new Error(error.message);
    return {
      total: data.length,
      pendentes: data.filter(i => i.status === "pendente").length,
      aceitos: data.filter(i => i.status === "aceito").length,
      concluidos: data.filter(i => i.status === "concluido").length,
      bonusTotal: data.reduce((sum, i) => sum + (i.bonus || 0), 0)
    };
  }
}
