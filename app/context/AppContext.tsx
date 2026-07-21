"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
}

interface AppContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const AppContext = createContext<AppContextData | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppContextData>({
    user: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    // TODO: Implementar carregamento do usuário
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  return (
    <AppContext.Provider value={state}>
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

// Alias for backward compatibility
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
