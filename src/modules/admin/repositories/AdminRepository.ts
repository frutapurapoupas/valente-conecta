// ==================================================
// ADMIN MODULE - REPOSITORY
// ==================================================

import { supabase } from "@/lib/supabase/client";
import type { Beneficio, DashboardData, ServicoPago, SyncStatus, Usuario } from "../types/admin";

export class AdminRepository {
  // Benefícios
  static async getBeneficios(): Promise<Beneficio[]> {
    const { data, error } = await supabase
      .from("beneficios")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  static async createBeneficio(data: Partial<Beneficio>): Promise<Beneficio> {
    const { data: result, error } = await supabase
      .from("beneficios")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  }

  static async updateBeneficio(id: string, data: Partial<Beneficio>): Promise<Beneficio> {
    const { data: result, error } = await supabase
      .from("beneficios")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  }

  static async deleteBeneficio(id: string): Promise<void> {
    const { error } = await supabase
      .from("beneficios")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  // Dashboard
  static async getDashboardData(): Promise<DashboardData> {
    const [usuarios, beneficios, servicos, sync] = await Promise.all([
      supabase.from("usuarios").select("count", { count: "exact", head: true }),
      supabase.from("beneficios").select("count", { count: "exact", head: true }),
      supabase.from("servicos_pagos").select("count", { count: "exact", head: true }),
      supabase.from("sync_status").select("*").order("created_at", { ascending: false }).limit(1)
    ]);

    return {
      totalUsuarios: usuarios.count || 0,
      totalBeneficios: beneficios.count || 0,
      totalServicosPagos: servicos.count || 0,
      ultimoSync: sync.data?.[0] || null
    };
  }

  // Serviços Pagos
  static async getServicosPagos(): Promise<ServicoPago[]> {
    const { data, error } = await supabase
      .from("servicos_pagos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  static async createServicoPago(data: Partial<ServicoPago>): Promise<ServicoPago> {
    const { data: result, error } = await supabase
      .from("servicos_pagos")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  }

  // Sync
  static async getSyncStatus(): Promise<SyncStatus> {
    const { data, error } = await supabase
      .from("sync_status")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw new Error(error.message);
    return data?.[0] || { status: "idle", lastSync: null };
  }

  static async runSync(): Promise<SyncStatus> {
    const { data, error } = await supabase
      .rpc("run_sync");

    if (error) throw new Error(error.message);
    return { status: "completed", lastSync: new Date().toISOString() };
  }

  // Usuários
  static async getUsuarios(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  static async createUsuario(data: Partial<Usuario>): Promise<Usuario> {
    const { data: result, error } = await supabase
      .from("usuarios")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  }

  static async updateUsuario(id: string, data: Partial<Usuario>): Promise<Usuario> {
    const { data: result, error } = await supabase
      .from("usuarios")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  }

  static async deleteUsuario(id: string): Promise<void> {
    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
  }
}
