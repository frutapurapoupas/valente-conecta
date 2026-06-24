// hooks/cozinha/useCatalogo.ts (CORRIGIDO)
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { cozinhaService } from '@/services/cozinhaService';
import { cardapioFallback, DIAS_SEMANA } from '@/constants/cozinhaConstants';
import { CatalogStorage } from '@/modules-scaffold/services/shared/storageServices';
import { Item } from '@/modules-scaffold/types/modules';

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

const normalizarDiaSemana = (valor: string) =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace('-feira', '')
    .trim();

const DIA_SEMANA_LABEL: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado'
};

export const useCatalogo = () => {
  const searchParams = useSearchParams();
  // 🔥 CORREÇÃO: Verificar se searchParams é null
  const perfil = searchParams?.get('perfil') || 'publico';
  
  const [pratos, setPratos] = useState<ItemCardapio[]>([]);
  const [sobremesas, setSobremesas] = useState<ItemCardapio[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [desconto, setDesconto] = useState(0);

  const mapAdminItemToCardapio = useCallback(
    (item: Item, descontoAtual: number): ItemCardapio => {
      const precoOriginal = Number(item.preco || 0);
      const precoComDesconto = precoOriginal * (1 - descontoAtual / 100);
      const categoriaRaw = String(item.subcategoria || item.categoria || 'prato');
      const categoriaNormalizada = categoriaRaw.toLowerCase();

      return {
        id: item.id,
        dia: 'HOJE',
        titulo: item.nome || 'Prato do Dia',
        descricao: item.descricao || 'Deliciosa opção do dia',
        preco: parseFloat(precoComDesconto.toFixed(2)),
        precoOriginal: descontoAtual > 0 ? precoOriginal : undefined,
        imagem: item.imagem || '',
        categoria: categoriaNormalizada,
        images: item.imagem ? [item.imagem] : []
      };
    },
    []
  );

  const carregarCardapio = useCallback(async () => {
    setLoading(true);
    try {
      let descontoAtual = 0;
      if (perfil === 'assinante') descontoAtual = 15;
      else if (perfil === 'revendedor') descontoAtual = 19;
      setDesconto(descontoAtual);

      // Regra principal: pratos seguem exatamente a configuração da preview do admin.
      const [cardapioResp, receitasResp] = await Promise.all([
        fetch('/api/cozinha/cardapio').then((res) => res.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/cozinha/recipes').then((res) => res.json()).catch(() => ({ success: false, data: [] }))
      ]);

      const cardapioData = Array.isArray(cardapioResp?.data) ? cardapioResp.data : [];
      const receitasData = Array.isArray(receitasResp?.data) ? receitasResp.data : [];

      if (cardapioData.length > 0 || receitasData.length > 0) {
        const receitasValidas = receitasData.filter((r: any) =>
          r && r.id && typeof r.name === 'string' && typeof r.price === 'number'
        );

        const receitaById = new Map(receitasValidas.map((r: any) => [r.id, r]));

        const pratosDaPreview: ItemCardapio[] = cardapioData
          .filter((item: any) => item?.isAvailable)
          .map((item: any) => {
            const receita = receitaById.get(item.receitaId);
            if (!receita) return null;

            const categoria = String(receita.category || 'prato').toLowerCase();
            if (categoria === 'sobremesa' || categoria === 'bolo') return null;

            const usaPrecoDaReceita = item.usarPrecoDaReceita !== false;
            const precoBase = usaPrecoDaReceita
              ? Number(receita.price ?? 0)
              : Number(item.precoCustomizado ?? receita.price ?? 0);
            const precoComDesconto = precoBase * (1 - descontoAtual / 100);
            const diaLabel = DIA_SEMANA_LABEL[Number(item.diaSemana)] || 'Segunda';

            return {
              id: item.id,
              dia: diaLabel,
              titulo: receita.name,
              descricao: receita.description || 'Deliciosa opção do dia',
              preco: parseFloat(precoComDesconto.toFixed(2)),
              precoOriginal: descontoAtual > 0 ? precoBase : undefined,
              imagem: receita.images?.[0] || '',
              categoria: 'prato',
              images: receita.images || []
            } as ItemCardapio;
          })
          .filter(Boolean) as ItemCardapio[];

        // Regra de sobremesas: seguem todas as receitas por tipo.
        const sobremesasPorTipo: ItemCardapio[] = receitasValidas
          .filter((receita: any) => {
            const categoria = String(receita.category || '').toLowerCase();
            return categoria === 'sobremesa' || categoria === 'bolo' || categoria === 'salgado';
          })
          .map((receita: any) => {
            const precoBase = Number(receita.price || 0);
            const precoComDesconto = precoBase * (1 - descontoAtual / 100);

            return {
              id: receita.id,
              dia: 'Sobremesas',
              titulo: receita.name,
              descricao: receita.description || 'Sobremesa especial',
              preco: parseFloat(precoComDesconto.toFixed(2)),
              precoOriginal: descontoAtual > 0 ? precoBase : undefined,
              imagem: receita.images?.[0] || '',
              categoria: String(receita.category || 'sobremesa').toLowerCase(),
              images: receita.images || []
            } as ItemCardapio;
          });

        setPratos(pratosDaPreview);
        setSobremesas(sobremesasPorTipo);
        return;
      }

      // Fallback secundário: storage compartilhado, mantendo compatibilidade.
      const itensAdmin = CatalogStorage.getAll()
        .filter((item) => (item.categoria === 'cozinha-chef-neide' || item.categoria === 'cozinha'))
        .filter((item) => item.status === 'publicado')
        .sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });

      if (itensAdmin.length > 0) {
        const itensMapeados = itensAdmin.map((item) => mapAdminItemToCardapio(item, descontoAtual));
        const sobremesasLista = itensMapeados.filter((item) =>
          String(item.categoria || '').includes('sobremesa')
        );
        const pratosPrincipais = itensMapeados.filter(
          (item) => !String(item.categoria || '').includes('sobremesa')
        );

        setPratos(pratosPrincipais);
        setSobremesas(sobremesasLista);
        return;
      }

      const response = await cozinhaService.getPratos();
      const responseData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      if (responseData.length > 0) {
        const ativos = responseData.filter((p: any) => p.ativo !== false);
        
        const pratosPrincipais: ItemCardapio[] = [];
        const sobremesasLista: ItemCardapio[] = [];

        DIAS_SEMANA.forEach((dia) => {
          const pratosDoDia = ativos.filter((p: any) => {
            const valorDia = normalizarDiaSemana(String(p.dia_semana || p.dia || ''));
            const diaAtual = normalizarDiaSemana(dia);
            return valorDia === diaAtual || valorDia.includes(diaAtual) || diaAtual.includes(valorDia);
          });
          const selecionados = pratosDoDia;
          
          selecionados.forEach((prato: any) => {
            const precoOriginal = prato.preco || 0;
            const precoComDesconto = precoOriginal * (1 - descontoAtual / 100);
            
            const item = {
              id: prato.id,
              dia: dia.toUpperCase(),
              titulo: prato.nome || 'Prato do Dia',
              descricao: prato.descricao || prato.descricaoCurta || 'Deliciosa opção do dia',
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
  }, [perfil, mapAdminItemToCardapio]);

  useEffect(() => {
    carregarCardapio();

    // Mantém catálogo público sincronizado em tempo real com publicações do admin.
    window.addEventListener('catalogo_itens_updated', carregarCardapio);
    return () => window.removeEventListener('catalogo_itens_updated', carregarCardapio);
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
    return quantidades[String(id)] || 0;
  }, [quantidades]);

  const limparQuantidades = useCallback(() => {
    setQuantidades({});
  }, []);

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
    limparQuantidades,
    carregarCardapio
  };
};