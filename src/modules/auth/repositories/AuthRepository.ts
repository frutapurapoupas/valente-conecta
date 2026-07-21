// ==================================================
// AUTH MODULE - REPOSITORY
// ==================================================

import { supabase } from "@/lib/supabase/client";
import type { User, RegisterData, LoginData, AuthResponse, RegisterResponse } from "../types/auth";

export class AuthRepository {
  static async register(data: RegisterData): Promise<RegisterResponse> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nome: data.nome,
          telefone: data.telefone || "",
        },
      },
    });

    if (authError) throw new Error(authError.message);

    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .insert({
        id: authData.user?.id,
        email: data.email,
        nome: data.nome,
        telefone: data.telefone || "",
        role: "user",
        status: "pendente",
      })
      .select()
      .single();

    if (userError) throw new Error(userError.message);

    return {
      user: userData,
      message: "Usuário criado com sucesso! Verifique seu email."
    };
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);

    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (userError) throw new Error(userError.message);

    return {
      user: userData,
      session: {
        access_token: authData.session?.access_token || "",
        refresh_token: authData.session?.refresh_token || "",
        expires_at: authData.session?.expires_at || 0,
      }
    };
  }

  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError) return null;
    return userData;
  }

  static async checkEmailExists(email: string): Promise<boolean> {
    const { count, error } = await supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true })
      .eq("email", email);

    if (error) throw new Error(error.message);
    return (count || 0) > 0;
  }
}
