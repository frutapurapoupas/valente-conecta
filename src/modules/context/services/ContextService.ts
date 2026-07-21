// ==================================================
// CONTEXT MODULE - SERVICE
// ==================================================

import { ContextRepository } from "../repositories/ContextRepository";
import type { User, AppSettings, Notification, AppContextData } from "../types/context";

export class ContextService {
  static async getInitialState(): Promise<Partial<AppContextData>> {
    const user = await ContextRepository.getCurrentUser();
    let settings = null;
    let notifications = [];

    if (user) {
      settings = await ContextRepository.getSettings(user.id);
      notifications = await ContextRepository.getNotifications(user.id);
    }

    return {
      user,
      isAuthenticated: !!user,
      loading: false,
      theme: settings?.theme || "light",
      notifications: notifications || [],
      settings: settings || { language: "pt-BR", notificationsEnabled: true, theme: "light" }
    };
  }

  static async updateUser(user: User | null): Promise<User | null> {
    return user;
  }

  static async updateTheme(userId: string, theme: "light" | "dark"): Promise<void> {
    await ContextRepository.updateSettings(userId, { theme });
  }

  static async addNotification(userId: string, data: Omit<Notification, "id" | "createdAt" | "read">): Promise<Notification> {
    return ContextRepository.createNotification(userId, data);
  }

  static async markNotificationRead(id: string): Promise<void> {
    await ContextRepository.markNotificationRead(id);
  }

  static async clearNotifications(userId: string): Promise<void> {
    await ContextRepository.clearNotifications(userId);
  }

  static async updateSettings(userId: string, settings: Partial<AppSettings>): Promise<void> {
    await ContextRepository.updateSettings(userId, settings);
  }
}
