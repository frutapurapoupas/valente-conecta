// hooks/cozinha/useCatalogo.ts (CORRIGIDO)
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { cozinhaService } from '@/services/cozinhaService';
import { cardapioFallback, DIAS_SEMANA, PRATOS_POR_DIA } from '@/constants/cozinhaConstants';

export interface ItemCardapio {
  id: string | number;
  dia: string;
  titulo: string;
  descricao: string;
  preco: number;
  precoOriginal?: number;
  imagem: string;
  categoria?: string;
  images?: string[];
}

export const useCatalogo = () => {
  const searchParams = useSearchParams();
  // 🔥 CORREÇÃO: Verificar se searchParams é null
  const perfil = searchParams?.get('perfil') || 'publico';
  
  const [pratos, setPratos] = useState<ItemCardapio[]>([]);
  const [sobremesas, setSobremesas] = useState<ItemCardapio[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [desconto, setDesconto] = useState(0);

  const carregarCardapio = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cozinhaService.getPratos();
      
      let descontoAtual = 0;
      if (perfil === 'assinante') descontoAtual = 15;
      else if (perfil === 'revendedor') descontoAtual = 19;
      setDesconto(descontoAtual);

      if (response.success && response.data && response.data.length > 0) {
        const ativos = response.data.filter((p: any) => p.ativo !== false);
        
        const pratosPrincipais: ItemCardapio[] = [];
        const sobremesasLista: ItemCardapio[] = [];

        DIAS_SEMANA.forEach((dia) => {
          const pratosDoDia = ativos.filter((p: any) => p.dia_semana === dia);
          const selecionados = pratosDoDia.slice(0, PRATOS_POR_DIA);
          
          selecionados.forEach((prato: any) => {
            const precoOriginal = prato.preco || 0;
            const precoComDesconto = precoOriginal * (1 - descontoAtual / 100);
            
            const item = {
              id: prato.id,
              dia: dia.toUpperCase(),
              titulo: prato.nome || 'Prato do Dia',
              descricao: prato.descricao || 'Deliciosa opção do dia',
              preco: parseFloat(precoComDesconto.toFixed(2)),
              precoOriginal: descontoAtual > 0 ? precoOriginal : undefined,
              imagem: prato.imagem_url || '',
              categoria: prato.categoria || 'prato',
              images: prato.images || []
            };

            if (prato.categoria === 'Sobremesa' || prato.categoria === 'sobremesa') {
              sobremesasLista.push(item);
            } else {
              pratosPrincipais.push(item);
            }
          });
        });

        setPratos(pratosPrincipais.length > 0 ? pratosPrincipais : cardapioFallback);
        setSobremesas(sobremesasLista);
      } else {
        const fallbackComDesconto = cardapioFallback.map(item => ({
          ...item,
          preco: descontoAtual > 0 ? parseFloat((item.preco * (1 - descontoAtual / 100)).toFixed(2)) : item.preco,
          precoOriginal: descontoAtual > 0 ? item.preco : undefined,
          categoria: 'prato'
        }));
        setPratos(fallbackComDesconto);
        setSobremesas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error);
      setPratos(cardapioFallback);
      setSobremesas([]);
    } finally {
      setLoading(false);
    }
  }, [perfil]);

  useEffect(() => {
    carregarCardapio();
  }, [carregarCardapio]);

  const aumentar = useCallback((id: string | number) => {
    const key = String(id);
    setQuantidades((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  }, []);

  const diminuir = useCallback((id: string | number) => {
    const key = String(id);
    setQuantidades((prev) => ({
      ...prev,
      [key]: Math.max((prev[key] || 0) - 1, 0)
    }));
  }, []);

  const getQuantidade = useCallback((id: string | number) => {
    return quantidades[String(id)] || 1;
  }, [quantidades]);

  return {
    pratos,
    sobremesas,
    loading,
    quantidades,
    desconto,
    perfil,
    aumentar,
    diminuir,
    getQuantidade,
    carregarCardapio
  };
};