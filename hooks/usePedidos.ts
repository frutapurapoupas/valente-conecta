import { useState, useEffect } from 'react';

export const usePedidos = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const carregarPedidos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cozinha/orders');
      const data = await response.json();
      if (data.success) setOrders(data.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (orderId: string, novoStatus: string) => {
    try {
      await fetch(`/api/cozinha/orders?id=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
      await carregarPedidos();
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  useEffect(() => {
    carregarPedidos();
    const interval = setInterval(carregarPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  return { orders, loading, filter, setFilter, carregarPedidos, atualizarStatus };
};