"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  wallet: number;
  role: "user" | "admin";
  plan?: string;
}

interface AppContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  updateWallet: (amount: number) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("valente_user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (email === "admin@valenteconecta.com.br" && password === "admin123") {
        const adminUser: User = { id: "admin-1", name: "Admin Master", email, wallet: 0, role: "admin" };
        setUser(adminUser);
        localStorage.setItem("valente_user", JSON.stringify(adminUser));
        return true;
      }
      const demoUser: User = { id: "user-1", name: "Usuário Demo", email, wallet: 10, role: "user", plan: "free" };
      setUser(demoUser);
      localStorage.setItem("valente_user", JSON.stringify(demoUser));
      return true;
    } catch (error) { return false; } finally { setLoading(false); }
  };

  const logout = () => { setUser(null); localStorage.removeItem("valente_user"); };
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const newUser: User = { id: `user-${Date.now()}`, name, email, wallet: 5, role: "user", plan: "free" };
      setUser(newUser);
      localStorage.setItem("valente_user", JSON.stringify(newUser));
      return true;
    } catch (error) { return false; } finally { setLoading(false); }
  };
  const updateWallet = (amount: number) => {
    if (user) { const updatedUser = { ...user, wallet: user.wallet + amount }; setUser(updatedUser); localStorage.setItem("valente_user", JSON.stringify(updatedUser)); }
  };
  const isAdmin = user?.role === "admin";

  return <AppContext.Provider value={{ user, isAdmin, login, logout, register, updateWallet, loading }}>{children}</AppContext.Provider>;
}

export function useApp() { const context = useContext(AppContext); if (context === undefined) throw new Error("useApp must be used within an AppProvider"); return context; }
