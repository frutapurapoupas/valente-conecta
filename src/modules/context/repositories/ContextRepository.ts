// ==================================================
// CONTEXT MODULE - REPOSITORY
// ==================================================

import { supabase } from "@/lib/supabase/client";
import type { User, AppSettings, Notification } from "../types/context";

export class ContextRepository {
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("id, email, nome, role, avatar_url")
      .eq("id", user.id)
      .single();

    if (userError) return null;
    return {
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      role: userData.role,
      avatar: userData.avatar_url
    };
  }

  static async getSettings(userId: string): Promise<AppSettings | null> {
    const { data, error } = await supabase
      .from("configuracoes_usuario")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return {
      language: data.language || "pt-BR",
      notificationsEnabled: data.notifications_enabled !== false,
      theme: data.theme || "light"
    };
  }

  static async updateSettings(userId: string, settings: Partial<AppSettings>): Promise<void> {
    const { error } = await supabase
      .from("configuracoes_usuario")
      .upsert({
        user_id: userId,
        language: settings.language,
        notifications_enabled: settings.notificationsEnabled,
        theme: settings.theme,
        updated_at: new Date().toISOString()
      });

    if (error) throw new Error(error.message);
  }

  static async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return data.map(n => ({
      id: n.id,
      message: n.message,
      type: n.type,
      read: n.read || false,
      createdAt: n.created_at
    }));
  }

  static async createNotification(userId: string, data: Omit<Notification, "id" | "createdAt" | "read">): Promise<Notification> {
    const { data: result, error } = await supabase
      .from("notificacoes")
      .insert({
        user_id: userId,
        message: data.message,
        type: data.type
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: result.id,
      message: result.message,
      type: result.type,
      read: result.read || false,
      createdAt: result.created_at
    };
  }

  static async markNotificationRead(id: string): Promise<void> {
    const { error } = await supabase
      .from("notificacoes")
      .update({ read: true })
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  static async clearNotifications(userId: string): Promise<void> {
    const { error } = await supabase
      .from("notificacoes")
      .delete()
      .eq("user_id", userId)
      .eq("read", true);

    if (error) throw new Error(error.message);
  }
}
