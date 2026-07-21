// hooks/cozinha/useDashboard.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardData {
  stats: {
    totalVendas: number;
    totalCompras: number;
    totalEstoque: number;
    totalPedidos: number;
    lucro: number;
    margem: number;
  };
  pratosDoDia: any[];
  alertas: any[];
  movimentacoes: any[];
  ultimosPedidos: any[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalVendas: 0,
      totalCompras: 0,
      totalEstoque: 0,
      totalPedidos: 0,
      lucro: 0,
      margem: 0,
    },
    pratosDoDia: [],
    alertas: [],
    movimentacoes: [],
    ultimosPedidos: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Buscar estatÃ­sticas
        const [vendasRes, comprasRes, estoqueRes, pedidosRes, financeiroRes] = await Promise.all([
          supabase.from('vendas').select('*'),
          supabase.from('compras').select('*'),
          supabase.from('estoque').select('*'),
          supabase.from('pedidos').select('*'),
          supabase.from('financeiro').select('*'),
        ]);

        // Calcular estatÃ­sticas
        const totalVendas = vendasRes.data?.reduce((acc, v) => acc + (v.valor || 0), 0) || 0;
        const totalCompras = comprasRes.data?.reduce((acc, c) => acc + (c.valor || 0), 0) || 0;
        const totalEstoque = estoqueRes.data?.length || 0;
        const totalPedidos = pedidosRes.data?.length || 0;
        
        // Calcular lucro
        const receitas = financeiroRes.data?.filter(f => f.tipo === 'receita') || [];
        const despesas = financeiroRes.data?.filter(f => f.tipo === 'despesa') || [];
        const totalReceitas = receitas.reduce((acc, r) => acc + (r.valor || 0), 0);
        const totalDespesas = despesas.reduce((acc, d) => acc + (d.valor || 0), 0);
        const lucro = totalReceitas - totalDespesas;
        const margem = totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0;

        // Buscar pratos do dia
        const pratosRes = await supabase
          .from('pratos')
          .select('*')
          .eq('dia_semana', new Date().getDay())
          .limit(6);

        // Buscar alertas
        const alertasRes = await supabase
          .from('alertas')
          .select('*')
          .eq('ativo', true)
          .limit(5);

        // Buscar movimentaÃ§Ãµes recentes
        const movRes = await supabase
          .from('movimentacoes')
          .select('*')
          .order('data', { ascending: false })
          .limit(5);

        // Buscar Ãºltimos pedidos
        const ultimosPedidosRes = await supabase
          .from('pedidos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setData({
          stats: {
            totalVendas,
            totalCompras,
            totalEstoque,
            totalPedidos,
            lucro,
            margem,
          },
          pratosDoDia: pratosRes.data || [],
          alertas: alertasRes.data || [],
          movimentacoes: movRes.data || [],
          ultimosPedidos: ultimosPedidosRes.data || [],
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return { data, loading, error };
}

