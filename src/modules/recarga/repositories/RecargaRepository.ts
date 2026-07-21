import { supabase } from "@/lib/supabase/client";
import type { Recarga, RecargaFiltro, RecargaStats } from "../types/recarga";

export class RecargaRepository {
  static async getRecargas(filtro?: RecargaFiltro): Promise<Recarga[]> {
    let query = supabase.from("recargas").select("*").order("created_at", { ascending: false });
    if (filtro?.status) query = query.eq("status", filtro.status);
    if (filtro?.metodo) query = query.eq("metodo", filtro.metodo);
    if (filtro?.dataInicio) query = query.gte("created_at", filtro.dataInicio);
    if (filtro?.dataFim) query = query.lte("created_at", filtro.dataFim);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  static async getRecargasByUser(userId: string): Promise<Recarga[]> {
    const { data, error } = await supabase
      .from("recargas")
      .select("*")
      .eq("usuario_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  static async createRecarga(data: Omit<Recarga, "id" | "created_at" | "updated_at">): Promise<Recarga> {
    const { data: result, error } = await supabase
      .from("recargas")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  }

  static async updateStatus(id: string, status: string, transacao_id?: string): Promise<Recarga> {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (transacao_id) updateData.transacao_id = transacao_id;
    if (status === "confirmado") updateData.data_confirmacao = new Date().toISOString();
    const { data: result, error } = await supabase
      .from("recargas")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  }

  static async getStats(userId: string): Promise<RecargaStats> {
    const { data, error } = await supabase
      .from("recargas")
      .select("status, valor")
      .eq("usuario_id", userId);
    if (error) throw new Error(error.message);
    return {
      total: data.length,
      totalValor: data.reduce((sum, r) => sum + (r.valor || 0), 0),
      pendentes: data.filter(r => r.status === "pendente").length,
      confirmados: data.filter(r => r.status === "confirmado").length,
      cancelados: data.filter(r => r.status === "cancelado").length
    };
  }
}
