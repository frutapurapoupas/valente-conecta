$arquivo = "C:\valente_conecta\app\context\AppContext.tsx"

$novoConteudo = @'
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
  telefone?: string;
  whatsapp?: string;
}

interface AppContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextData | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    user: null as User | null,
    isAuthenticated: false,
    loading: true,
    isAdmin: false
  });

  useEffect(() => {
    setState(prev => ({ ...prev, loading: false, isAdmin: prev.user?.role === "admin" }));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.warn("login() ainda nao implementado - autenticacao real pendente");
    return false;
  };

  return (
    <AppContext.Provider value={{ ...state, login }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export function useApp() {
  return useAppContext();
}

export function useUser() {
  const { user } = useAppContext();
  return user;
}

export function useAuth() {
  const { user, isAuthenticated, loading } = useAppContext();
  return { user, isAuthenticated, loading };
}

export function useTheme() {
  return { theme: "light", setTheme: () => {} };
}

export function useNotifications() {
  return { notifications: [], addNotification: () => {}, markNotificationRead: () => {}, clearNotifications: () => {} };
}

export function useSettings() {
  return { settings: { language: "pt-BR", notificationsEnabled: true, theme: "light" }, updateSettings: () => {} };
}
'@

[System.IO.File]::WriteAllText($arquivo, $novoConteudo, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Arquivo atualizado com sucesso."