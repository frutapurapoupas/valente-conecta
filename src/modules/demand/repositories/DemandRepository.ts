// ==================================================
// DEMAND MODULE - REPOSITORY
// ==================================================

import { supabase } from "@/lib/supabase/client";
import type { Demand } from "../types/demand";

export class DemandRepository {
  static async create(data: Partial<Demand>): Promise<Demand> {
    const { data: result, error } = await supabase
      .from("demands")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  }

  static async findAll(): Promise<Demand[]> {
    const { data, error } = await supabase
      .from("demands")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  static async findById(id: string): Promise<Demand | null> {
    const { data, error } = await supabase
      .from("demands")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async update(id: string, data: Partial<Demand>): Promise<Demand> {
    const { data: result, error } = await supabase
      .from("demands")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("demands")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
  }
}
