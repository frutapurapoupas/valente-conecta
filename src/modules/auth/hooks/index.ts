// ==================================================
// AUTH MODULE - HOOKS
// ==================================================

import { useState, useCallback } from "react";
import { AuthService } from "../services/AuthService";
import type { RegisterData, User } from "../types/auth";

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [success, setSuccess] = useState(false);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const result = await AuthService.register(data);
      setUser(result.user);
      setSuccess(true);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro ao cadastrar");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setUser(null);
  }, []);

  return { register, loading, error, user, success, reset };
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.login({ email, password });
      setUser(result.user);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro ao logar");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro ao sair");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const result = await AuthService.getCurrentUser();
      setUser(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro ao buscar usuário");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading, error, login, logout, getCurrentUser };
}
