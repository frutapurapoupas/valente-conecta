// hooks/cozinha/usePedidos.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { cozinhaService } from '@/services/cozinhaService';
import { Order } from '@/types/cozinha';
import { toast } from 'react-hot-toast';

export const usePedidos = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const carregarPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cozinhaService.getOrders();
      setOrders(data.success ? data.data : []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  const atualizarStatus = useCallback(async (orderId: string, novoStatus: string) => {
    try {
      await cozinhaService.updateOrderStatus(orderId, novoStatus);
      toast.success('Status atualizado!');
      await carregarPedidos();
      
      // Som de notificação
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  }, [carregarPedidos]);

  useEffect(() => {
    carregarPedidos();
    
    // Auto-atualização a cada 30 segundos
    intervalRef.current = setInterval(carregarPedidos, 30000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [carregarPedidos]);

  return { orders, loading, carregarPedidos, atualizarStatus };
};