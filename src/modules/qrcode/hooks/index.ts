import { useState, useEffect, useCallback } from "react";
import { QRCodeService } from "../services/QRCodeService";
import type { QRCode, QRCodeStats } from "../types/qrcode";

export function useQRCode() {
  const [qrcodes, setQRCodes] = useState<QRCode[]>([]);
  const [stats, setStats] = useState<QRCodeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, statsData] = await Promise.all([
        QRCodeService.listar(),
        QRCodeService.obterStats()
      ]);
      setQRCodes(data);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar"));
    } finally {
      setLoading(false);
    }
  }, []);

  const criar = useCallback(async (data: Omit<QRCode, "id" | "created_at" | "updated_at" | "visualizacoes">) => {
    try {
      setLoading(true);
      setError(null);
      const result = await QRCodeService.criar(data);
      setQRCodes(prev => [result, ...prev]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao criar"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarVisualizacao = useCallback(async (id: string) => {
    try {
      await QRCodeService.registrarVisualizacao(id);
      setQRCodes(prev => prev.map(q => 
        q.id === id ? { ...q, visualizacoes: (q.visualizacoes || 0) + 1 } : q
      ));
    } catch (err) {
      console.error("Erro ao registrar visualização:", err);
    }
  }, []);

  const remover = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await QRCodeService.remover(id);
      setQRCodes(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao remover"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, []);

  return { qrcodes, stats, loading, error, carregar, criar, registrarVisualizacao, remover };
}
