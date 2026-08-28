'use client';

// Caminho: C:\valente_conecta\components\cozinha\ModalIngredienteEstoque.tsx
//
// Modal unico de cadastro/edicao de ingrediente no estoque da Cozinha —
// antes existiam duas versoes quase iguais (uma dentro do editor de receita,
// outra na tela de Estoque) com framings diferentes pra a mesma conversao de
// unidade, e uma delas ("Peso da embalagem" + "Unidade do peso informado")
// virava texto sem sentido tipo "1 g = 200 g" sempre que a unidade de compra
// era ela mesma um peso (o caso mais comum). Aqui so' existe o framing direto
// "1 [unidade de compra] = quantos [unidade de uso]", que funciona pra
// qualquer par de unidade sem ambiguidade.

import { useState } from 'react';
import { X } from 'lucide-react';

export interface PayloadIngredienteEstoque {
  nome: string;
  categoria: string;
  unidade: string; // unidade de compra
  unidade_uso: string;
  fator_conversao: number;
  peso_gramas_unidade_uso: number;
  preco_unitario: number;
  quantidade: number; // inicial (modo novo) ou a somar ao estoque atual (modo editar)
  quantidade_minima: number;
}

export interface ItemEstoqueEdicao {
  nome: string;
  categoria?: string;
  unidade?: string;
  unidade_uso?: string;
  fator_conversao?: number;
  peso_gramas_unidade_uso?: number;
  preco_unitario?: number;
  quantidade?: number;
  quantidade_minima?: number;
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

interface Props {
  modo: 'novo' | 'editar';
  itemEditando?: ItemEstoqueEdicao | null;
  salvando: boolean;
  onFechar: () => void;
  onSalvar: (payload: PayloadIngredienteEstoque) => Promise<void>;
  /** Contexto do editor de receita: mostra um campo extra pra já usar o ingrediente na receita, sem precisar de um segundo passo de selecionar+adicionar. */
  paraReceita?: boolean;
  onAdicionarNaReceita?: (quantidade: number, unidade: string) => void;
}

export function ModalIngredienteEstoque({ modo, itemEditando, salvando, onFechar, onSalvar, paraReceita, onAdicionarNaReceita }: Props) {
  const [nome, setNome] = useState(itemEditando?.nome || '');
  const [categoria, setCategoria] = useState(itemEditando?.categoria || 'Geral');
  const [unidadeCompra, setUnidadeCompra] = useState(itemEditando?.unidade || 'kg');
  const [unidadeUso, setUnidadeUso] = useState(itemEditando?.unidade_uso || itemEditando?.unidade || 'g');
  const [fatorConversao, setFatorConversao] = useState(itemEditando?.fator_conversao || 1000);
  const [pesoGramasUnidadeUso, setPesoGramasUnidadeUso] = useState(itemEditando?.peso_gramas_unidade_uso || 1);
  const [precoUnitario, setPrecoUnitario] = useState(itemEditando?.preco_unitario || 0);
  const [quantidadeCampo, setQuantidadeCampo] = useState(0);
  const [estoqueMinimo, setEstoqueMinimo] = useState(itemEditando?.quantidade_minima || 0);
  const [quantidadeReceita, setQuantidadeReceita] = useState<number | ''>('');

  const handleUnidadeUsoChange = (valor: string) => {
    setUnidadeUso(valor);
    setPesoGramasUnidadeUso(valor.trim().toLowerCase() === 'un' ? 50 : 1);
  };

  const handleSalvar = async () => {
    if (!nome.trim()) return;
    await onSalvar({
      nome: nome.trim(),
      categoria: categoria.trim() || 'Geral',
      unidade: unidadeCompra.trim() || 'un',
      unidade_uso: unidadeUso.trim() || 'un',
      fator_conversao: fatorConversao > 0 ? fatorConversao : 1,
      peso_gramas_unidade_uso: toNumber(pesoGramasUnidadeUso, 1),
      preco_unitario: toNumber(precoUnitario, 0),
      quantidade: toNumber(quantidadeCampo, 0),
      quantidade_minima: toNumber(estoqueMinimo, 0),
    });
    if (paraReceita && onAdicionarNaReceita && quantidadeReceita !== '' && toNumber(quantidadeReceita) > 0) {
      onAdicionarNaReceita(toNumber(quantidadeReceita), unidadeUso.trim() || 'un');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">
            {modo === 'novo' ? 'Novo ingrediente no estoque' : `Editar / Reabastecer: ${itemEditando?.nome}`}
          </h3>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <label className="block text-sm">
          Nome
          <input
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Farinha de trigo"
          />
        </label>

        <label className="block text-sm">
          Categoria
          <input
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            Unidade de compra
            <input
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              value={unidadeCompra}
              onChange={(e) => setUnidadeCompra(e.target.value)}
              placeholder="kg, L, un"
            />
          </label>
          <label className="block text-sm">
            Unidade usada na receita
            <input
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              value={unidadeUso}
              onChange={(e) => handleUnidadeUsoChange(e.target.value)}
              placeholder="g, ml, un"
            />
          </label>
        </div>

        <label className="block text-sm">
          1 {unidadeCompra || 'compra'} = quantos {unidadeUso || 'uso'}
          <input
            type="number"
            step="0.01"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            value={fatorConversao}
            onChange={(e) => setFatorConversao(toNumber(e.target.value, 1))}
          />
        </label>

        {unidadeUso.trim().toLowerCase() === 'un' && (
          <label className="block text-sm">
            Peso (g) de 1 {unidadeUso} (ex: 1 ovo ≈ 50g)
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              value={pesoGramasUnidadeUso}
              onChange={(e) => setPesoGramasUnidadeUso(toNumber(e.target.value, 1))}
            />
          </label>
        )}

        <p className="text-sm text-gray-500">
          O fator de conversão vem da embalagem/compra (ex: 1kg = 1000g). O peso em gramas só precisa ser ajustado
          para itens contados em unidades (ex: 1 ovo ≈ 50g) — para itens já comprados em kg/L, deixe 1.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            {modo === 'novo' ? 'Quantidade inicial' : `Quantidade a adicionar (atual: ${itemEditando?.quantidade ?? 0} ${itemEditando?.unidade})`}
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              value={quantidadeCampo}
              onChange={(e) => setQuantidadeCampo(toNumber(e.target.value, 0))}
            />
          </label>
          <label className="block text-sm">
            Preço por {unidadeCompra || 'unidade de compra'} (opcional, pode ajustar depois)
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              value={precoUnitario}
              onChange={(e) => setPrecoUnitario(toNumber(e.target.value, 0))}
              placeholder="0.00"
            />
          </label>
        </div>

        <label className="block text-sm">
          Quantidade mínima
          <input
            type="number"
            step="0.01"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            value={estoqueMinimo}
            onChange={(e) => setEstoqueMinimo(toNumber(e.target.value, 0))}
          />
        </label>

        {paraReceita && (
          <div className="border-t border-gray-100 pt-3">
            <label className="block text-sm">
              Quantidade nesta receita (opcional — já adiciona o ingrediente aqui, sem precisar selecionar de novo)
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  value={quantidadeReceita}
                  onChange={(e) => setQuantidadeReceita(e.target.value === '' ? '' : toNumber(e.target.value, 0))}
                  placeholder={`Ex: 200 ${unidadeUso || 'g'}`}
                />
                <span className="text-sm text-gray-500 shrink-0">{unidadeUso || 'un'}</span>
              </div>
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFechar} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSalvar()}
            disabled={salvando}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : modo === 'novo' ? 'Cadastrar' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
