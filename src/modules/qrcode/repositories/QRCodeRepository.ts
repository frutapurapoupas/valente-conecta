import { supabase } from "@/lib/supabase/client";
import type { QRCode, QRCodeStats } from "../types/qrcode";

export class QRCodeRepository {
  static async getQRCodes(): Promise<QRCode[]> {
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  static async getQRCodeById(id: string): Promise<QRCode | null> {
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  }

  static async getQRCodeByCodigo(codigo: string): Promise<QRCode | null> {
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("codigo", codigo)
      .single();
    if (error) return null;
    return data;
  }

  static async createQRCode(data: Omit<QRCode, "id" | "created_at" | "updated_at" | "visualizacoes">): Promise<QRCode> {
    const { data: result, error } = await supabase
      .from("qr_codes")
      .insert({ ...data, visualizacoes: 0 })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  }

  static async incrementVisualizacao(id: string): Promise<void> {
    const { error } = await supabase
      .from("qr_codes")
      .update({ visualizacoes: supabase.rpc("increment", { column: "visualizacoes", amount: 1 }) })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  static async deleteQRCode(id: string): Promise<void> {
    const { error } = await supabase.from("qr_codes").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  static async getStats(): Promise<QRCodeStats> {
    const { data, error } = await supabase.from("qr_codes").select("*");
    if (error) throw new Error(error.message);
    return {
      total: data.length,
      ativos: data.filter(q => q.ativo).length,
      visualizacoesTotal: data.reduce((sum, q) => sum + (q.visualizacoes || 0), 0)
    };
  }
}
