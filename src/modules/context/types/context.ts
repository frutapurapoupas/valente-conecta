// ==================================================
// CONTEXT MODULE - TYPES
// ==================================================

export interface AppContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  theme: "light" | "dark";
  notifications: Notification[];
  settings: AppSettings;
}

export interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export interface AppSettings {
  language: string;
  notificationsEnabled: boolean;
  theme: "light" | "dark";
}

export interface ContextState {
  data: AppContextData;
  setUser: (user: User | null) => void;
  setTheme: (theme: "light" | "dark") => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}
