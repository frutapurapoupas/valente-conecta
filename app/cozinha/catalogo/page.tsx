'use client';

import { useMemo, useState } from 'react';
import { useCatalogo, ItemCardapio } from '../../admin-master/cozinha-chef/hooks/useCatalogo';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mesma ordem/rotulo usada no admin (Preview Cardapio, design.config.ts) —
// 0=domingo, seguindo Date.getDay().
const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

// Ordem e rotulo de exibicao das subcategorias dentro de cada aba -- os
// valores batem com o campo `categoria` das receitas (ver useCatalogo.ts,
// CATEGORIAS_DOCES/CATEGORIAS_SALGADOS).
const ORDEM_DOCES: Array<{ chave: string; label: string }> = [
  { chave: 'bolo', label: 'Bolos' },
  { chave: 'torta doce', label: 'Tortas Doces' },
  { chave: 'pudim', label: 'Pudins' },
  { chave: 'cocada', label: 'Cocadas' },
  { chave: 'sobremesa', label: 'Outras Sobremesas' },
];
const ORDEM_SALGADOS: Array<{ chave: string; label: string }> = [
  { chave: 'salgado', label: 'Salgados' },
  { chave: 'torta salgada', label: 'Tortas Salgadas' },
];

type Aba = 'pratos' | 'doces' | 'salgados';

interface ControleQuantidade {
  quantidade: number;
  aumentar: (id: string | number) => void;
  diminuir: (id: string | number) => void;
}

function CardItem({ item, controle }: { item: ItemCardapio; controle: ControleQuantidade }) {
  const { quantidade, aumentar, diminuir } = controle;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      <img src={item.imagem || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop'} alt={item.titulo} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800">{item.titulo}</h3>
        <p className="text-sm text-gray-500 mt-1 h-10 line-clamp-2">{item.descricao}</p>
        <div className="flex items-baseline justify-between mt-3">
          <div>
            {item.precoOriginal && (
              <p className="text-sm text-gray-400 line-through">R$ {item.precoOriginal.toFixed(2)}</p>
            )}
            <p className="text-2xl font-bold text-green-600">R$ {item.preco.toFixed(2)}</p>
          </div>
          {quantidade === 0 ? (
            <button
              onClick={() => aumentar(item.id)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Adicionar
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-green-50 rounded-lg px-2 py-1.5">
              <button onClick={() => diminuir(item.id)} className="p-1 rounded-md bg-white border hover:bg-gray-50">
                <Minus className="w-4 h-4 text-green-700" />
              </button>
              <span className="font-bold text-green-700 w-5 text-center">{quantidade}</span>
              <button onClick={() => aumentar(item.id)} className="p-1 rounded-md bg-white border hover:bg-gray-50">
                <Plus className="w-4 h-4 text-green-700" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SecaoPorCategoria({
  itens,
  ordem,
  corBorda,
  getQuantidade,
  aumentar,
  diminuir,
}: {
  itens: ItemCardapio[];
  ordem: Array<{ chave: string; label: string }>;
  corBorda: string;
  getQuantidade: (id: string | number) => number;
  aumentar: (id: string | number) => void;
  diminuir: (id: string | number) => void;
}) {
  if (itens.length === 0) {
    return <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">Nenhum item disponível por aqui ainda.</div>;
  }

  const grupos = ordem
    .map((grupo) => ({ ...grupo, itensDoGrupo: itens.filter((item) => item.categoria === grupo.chave) }))
    .filter((grupo) => grupo.itensDoGrupo.length > 0);

  return (
    <div className="space-y-8">
      {grupos.map((grupo) => (
        <div key={grupo.chave}>
          <h3 className={`text-lg font-semibold text-gray-700 border-b-2 ${corBorda} pb-1.5 mb-4`}>{grupo.label}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grupo.itensDoGrupo.map((item) => (
              <CardItem key={item.id} item={item} controle={{ quantidade: getQuantidade(item.id), aumentar, diminuir }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CatalogoPage() {
  const router = useRouter();
  const { pratos, doces, salgados, loading, perfil, desconto, quantidades, aumentar, diminuir, getQuantidade } = useCatalogo();
  const [aba, setAba] = useState<Aba>('pratos');
  const [diaSelecionado, setDiaSelecionado] = useState(() => new Date().getDay());

  const diaLabel = DIAS_SEMANA.find((d) => d.value === diaSelecionado)?.label || 'Segunda';
  const pratosDoDia = pratos.filter((item) => item.dia === diaLabel);

  const todosItens = useMemo(() => [...pratos, ...doces, ...salgados], [pratos, doces, salgados]);
  const { totalItens, totalCarrinho } = useMemo(() => {
    let itens = 0;
    let total = 0;
    for (const [chave, quantidade] of Object.entries(quantidades)) {
      if (quantidade <= 0) continue;
      const item = todosItens.find((i) => String(i.id) === chave);
      if (!item) continue;
      itens += quantidade;
      total += item.preco * quantidade;
    }
    return { totalItens: itens, totalCarrinho: total };
  }, [quantidades, todosItens]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const ABAS: Array<{ id: Aba; label: string }> = [
    { id: 'pratos', label: 'Pratos' },
    { id: 'doces', label: 'Sobremesas e Doces' },
    { id: 'salgados', label: 'Salgados' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-4 sm:p-6" style={{ paddingBottom: totalItens > 0 ? '96px' : undefined }}>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition mb-4">
          <ArrowLeft size={16} /> Voltar para seleção
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cardápio Chef Neide</h1>
        <p className="text-gray-600 mb-6">Exibindo preços para o perfil: <span className="font-semibold text-orange-600 capitalize">{perfil}</span> {desconto > 0 && `(${desconto}% OFF)`}</p>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {ABAS.map((item) => (
            <button
              key={item.id}
              onClick={() => setAba(item.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                aba === item.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {aba === 'pratos' && (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              {DIAS_SEMANA.map((dia) => (
                <button
                  key={dia.value}
                  onClick={() => setDiaSelecionado(dia.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    diaSelecionado === dia.value
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-orange-400'
                  }`}
                >
                  {dia.label}
                </button>
              ))}
            </div>

            {pratosDoDia.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">Nenhum prato disponível em {diaLabel.toLowerCase()}.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pratosDoDia.map((item) => (
                  <CardItem key={item.id} item={item} controle={{ quantidade: getQuantidade(item.id), aumentar, diminuir }} />
                ))}
              </div>
            )}
          </>
        )}

        {aba === 'doces' && (
          <SecaoPorCategoria itens={doces} ordem={ORDEM_DOCES} corBorda="border-purple-400" getQuantidade={getQuantidade} aumentar={aumentar} diminuir={diminuir} />
        )}

        {aba === 'salgados' && (
          <SecaoPorCategoria itens={salgados} ordem={ORDEM_SALGADOS} corBorda="border-amber-500" getQuantidade={getQuantidade} aumentar={aumentar} diminuir={diminuir} />
        )}
      </div>

      {totalItens > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
          <div className="max-w-5xl mx-auto p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-gray-700">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">{totalItens} {totalItens === 1 ? 'item' : 'itens'}</span>
              <span className="text-gray-400">·</span>
              <span className="font-bold text-green-600">R$ {totalCarrinho.toFixed(2)}</span>
            </div>
            <button
              onClick={() => router.push(`/cozinha/checkout?perfil=${perfil}`)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
