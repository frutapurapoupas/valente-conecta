import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useUtilitiesCore(userSession: any) {
  const [distribuidores, setDistribuidores] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [pedidosRota, setPedidosRota] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCatalogEmpty, setIsCatalogEmpty] = useState(false);
  const [showDemandModal, setShowDemandModal] = useState(false);

  // Estados de formulário para o Distribuidor (Visão 2)
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');

  useEffect(() => {
    fetchModuleData();
  }, [userSession]);

  async function fetchModuleData() {
    setLoading(true);
    try {
      // 1. Puxa distribuidores ativos na cidade
      const { data: distData } = await supabase
        .from('utilidades_distribuidores')
        .select('*');

      setDistribuidores(distData || []);

      if (!distData || distData.length === 0) {
        setIsCatalogEmpty(true);
        setShowDemandModal(true);
        setLoading(false);
        return;
      }

      // 2. Puxa produtos vinculados
      const { data: prodData } = await supabase
        .from('utilidades_produtos')
        .select('*, utilidades_distribuidores(nome_comercial, whatsapp_entrega, is_open)');
      setProdutos(prodData || []);

      // 3. Se for entregador ou lojista, puxa os pedidos em rota (Visão 3)
      if (userSession.role === 'LOJISTA' || userSession.role === 'AMBULANTE') {
        const { data: orderData } = await supabase
          .from('utilidades_pedidos')
          .select('*')
          .neq('status', 'ENTREGUE');
        setPedidosRota(orderData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Visão 1: Pedido Rápido com 1 Clique (WhatsApp Deep-link + Banco)
  const handleQuickOrder = async (produto: any, endereco: string) => {
    if (!endereco) return alert('Por favor, cadastre seu endereço no perfil.');
    
    const total = produto.preco_venda * 1;
    const { error } = await supabase.from('utilidades_pedidos').insert({
      cliente_id: userSession.id,
      distribuidor_id: produto.distribuidor_id,
      item_tipo: produto.item_tipo,
      quantidade: 1,
      preco_total: total,
      endereco_entrega: endereco,
      status: 'PENDENTE'
    });

    if (!error) {
      const msg = encodeURIComponent(`*Novo Pedido Valente Conecta*\nItem: ${produto.item_tipo}\nEndereço: ${endereco}\nPor favor, confirme o envio!`);
      window.open(`https://whatsapp.com{produto.utilidades_distribuidores.whatsapp_entrega}&text=${msg}`);
      fetchModuleData();
    }
  };

  // Visão 2 e 3: Atualizador Operacional (Lojista / Funcionário)
  const handleUpdateStatus = async (pedidoId: string, nextStatus: string, entregador?: string) => {
    await supabase
      .from('utilidades_pedidos')
      .update({ status: nextStatus, entregador_nome: entregador })
      .eq('id', pedidoId);
    fetchModuleData();
  };

  const handleUpdateInventory = async (produtoId: string) => {
    if (!newPrice || !newStock) return;
    await supabase
      .from('utilidades_produtos')
      .update({ preco_venda: parseFloat(newPrice), estoque_atual: parseInt(newStock) })
      .eq('id', produtoId);
    setNewPrice('');
    setNewStock('');
    fetchModuleData();
  };

  return {
    produtos,
    distribuidores,
    pedidosRota,
    loading,
    isCatalogEmpty,
    showDemandModal,
    setShowDemandModal,
    handleQuickOrder,
    handleUpdateStatus,
    handleUpdateInventory,
    newPrice,
    setNewPrice,
    newStock,
    setNewStock
  };
}

