"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fnlhbegallujiaklryqs.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubGhiZWdhbGx1amlha2xyeXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTMwMDksImV4cCI6MjA4OTY4OTAwOX0.Gv1DRDV8SkQo3EikH1x1lMzSdkDdAX5esEEyYKaTIUo";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  nome: string;
  email: string;
  wallet: number;
  role: "user" | "admin";
  plan?: string;
  convites_count?: number;
}

interface AppContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (nome: string, email: string, password: string) => Promise<boolean>;
  updateWallet: (amount: number) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Garantia de Admin Master no carregamento
  useEffect(() => {
    const storedUser = localStorage.getItem("valente_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const isMaster = parsedUser.id === '92ba677e-7b13-4298-bd37-7175afb211b4';
      setUser({ ...parsedUser, role: isMaster ? "admin" : parsedUser.role });
    }
    setLoading(false);
  }, []);

  // Implementação correta da função Login
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulação de autenticação (substitua pela lógica real se necessário)
      if (email === "admin@valenteconecta.com.br" && password === "admin123") {
        const adminUser: User = { id: "92ba677e-7b13-4298-bd37-7175afb211b4", nome: "Admin Master", email, wallet: 0, role: "admin" };
        setUser(adminUser);
        localStorage.setItem("valente_user", JSON.stringify(adminUser));
        return true;
      }
      // Aqui você pode adicionar supabase.auth.signInWithPassword no futuro
      return false;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => { 
    setUser(null); 
    localStorage.removeItem("valente_user"); 
  };

  const register = async (nome: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const referrer = localStorage.getItem("convite_codigo");
      
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{ 
          nome, 
          email, 
          referrer_id: referrer, 
          plan: 'free' 
        }])
        .select()
        .single();

      if (error) throw error;

      const newUser: User = { 
        id: data.id, 
        nome: data.nome, 
        email: data.email, 
        wallet: 5, 
        role: "user", 
        plan: "free" 
      };

      setUser(newUser);
      localStorage.setItem("valente_user", JSON.stringify(newUser));
      localStorage.removeItem("convite_codigo"); 
      return true;
    } catch (error) { 
      console.error("Erro no registro:", error);
      return false; 
    } finally { setLoading(false); }
  };

  const updateWallet = (amount: number) => {
    if (user) { 
      const updatedUser = { ...user, wallet: user.wallet + amount }; 
      setUser(updatedUser); 
      localStorage.setItem("valente_user", JSON.stringify(updatedUser)); 
    }
  };
  
  const isAdmin = user?.id === '92ba677e-7b13-4298-bd37-7175afb211b4' || user?.role === "admin";

  return (
    <AppContext.Provider value={{ user, isAdmin, login, logout, register, updateWallet, loading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { 
  const context = useContext(AppContext); 
  if (context === undefined) throw new Error("useApp must be used within an AppProvider"); 
  return context; 
}