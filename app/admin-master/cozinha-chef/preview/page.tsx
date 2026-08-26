'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Clock3, DollarSign, Eye, Plus, UtensilsCrossed } from 'lucide-react';
import { useCardapio } from '@/hooks/useCardapio';
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

function toPreviewReceita(item: any): Receita {
  const images = Array.isArray(item?.images)
    ? item.images
    : item?.imagem
      ? [item.imagem]
      : [];

  return {
    id: String(item?.id ?? ''),
    name: String(item?.name ?? item?.nome ?? ''),
    description: String(item?.description ?? item?.descricao ?? ''),
    price: Number(item?.price ?? item?.preco_venda ?? item?.preco_sugerido ?? item?.preco ?? 0),
    category: String(item?.category ?? item?.categoria ?? ''),
    ingredients: Array.isArray(item?.ingredients) ? item.ingredients : Array.isArray(item?.ingredientes) ? item.ingredientes : [],
    images,
  };
}

function isReceitaPublicada(item: any): boolean {
  const status = String(item?.status ?? '').toLowerCase();
  return status === '' || status === 'ativo';
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
      const response = await fetch('/api/cozinha/receitas');
      const result = await response.json();
      if (result.success) {
        const reais = (Array.isArray(result.data) ? result.data : [])
          .filter(isReceitaPublicada)
          .map(toPreviewReceita)
          .filter((r: Receita) => !!r.id && !!r.name);
        setReceitas(reais);
      }
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setLoadingReceitas(false);
    }
  }

  const cardapioSeguro = Array.isArray(cardapio) ? (cardapio as CardapioItem[]) : [];

  const cardapioDoDia = cardapioSeguro.filter(
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
      alert('Prato adicionado ao cardápio!');
      await reload();
    } else {
      alert('Erro ao adicionar: ' + result.error);
    }
  };

  const handleRemover = async (id: string) => {
    if (!confirm('Remover este item do cardápio?')) return;
    const result = await remove(id);
    if (result.success) {
      await reload();
    } else {
      alert('Erro ao remover');
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
        <div className={design.classes.header}>
          <div>
            <h1 className={design.classes.title}>{design.titles.main}</h1>
            <p className={design.classes.subtitle}>{design.titles.subtitle}</p>
            <p className={design.classes.metaInfo}>
              {receitas.length} {design.titles.disponiveis} • {cardapioSeguro.length} {design.titles.itensNoCardapio}
            </p>
          </div>
          <a
            href="/cozinha/catalogo?perfil=publico"
            target="_blank"
            rel="noreferrer"
            className={design.classes.btnVerPublico}
          >
            <Eye size={16} />
            {design.titles.verPublico}
          </a>
        </div>

        <div className={design.classes.contentGrid}>
          <section className={design.classes.principalCol}>
            <p className={design.classes.sectionLabel}>
              <UtensilsCrossed size={16} /> {design.titles.areaPrincipal}
            </p>

            <div className={design.classes.diaSelector}>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={design.classes.diaSelectorLabel}>{design.titles.diaLabel}:</span>
                {design.diasSemana.map((dia) => (
                  <button
                    key={dia.value}
                    onClick={() => setDiaSelecionado(dia.value)}
                    className={`${design.classes.diaButton} ${
                      diaSelecionado === dia.value
                        ? design.classes.diaButtonActive
                        : design.classes.diaButtonInactive
                    }`}
                    aria-pressed={diaSelecionado === dia.value}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={design.classes.cardapioContainer}>
              <div className={design.classes.cardapioHeader}>
                <h2 className={design.classes.cardapioTitle}>{diaLabel}</h2>
                <span className={design.classes.cardapioCount}>
                  {cardapioComReceitas.length} itens
                </span>
              </div>

              {cardapioComReceitas.length === 0 ? (
                <div className={design.classes.emptyState}>
                  <p>{design.titles.emptyDia}{diaLabel.toLowerCase()}</p>
                  <p className={design.classes.emptyStateSub}>{design.titles.emptyHint}</p>
                </div>
              ) : (
                <div className={design.classes.cardGrid}>
                  {cardapioComReceitas.map((item) => (
                    <div key={item.id} className={design.classes.cardItem}>
                      <div className="flex gap-3 sm:gap-4">
                        {item.receita?.images && item.receita.images.length > 0 ? (
                          <img
                            src={item.receita.images[0]}
                            alt={item.receita.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg items-center justify-center text-2xl flex-shrink-0 flex">
                            🍽️
                          </div>
                        )}

                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg items-center justify-center text-2xl flex-shrink-0 hidden">
                          🍽️
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className={design.classes.cardHeader}>
                            <div className="min-w-0">
                              <h3 className={design.classes.cardNome}>{item.receita?.name}</h3>
                              <p className={design.classes.cardDesc}>{item.receita?.description}</p>
                            </div>
                            <button
                              onClick={() => handleRemover(item.id)}
                              className={design.classes.btnRemover}
                              title="Remover do cardápio"
                            >
                              ×
                            </button>
                          </div>
                          <div className={design.classes.cardFooter}>
                            <span className={design.classes.cardPreco}>
                              {design.formatCurrency(getPrecoExibicao(item as CardapioItem, item.receita))}
                            </span>
                            <span className={design.classes.cardPeriodo}>{item.periodo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className={design.classes.legendContainer}>{design.titles.legend}</div>
            </div>
          </section>

          <aside className={design.classes.secondaryCol}>
            <p className={design.classes.sectionLabel}>
              <Plus size={16} /> {design.titles.areaSecundaria}
            </p>
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
                    <option value="">{design.titles.selectReceita}</option>
                    {receitasDisponiveis.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({design.formatCurrency(r.price)})
                      </option>
                    ))}
                  </select>
                  {receitasDisponiveis.length === 0 && (
                    <p className="text-sm text-green-700 mt-1">{design.titles.todosAdicionados}</p>
                  )}
                </div>

                <div>
                  <label className={design.classes.formLabel}>{design.titles.periodoLabel}</label>
                  <div className={design.classes.periodosWrap}>
                    {design.periodos.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPeriodo(p.value)}
                        className={`${design.classes.periodoButton} ${
                          periodo === p.value ? design.classes.periodoButtonActive : design.classes.periodoButtonInactive
                        }`}
                        aria-pressed={periodo === p.value}
                      >
                        <Clock3 size={14} className="inline mr-1" />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={design.classes.formLabel}>{design.titles.precoLabel}</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={precoCustomizado}
                      onChange={(e) => setPrecoCustomizado(e.target.value)}
                      placeholder={design.titles.precoPlaceholder}
                      className={`${design.classes.formInput} pl-8`}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{design.titles.precoHint}</p>
                </div>

                <div>
                  <button
                    onClick={handleAdicionar}
                    disabled={!receitaSelecionada}
                    className={design.classes.btnAdicionar}
                  >
                    <CalendarDays size={16} />
                    {design.titles.addButton} ao Cardápio - {diaLabel}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}




