// ==================================================
// CONTEXT MODULE - USE APP CONTEXT HOOK
// ==================================================

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ContextService } from "../services/ContextService";
import type { AppContextData, User, Notification, AppSettings, ContextState } from "../types/context";

// Estado inicial
const initialState: AppContextData = {
  user: null,
  isAuthenticated: false,
  loading: true,
  theme: "light",
  notifications: [],
  settings: { language: "pt-BR", notificationsEnabled: true, theme: "light" }
};

// Criar Context
const AppContext = createContext<ContextState | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppContextData>(initialState);

  // Carregar estado inicial
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const data = await ContextService.getInitialState();
        setState(prev => ({ ...prev, ...data, loading: false }));
      } catch (error) {
        console.error("Erro ao carregar contexto:", error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };
    loadInitialState();
  }, []);

  // Actions
  const setUser = useCallback((user: User | null) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user
    }));
  }, []);

  const setTheme = useCallback(async (theme: "light" | "dark") => {
    setState(prev => ({ ...prev, theme }));
    if (state.user?.id) {
      try {
        await ContextService.updateTheme(state.user.id, theme);
      } catch (error) {
        console.error("Erro ao atualizar tema:", error);
      }
    }
  }, [state.user]);

  const addNotification = useCallback(async (data: Omit<Notification, "id" | "createdAt" | "read">) => {
    if (!state.user?.id) return;
    try {
      const notification = await ContextService.addNotification(state.user.id, data);
      setState(prev => ({
        ...prev,
        notifications: [notification, ...prev.notifications]
      }));
    } catch (error) {
      console.error("Erro ao adicionar notificação:", error);
    }
  }, [state.user]);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await ContextService.markNotificationRead(id);
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      }));
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  }, []);

  const clearNotifications = useCallback(async () => {
    if (!state.user?.id) return;
    try {
      await ContextService.clearNotifications(state.user.id);
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => !n.read)
      }));
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
    }
  }, [state.user]);

  const updateSettings = useCallback(async (settings: Partial<AppSettings>) => {
    if (!state.user?.id) return;
    try {
      await ContextService.updateSettings(state.user.id, settings);
      setState(prev => ({
        ...prev,
        settings: { ...prev.settings, ...settings }
      }));
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
    }
  }, [state.user]);

  const value: ContextState = {
    data: state,
    setUser,
    setTheme,
    addNotification,
    markNotificationRead,
    clearNotifications,
    updateSettings
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook para consumir o contexto
export function useAppContext(): ContextState {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

// Hooks específicos para facilitar o uso
export function useUser() {
  const { data } = useAppContext();
  return data.user;
}

export function useAuth() {
  const { data } = useAppContext();
  return {
    user: data.user,
    isAuthenticated: data.isAuthenticated,
    loading: data.loading
  };
}

export function useTheme() {
  const { data, setTheme } = useAppContext();
  return {
    theme: data.theme,
    setTheme
  };
}

export function useNotifications() {
  const { data, addNotification, markNotificationRead, clearNotifications } = useAppContext();
  return {
    notifications: data.notifications,
    addNotification,
    markNotificationRead,
    clearNotifications
  };
}

export function useSettings() {
  const { data, updateSettings } = useAppContext();
  return {
    settings: data.settings,
    updateSettings
  };
}
