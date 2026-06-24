'use client';

import { useState, useEffect } from 'react';
import { useCardapio } from '@/hooks/cozinha/useCardapio';
import { previewDesign as design } from './design.config';

interface Receita {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: any[];
  images?: string[];
}

interface CardapioItem {
  id: string;
  receitaId: string;
  diaSemana: number;
  periodo: string;
  precoCustomizado?: number | null;
  usarPrecoDaReceita?: boolean;
  isAvailable: boolean;
}

export default function PreviewCardapio() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loadingReceitas, setLoadingReceitas] = useState(true);
  const [diaSelecionado, setDiaSelecionado] = useState(1);
  const [receitaSelecionada, setReceitaSelecionada] = useState('');
  const [periodo, setPeriodo] = useState('almoco');
  const [precoCustomizado, setPrecoCustomizado] = useState('');

  const { cardapio, loading: loadingCardapio, create, delete: remove, reload } = useCardapio();

  useEffect(() => {
    carregarReceitas();
  }, []);

  async function carregarReceitas() {
    setLoadingReceitas(true);
    try {
      const response = await fetch('/api/cozinha/recipes');
      const result = await response.json();
      if (result.success) {
        setReceitas(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setLoadingReceitas(false);
    }
  }

  const cardapioDoDia = (cardapio as CardapioItem[]).filter(
    (item) => item.diaSemana === diaSelecionado && item.isAvailable
  );

  const cardapioComReceitas = cardapioDoDia.map(item => {
    const receita = receitas.find(r => r.id === item.receitaId);
    return {
      ...item,
      receita: receita || null
    };
  }).filter(item => item.receita !== null);

  const idsNoDia = new Set(cardapioDoDia.map(item => item.receitaId));
  const receitasDisponiveis = receitas.filter(r => !idsNoDia.has(r.id));

  const handleAdicionar = async () => {
    if (!receitaSelecionada) {
      alert('Selecione uma receita');
      return;
    }

    const receita = receitas.find(r => r.id === receitaSelecionada);
    if (!receita) return;

    const item = {
      receitaId: receita.id,
      diaSemana: diaSelecionado,
      periodo: periodo,
      precoCustomizado: precoCustomizado ? parseFloat(precoCustomizado) : null,
      usarPrecoDaReceita: !precoCustomizado,
      isAvailable: true
    };

    const result = await create(item);
    if (result.success) {
      setReceitaSelecionada('');
      setPrecoCustomizado('');
      alert('✅ Prato adicionado ao cardápio!');
      await reload();
    } else {
      alert('❌ Erro ao adicionar: ' + result.error);
    }
  };

  const handleRemover = async (id: string) => {
    if (!confirm('Remover este item do cardápio?')) return;
    const result = await remove(id);
    if (result.success) {
      await reload();
    } else {
      alert('❌ Erro ao remover');
    }
  };

  const isLoading = loadingReceitas || loadingCardapio;
  const diaLabel = design.diasSemana.find(d => d.value === diaSelecionado)?.label || '';

  const getPrecoExibicao = (item: CardapioItem, receita: Receita | null) => {
    if (!receita) return item.precoCustomizado ?? 0;
    const usaPrecoDaReceita = item.usarPrecoDaReceita !== false;
    if (usaPrecoDaReceita) return receita.price || 0;
    return item.precoCustomizado ?? receita.price ?? 0;
  };

  if (isLoading) {
    return (
      <div className={design.classes.container}>
        <div className="text-center py-12">Carregando cardápio...</div>
      </div>
    );
  }

  return (
    <div className={design.classes.container}>
      <div className={design.classes.maxWidth}>
        {/* Header */}
        <div className={design.classes.header}>
          <div>
            <h1 className={design.classes.title}>{design.titles.main}</h1>
            <p className={design.classes.subtitle}>{design.titles.subtitle}</p>
            <p className={design.classes.metaInfo}>
              {receitas.length} {design.titles.disponiveis} • {cardapio.length} {design.titles.itensNoCardapio}
            </p>
          </div>
          <a
            href="/cozinha"
            target="_blank"
            className={design.classes.btnVerPublico}
          >
            {design.titles.verPublico}
          </a>
        </div>

        {/* Seletor de Dia */}
        <div className={design.classes.diaSelector}>
          <div className="flex flex-wrap gap-2 items-center">
            <span className={design.classes.diaSelectorLabel}>📆 Dia:</span>
            {design.diasSemana.map(dia => (
              <button
                key={dia.value}
                onClick={() => setDiaSelecionado(dia.value)}
                className={`${design.classes.diaButton} ${
                  diaSelecionado === dia.value
                    ? design.classes.diaButtonActive
                    : design.classes.diaButtonInactive
                }`}
              >
                {dia.label}
              </button>
            ))}
          </div>
        </div>

        {/* Adicionar ao Cardápio */}
        <div className={design.classes.formContainer}>
          <h2 className={design.classes.formTitle}>
            {design.titles.addTitle}{diaLabel}
          </h2>
          <div className={design.classes.formGrid}>
            <div>
              <label className={design.classes.formLabel}>{design.titles.selectReceita}</label>
              <select
                value={receitaSelecionada}
                onChange={(e) => setReceitaSelecionada(e.target.value)}
                className={design.classes.formSelect}
              >
                <option value="">Selecione uma receita</option>
                {receitasDisponiveis.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({design.formatCurrency(r.price)})
                  </option>
                ))}
              </select>
              {receitasDisponiveis.length === 0 && (
                <p className="text-sm text-green-600 mt-1">{design.titles.todosAdicionados}</p>
              )}
            </div>

            <div>
              <label className={design.classes.formLabel}>{design.titles.periodoLabel}</label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className={design.classes.formSelect}
              >
                {design.periodos.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={design.classes.formLabel}>{design.titles.precoLabel}</label>
              <input
                type="number"
                step="0.01"
                value={precoCustomizado}
                onChange={(e) => setPrecoCustomizado(e.target.value)}
                placeholder={design.titles.precoPlaceholder}
                className={design.classes.formInput}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAdicionar}
                disabled={!receitaSelecionada}
                className={design.classes.btnAdicionar}
              >
                ➕ Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Cardápio do Dia - COM IMAGEM */}
        <div className={design.classes.cardapioContainer}>
          <div className={design.classes.cardapioHeader}>
            <h2 className={design.classes.cardapioTitle}>📋 {diaLabel}</h2>
            <span className={design.classes.cardapioCount}>
              {cardapioComReceitas.length} itens
            </span>
          </div>

          {cardapioComReceitas.length === 0 ? (
            <div className={design.classes.emptyState}>
              <p>{design.titles.emptyDia}{diaLabel.toLowerCase()}</p>
              <p className={design.classes.emptyStateSub}>Adicione receitas usando o formulário acima</p>
            </div>
          ) : (
            <div className={design.classes.cardGrid}>
              {cardapioComReceitas.map(item => (
                <div key={item.id} className={design.classes.cardItem}>
                  {/* 🔥 CARD COM IMAGEM */}
                  <div className="flex gap-4">
                    {/* Imagem do prato */}
                    {item.receita?.images && item.receita.images.length > 0 ? (
                      <img 
                        src={item.receita.images[0]} 
                        alt={item.receita.name}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          // Se a imagem não carregar, mostrar fallback
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                        🍽️
                      </div>
                    )}
                    
                    {/* Informações do prato */}
                    <div className="flex-1 min-w-0">
                      <div className={design.classes.cardHeader}>
                        <div>
                          <h3 className={design.classes.cardNome}>{item.receita?.name}</h3>
                          <p className={design.classes.cardDesc}>{item.receita?.description}</p>
                        </div>
                        <button
                          onClick={() => handleRemover(item.id)}
                          className={design.classes.btnRemover}
                          title="Remover do cardápio"
                        >
                          ✕
                        </button>
                      </div>
                      <div className={design.classes.cardFooter}>
                        <span className={design.classes.cardPreco}>
                          {design.formatCurrency(getPrecoExibicao(item as CardapioItem, item.receita))}
                        </span>
                        <span className={design.classes.cardPeriodo}>
                          {item.periodo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className={design.classes.legendContainer}>
          {design.titles.legend}
        </div>
      </div>
    </div>
  );
}