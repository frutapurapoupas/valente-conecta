// components/cozinha/CatalogoUI.tsx
// 🎨 UI - Catálogo com Abas Hierárquicas (Pratos com dias, Sobremesas com subcategorias)

"use client";

import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

interface ItemCardapio {
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

interface CatalogoUIProps {
  pratos: ItemCardapio[];
  sobremesas: ItemCardapio[];
  loading: boolean;
  onAumentar: (id: string | number) => void;
  onDiminuir: (id: string | number) => void;
  getQuantidade: (id: string | number) => number;
  desconto?: number;
  perfil?: string;
}

// DIAS DA SEMANA
const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// SUBCATEGORIAS DE SOBREMESAS
const SUBCATEGORIAS = {
  doces: ['Doce', 'Pudim', 'Cocada', 'Torta Doce'],
  salgados: ['Salgado', 'Lanche', 'Torta Salgada', 'Empada'],
  bolos: ['Bolo', 'Bolo Mini']
};

export default function CatalogoUI({
  pratos,
  sobremesas,
  loading,
  onAumentar,
  onDiminuir,
  getQuantidade,
  desconto = 0,
  perfil = 'publico'
}: CatalogoUIProps) {
  // ABA PRINCIPAL: 'pratos' | 'sobremesas'
  const [abaPrincipal, setAbaPrincipal] = useState<'pratos' | 'sobremesas'>('pratos');
  
  // SUB-ABA: dia da semana ou subcategoria
  const [subAba, setSubAba] = useState<string>('Segunda');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // ============================================================
  // FILTROS
  // ============================================================

  // Filtrar pratos por dia
  const getPratosPorDia = (dia: string) => {
    return pratos.filter(item => 
      item.dia?.toLowerCase() === dia.toLowerCase() ||
      item.categoria?.toLowerCase() === 'prato'
    );
  };

  // Filtrar sobremesas por subcategoria
  const getSobremesasPorCategoria = (categoria: string) => {
    const keywords = SUBCATEGORIAS[categoria as keyof typeof SUBCATEGORIAS] || [];
    return sobremesas.filter(item => {
      const titulo = item.titulo?.toLowerCase() || '';
      const cat = item.categoria?.toLowerCase() || '';
      
      if (categoria === 'doces') {
        return keywords.some(k => 
          titulo.includes(k.toLowerCase()) || 
          cat.includes(k.toLowerCase())
        );
      }
      if (categoria === 'salgados') {
        return keywords.some(k => 
          titulo.includes(k.toLowerCase()) || 
          cat.includes(k.toLowerCase())
        );
      }
      if (categoria === 'bolos') {
        return keywords.some(k => 
          titulo.includes(k.toLowerCase()) || 
          cat.includes(k.toLowerCase())
        );
      }
      return false;
    });
  };

  // Obter itens atuais com base na aba e sub-aba
  const getItensAtuais = () => {
    if (abaPrincipal === 'pratos') {
      return getPratosPorDia(subAba);
    } else {
      return getSobremesasPorCategoria(subAba);
    }
  };

  // Contar itens por sub-aba
  const contarItens = (tipo: 'pratos' | 'sobremesas', sub: string) => {
    if (tipo === 'pratos') {
      return getPratosPorDia(sub).length;
    } else {
      return getSobremesasPorCategoria(sub).length;
    }
  };

  // Sub-abas para pratos (dias da semana)
  const subAbasPratos = DIAS.map(dia => ({
    id: dia,
    label: dia,
    count: contarItens('pratos', dia)
  }));

  // Sub-abas para sobremesas
  const subAbasSobremesas = [
    { id: 'doces', label: '🍬 Doces', count: contarItens('sobremesas', 'doces') },
    { id: 'salgados', label: '🧂 Salgados', count: contarItens('sobremesas', 'salgados') },
    { id: 'bolos', label: '🧁 Bolos', count: contarItens('sobremesas', 'bolos') }
  ];

  const itens = getItensAtuais();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <p className="text-gray-400">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-black border-b border-yellow-500 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">🍽️ Cardápio</h1>
              <p className="text-sm text-gray-400">Escolha seu prato favorito</p>
              {desconto > 0 && (
                <span className="inline-block mt-1 text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
                  🎯 {desconto}% OFF
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{itens.length} itens</span>
            </div>
          </div>

          {/* 🔥 ABAS PRINCIPAIS: Pratos | Sobremesas */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setAbaPrincipal('pratos');
                setSubAba('Segunda');
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
                abaPrincipal === 'pratos'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              🍽️ Pratos
            </button>
            <button
              onClick={() => {
                setAbaPrincipal('sobremesas');
                setSubAba('doces');
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
                abaPrincipal === 'sobremesas'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              🍰 Sobremesas
            </button>
          </div>

          {/* 🔥 SUB-ABAS */}
          <div className="flex flex-wrap gap-2 mt-3">
            {abaPrincipal === 'pratos'
              ? subAbasPratos.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubAba(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      subAba === sub.id
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                        : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-700'
                    }`}
                  >
                    {sub.label} ({sub.count})
                  </button>
                ))
              : subAbasSobremesas.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubAba(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      subAba === sub.id
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                        : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-700'
                    }`}
                  >
                    {sub.label} ({sub.count})
                  </button>
                ))}
          </div>
        </div>
      </div>

      {/* GRID DE PRODUTOS */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {itens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Nenhum item disponível nesta categoria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itens.map((item) => {
              const quantidade = getQuantidade(item.id);
              const imagemUrl = item.images?.[0] || item.imagem;

              return (
                <div key={item.id} className="bg-zinc-900 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition border border-zinc-800">
                  {/* IMAGEM */}
                  {imagemUrl ? (
                    <img
                      src={imagemUrl}
                      alt={item.titulo}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-zinc-800 flex items-center justify-center text-6xl">
                      🍽️
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-white">{item.titulo}</h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.descricao}</p>
                      </div>
                      {item.categoria && (
                        <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
                          {item.categoria}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        {item.precoOriginal && item.precoOriginal > item.preco ? (
                          <div>
                            <span className="text-lg font-bold text-yellow-400">
                              {formatCurrency(item.preco)}
                            </span>
                            <span className="text-sm text-gray-500 line-through ml-2">
                              {formatCurrency(item.precoOriginal)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-yellow-400">
                            {formatCurrency(item.preco)}
                          </span>
                        )}
                      </div>

                      {/* Controle de quantidade */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDiminuir(item.id)}
                          className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition"
                          disabled={quantidade <= 0}
                        >
                          <Minus size={16} className={quantidade <= 0 ? 'text-gray-600' : 'text-gray-300'} />
                        </button>
                        <span className="w-8 text-center font-medium text-white">{quantidade}</span>
                        <button
                          onClick={() => onAumentar(item.id)}
                          className="w-8 h-8 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black flex items-center justify-center transition font-bold"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {quantidade > 0 && (
                      <button className="mt-3 w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg transition flex items-center justify-center gap-2">
                        <ShoppingCart size={18} />
                        Adicionar ({quantidade})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}