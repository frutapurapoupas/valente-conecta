// hooks/cozinha/useCatalogo.ts (CORRIGIDO)
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

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

const DIA_SEMANA_LABEL: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado'
};

// Categorias de receita (campo `categoria`) que caem em cada aba do
// catálogo público -- "Pratos" segue o cardápio por dia da semana (tabela
// cardapio), enquanto doces/sobremesas e salgados mostram TODAS as receitas
// dessas categorias sempre, sem depender de estarem no cardápio do dia.
const CATEGORIAS_DOCES = new Set(['bolo', 'torta doce', 'pudim', 'cocada', 'sobremesa']);
const CATEGORIAS_SALGADOS = new Set(['salgado', 'torta salgada']);

export const useCatalogo = () => {
  const searchParams = useSearchParams();
  // 🔥 CORREÇÃO: Verificar se searchParams é null
  const perfil = searchParams?.get('perfil') || 'publico';

  const [pratos, setPratos] = useState<ItemCardapio[]>([]);
  const [doces, setDoces] = useState<ItemCardapio[]>([]);
  const [salgados, setSalgados] = useState<ItemCardapio[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [desconto, setDesconto] = useState(0);

  const carregarCardapio = useCallback(async () => {
    setLoading(true);
    try {
      // Regra principal: catalogo publico usa Receita canonica + Cardapio publicado.
      // Descontos vem da config do admin (nao mais fixos no codigo — ver
      // app/api/cozinha/descontos/route.ts).
      const [cardapioResp, receitasResp, descontosResp] = await Promise.all([
        fetch('/api/cozinha/cardapio').then((res) => res.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/cozinha/receitas').then((res) => res.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/cozinha/descontos').then((res) => res.json()).catch(() => ({ success: false, data: null }))
      ]);

      const descontosConfig = descontosResp?.success ? descontosResp.data : null;
      let descontoAtual = 0;
      if (perfil === 'assinante') descontoAtual = descontosConfig?.descontoAssinante ?? 15;
      else if (perfil === 'revendedor') descontoAtual = descontosConfig?.descontoRevendedor ?? 19;
      setDesconto(descontoAtual);

      const cardapioData = Array.isArray(cardapioResp?.data) ? cardapioResp.data : [];
      const receitasData = Array.isArray(receitasResp?.data) ? receitasResp.data : [];

      if (cardapioData.length > 0 || receitasData.length > 0) {
        const receitasValidas = receitasData
          .map((r: any) => ({
            id: String(r?.id ?? ''),
            name: String(r?.name ?? r?.nome ?? ''),
            description: String(r?.description ?? r?.descricao ?? ''),
            price: Number(r?.price ?? r?.preco_venda ?? r?.preco_sugerido ?? r?.preco ?? 0),
            category: String(r?.category ?? r?.categoria ?? 'prato'),
            images: Array.isArray(r?.images) ? r.images : r?.imagem ? [r.imagem] : [],
            status: String(r?.status ?? 'ativo').toLowerCase(),
          }))
          .filter((r: any) => r.id && r.name && r.status !== 'inativo');

        const receitaById = new Map<string, any>(receitasValidas.map((r: any) => [r.id, r] as [string, any]));

        const pratosDaPreview: ItemCardapio[] = cardapioData
          .filter((item: any) => item?.isAvailable ?? item?.is_available ?? item?.disponivel ?? true)
          .map((item: any) => {
            const receitaId = String(item?.receitaId ?? item?.receita_id ?? item?.recipe_id ?? item?.prato_id ?? '');
            const receita = receitaById.get(receitaId);
            if (!receita) return null;

            const categoria = String(receita.category || 'prato').toLowerCase();
            if (CATEGORIAS_DOCES.has(categoria) || CATEGORIAS_SALGADOS.has(categoria)) return null;

            const usaPrecoDaReceita = item.usarPrecoDaReceita !== false;
            const precoBase = usaPrecoDaReceita
              ? Number(receita.price ?? 0)
              : Number(item.precoCustomizado ?? receita.price ?? 0);
            const precoComDesconto = precoBase * (1 - descontoAtual / 100);
            const diaLabel = DIA_SEMANA_LABEL[Number(item?.diaSemana ?? item?.dia_semana)] || 'Segunda';

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

        // Doces/sobremesas e salgados seguem todas as receitas da categoria,
        // sempre disponiveis (nao dependem do cardapio do dia) -- diferente
        // dos pratos, que so' aparecem quando o admin da cozinha configura
        // no cardapio semanal.
        const mapearReceitaParaItem = (receita: any): ItemCardapio => {
          const precoBase = Number(receita.price || 0);
          const precoComDesconto = precoBase * (1 - descontoAtual / 100);
          return {
            id: receita.id,
            dia: '',
            titulo: receita.name,
            descricao: receita.description || '',
            preco: parseFloat(precoComDesconto.toFixed(2)),
            precoOriginal: descontoAtual > 0 ? precoBase : undefined,
            imagem: receita.images?.[0] || '',
            categoria: String(receita.category || '').toLowerCase(),
            images: receita.images || []
          };
        };

        const docesDoCatalogo: ItemCardapio[] = receitasValidas
          .filter((receita: any) => CATEGORIAS_DOCES.has(String(receita.category || '').toLowerCase()))
          .map(mapearReceitaParaItem);

        const salgadosDoCatalogo: ItemCardapio[] = receitasValidas
          .filter((receita: any) => CATEGORIAS_SALGADOS.has(String(receita.category || '').toLowerCase()))
          .map(mapearReceitaParaItem);

        setPratos(pratosDaPreview);
        setDoces(docesDoCatalogo);
        setSalgados(salgadosDoCatalogo);
        return;
      }
      setPratos([]);
      setDoces([]);
      setSalgados([]);
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error);
      setPratos([]);
      setDoces([]);
      setSalgados([]);
    } finally {
      setLoading(false);
    }
  }, [perfil]);

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
    doces,
    salgados,
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

