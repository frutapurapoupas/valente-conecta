'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ReceitaCanonicaCompat } from '@/types/receita-canonica';
import {
  IngredienteDisponivel,
  toNumber,
  calcularIndicadoresReceita,
} from '../_lib/indicadoresReceita';

type NovoIngrediente = {
  ingrediente_id: string;
  quantidade: number;
  unidade: string;
};

type NovoItemEstoque = {
  nome: string;
  unidade: string;
  unidade_uso: string;
  fator_conversao: number;
  peso_gramas_unidade_uso: number;
  preco_unitario: number;
};

type Props = {
  titulo: string;
  receita: ReceitaCanonicaCompat;
  ingredientesDisponiveis: IngredienteDisponivel[];
  salvando: boolean;
  onChange: (next: ReceitaCanonicaCompat) => void;
  onAdicionarIngrediente: (item: NovoIngrediente) => void;
  onRemoverIngrediente: (index: number) => void;
  onCriarIngrediente: (item: NovoItemEstoque) => Promise<void>;
  onSalvar: () => Promise<void>;
  onEnviarListaCompras: (itens: any[], total: number) => Promise<void>;
};

export default function ReceitaFormularioCanonico({
  titulo,
  receita,
  ingredientesDisponiveis,
  salvando,
  onChange,
  onAdicionarIngrediente,
  onRemoverIngrediente,
  onCriarIngrediente,
  onSalvar,
  onEnviarListaCompras,
}: Props) {
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  // Modal de novo ingrediente
  const [modalAberto, setModalAberto] = useState(false);
  const [criandoIngrediente, setCriandoIngrediente] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaUnidadeCompra, setNovaUnidadeCompra] = useState('kg');
  const [novaUnidadeUso, setNovaUnidadeUso] = useState('g');
  const [novoFatorConversao, setNovoFatorConversao] = useState(1000);
  const [novoPesoGramas, setNovoPesoGramas] = useState(1);
  const [novoPrecoUnitario, setNovoPrecoUnitario] = useState(0);
  const [margemAlvo, setMargemAlvo] = useState(50);

  // ============================================================
  // TODOS OS INDICADORES DERIVADOS VEM DE UMA UNICA FUNCAO PURA
  // (app/admin-master/cozinha-chef/receitas/_lib/indicadoresReceita.ts)
  // ============================================================
  const {
    custoReceita,
    custoPorUnidade,
    margem,
    lucro,
    porcoes,
    precoVendaValor,
    precoSugeridoValor,
    faturamentoTotal,
    lucroPorPorcao,
    margemBadge,
    precoSugeridoCalculado,
    cenarios,
    rankingIngredientes,
    listaCompras,
    pesoTotalGramas,
    pesoMetaFinal,
    progresso,
    corBarra,
  } = calcularIndicadoresReceita(receita, ingredientesDisponiveis, margemAlvo);

  const handleImagemSelecionada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!receita.id) {
      toast.error('Nao foi possivel identificar a receita para anexar a imagem.');
      return;
    }
    setEnviandoImagem(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('recipeId', receita.id);
      const response = await fetch('/api/upload/recipe', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success && result.imageUrl) {
        onChange({ ...receita, imagem: result.imageUrl, images: [result.imageUrl] });
        toast.success('Imagem enviada com sucesso!');
      } else {
        toast.error('Erro ao enviar imagem.');
      }
    } catch (error) {
      toast.error('Erro ao enviar imagem.');
    } finally {
      setEnviandoImagem(false);
    }
  };

  const handleUnidadeUsoChange = (valor: string) => {
    setNovaUnidadeUso(valor);
    if (valor.trim().toLowerCase() === 'un') {
      setNovoPesoGramas(50);
    } else {
      setNovoPesoGramas(1);
    }
  };

  const resetModal = () => {
    setModalAberto(false);
    setNovoNome('');
    setNovaUnidadeCompra('kg');
    setNovaUnidadeUso('g');
    setNovoFatorConversao(1000);
    setNovoPesoGramas(1);
    setNovoPrecoUnitario(0);
  };

  const handleCriarIngrediente = async () => {
    if (!novoNome.trim()) {
      toast.error('Informe o nome do ingrediente.');
      return;
    }
    setCriandoIngrediente(true);
    try {
      await onCriarIngrediente({
        nome: novoNome.trim(),
        unidade: novaUnidadeCompra.trim() || 'un',
        unidade_uso: novaUnidadeUso.trim() || 'un',
        fator_conversao: toNumber(novoFatorConversao, 1),
        peso_gramas_unidade_uso: toNumber(novoPesoGramas, 1),
        preco_unitario: toNumber(novoPrecoUnitario, 0),
      });
      toast.success('Ingrediente criado no estoque.');
      resetModal();
    } catch (error) {
      toast.error('Erro ao criar ingrediente.');
    } finally {
      setCriandoIngrediente(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin-master/cozinha-chef/receitas"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Voltar
          </Link>
          <button
            onClick={() => void onEnviarListaCompras(listaCompras.itens, listaCompras.total)}
            disabled={listaCompras.itens.length === 0}
            className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Enviar para Lista de Compras
          </button>
          <button
            onClick={() => void onSalvar()}
            disabled={salvando}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar Receita'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <h2 className="font-semibold">Dados Basicos</h2>

          <label className="block text-sm">
            Nome
            <input
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              value={receita.nome}
              onChange={(e) => onChange({ ...receita, nome: e.target.value })}
            />
          </label>

          <label className="block text-sm">
            Categoria
            <input
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              value={receita.categoria}
              onChange={(e) => onChange({ ...receita, categoria: e.target.value })}
            />
          </label>

          <label className="block text-sm">
            Descricao
            <textarea
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              value={receita.descricao}
              onChange={(e) => onChange({ ...receita, descricao: e.target.value })}
            />
          </label>

          <div className="block text-sm">
            <span>Imagem</span>
            <div className="mt-1 flex items-center gap-3">
              <div className="w-24 h-24 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                {receita.imagem ? (
                  <img src={receita.imagem} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">Sem imagem</span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="imagemReceitaInput"
                  className="hidden"
                  onChange={handleImagemSelecionada}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('imagemReceitaInput')?.click()}
                  disabled={enviandoImagem}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  {enviandoImagem ? 'Enviando...' : 'Localizar imagem'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              Porcoes
              <input
                type="number"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={toNumber(receita.porcoes, 0)}
                onChange={(e) => onChange({ ...receita, porcoes: toNumber(e.target.value, 0), rendimento: toNumber(e.target.value, 0) })}
              />
            </label>

            <label className="block text-sm">
              Peso final do produto (g)
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={receita.peso_final ?? ''}
                onChange={(e) =>
                  onChange({
                    ...receita,
                    peso_final: e.target.value === '' ? null : toNumber(e.target.value, 0),
                  })
                }
                placeholder="Ex: 1200"
              />
            </label>

            <label className="block text-sm">
              Status
              <select
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={receita.status}
                onChange={(e) => onChange({ ...receita, status: e.target.value as 'ativo' | 'inativo' })}
              >
                <option value="ativo">ativo</option>
                <option value="inativo">inativo</option>
              </select>
            </label>

            <label className="block text-sm">
              Preco venda
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={toNumber(receita.preco_venda, 0)}
                onChange={(e) => onChange({ ...receita, preco_venda: toNumber(e.target.value, 0), preco_sugerido: toNumber(e.target.value, 0) })}
              />
            </label>

            <label className="block text-sm">
              Preco sugerido
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={toNumber(receita.preco_sugerido, 0)}
                onChange={(e) => onChange({ ...receita, preco_sugerido: toNumber(e.target.value, 0) })}
              />
            </label>

            <label className="block text-sm">
              Custos extras por porcao (R$)
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={toNumber(receita.custos_extras_unitario, 0)}
                onChange={(e) => onChange({ ...receita, custos_extras_unitario: toNumber(e.target.value, 0) })}
                placeholder="Embalagem, gas, mao de obra..."
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-semibold">Indicadores Financeiros</h2>
            <span className={`text-xs px-2 py-1 rounded-full border ${margemBadge.cor}`}>
              {margem.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">{margemBadge.texto}</p>

          <div className="flex items-center gap-2 text-sm border-b border-gray-100 pb-3 mb-3">
            <label className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
              Margem-alvo
              <input
                type="number"
                step="1"
                className="w-14 border border-gray-300 rounded px-1 py-0.5"
                value={margemAlvo}
                onChange={(e) => setMargemAlvo(toNumber(e.target.value, 0))}
              />
              %
            </label>
            <span className="text-gray-400">{'->'}</span>
            <span className="font-medium">R$ {precoSugeridoCalculado.toFixed(2)}</span>
            <button
              type="button"
              className="ml-auto text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-100"
              onClick={() => onChange({ ...receita, preco_sugerido: Number(precoSugeridoCalculado.toFixed(2)) })}
            >
              Usar sugestao
            </button>
          </div>

          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Por porcao (padrao)</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Custo por porcao</span><span>R$ {custoPorUnidade.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Preco sugerido</span><span>R$ {precoSugeridoValor.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Preco venda</span><span>R$ {precoVendaValor.toFixed(2)}</span></div>
            <div className="flex justify-between">
              <span>Lucro por porcao</span>
              <span className={lucroPorPorcao < 0 ? 'text-red-600 font-semibold' : ''}>R$ {lucroPorPorcao.toFixed(2)}</span>
            </div>
            <div className="flex justify-between"><span>Margem percentual</span><span>{margem.toFixed(2)}%</span></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-xl p-5 mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Producao total</span>
          <span className="text-lg font-bold">{porcoes} {porcoes === 1 ? 'porcao' : 'porcoes'}</span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Custo total</span>
          <span className="text-lg font-bold">R$ {custoReceita.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Faturamento total</span>
          <span className="text-lg font-bold">R$ {faturamentoTotal.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Lucro total</span>
          <span className={`text-xl font-bold ${lucro < 0 ? 'text-red-400' : 'text-emerald-400'}`}>R$ {lucro.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
        <h2 className="font-semibold mb-3">Ingredientes</h2>

        <div className="flex flex-wrap items-stretch gap-3 mb-4">
          <select
            id="ingredienteId"
            className="border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[200px]"
            defaultValue=""
          >
            <option value="">Selecione ingrediente</option>
            {ingredientesDisponiveis.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.nome} (R$ {toNumber(ing.preco_unitario, 0).toFixed(2)}/{ing.unidade})
              </option>
            ))}
          </select>
          <input
            id="ingredienteQtd"
            type="number"
            step="0.01"
            placeholder="Quantidade"
            className="border border-gray-300 rounded-lg px-3 py-2 w-32"
          />
          <input
            id="ingredienteUn"
            placeholder="Unidade"
            className="border border-gray-300 rounded-lg px-3 py-2 w-28"
          />
          <button
            className="bg-green-600 text-white rounded-lg px-3 py-2 hover:bg-green-700 whitespace-nowrap"
            onClick={() => {
              const idInput = document.getElementById('ingredienteId') as HTMLSelectElement | null;
              const qtdInput = document.getElementById('ingredienteQtd') as HTMLInputElement | null;
              const unInput = document.getElementById('ingredienteUn') as HTMLInputElement | null;

              const ingredienteId = idInput?.value || '';
              if (!ingredienteId) return;

              const ingrediente = ingredientesDisponiveis.find((i) => i.id === ingredienteId);
              if (!ingrediente) return;

              onAdicionarIngrediente({
                ingrediente_id: ingrediente.id,
                quantidade: toNumber(qtdInput?.value, 0),
                unidade: (unInput?.value || ingrediente.unidade_uso || ingrediente.unidade || 'un').trim(),
              });

              if (idInput) idInput.value = '';
              if (qtdInput) qtdInput.value = '';
              if (unInput) unInput.value = '';
            }}
          >
            Adicionar
          </button>
          <button
            type="button"
            className="bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 whitespace-nowrap"
            onClick={() => setModalAberto(true)}
          >
            + Novo ingrediente
          </button>
        </div>

        <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
          {(receita.ingredientes || []).map((ing, index) => {
            const disponivel = ingredientesDisponiveis.find((i) => i.id === ing.ingrediente_id);
            const fator = toNumber(disponivel?.fator_conversao, 1);
            const quantidadeCompra = fator > 0 ? toNumber(ing.quantidade, 0) / fator : null;

            return (
              <div key={`${ing.ingrediente_id}-${index}`} className="flex justify-between items-center px-3 py-1.5">
                <div className="text-sm leading-tight">
                  <span className="font-medium">{ing.ingrediente_nome}</span>
                  <span className="text-gray-500">
                    {' — '}{toNumber(ing.quantidade, 0)} {ing.unidade} • R$ {toNumber(ing.custo_unitario, 0).toFixed(2)}/un • R$ {toNumber(ing.custo_total, 0).toFixed(2)} total
                    {disponivel && quantidadeCompra !== null && disponivel.unidade !== ing.unidade && (
                      <span className="text-gray-400"> ({quantidadeCompra.toFixed(3)} {disponivel.unidade})</span>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => onRemoverIngrediente(index)}
                  className="text-red-600 hover:text-red-800 text-xs shrink-0 ml-2"
                >
                  Remover
                </button>
              </div>
            );
          })}
        </div>

        {pesoMetaFinal > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="font-semibold">Progresso do peso final</span>
              <span>
                {pesoTotalGramas.toFixed(0)} g / {pesoMetaFinal.toFixed(0)} g ({progresso.percentual.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${corBarra} transition-all rounded-full`}
                style={{ width: `${Math.min(progresso.percentual, 100)}%` }}
              />
            </div>
            {progresso.falta > 0 && (
              <p className="text-xs text-gray-500 mt-1">Faltam {progresso.falta.toFixed(0)} g para atingir a meta.</p>
            )}
            {progresso.sobrando > 0 && (
              <p className="text-xs text-red-500 mt-1">{progresso.sobrando.toFixed(0)} g acima da meta.</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
        <h2 className="font-semibold mb-3">Painel Executivo</h2>

        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Cenarios de preco (por porcao)</h3>
        <div className="border border-gray-100 rounded-lg overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-1.5 font-medium text-gray-500">Cenario</th>
                <th className="text-right px-3 py-1.5 font-medium text-gray-500">Preco</th>
                <th className="text-right px-3 py-1.5 font-medium text-gray-500">Lucro</th>
                <th className="text-right px-3 py-1.5 font-medium text-gray-500">Margem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cenarios.map((c) => (
                <tr key={c.nome}>
                  <td className="px-3 py-1.5">{c.nome}</td>
                  <td className="px-3 py-1.5 text-right">R$ {c.preco.toFixed(2)}</td>
                  <td className={`px-3 py-1.5 text-right ${c.lucroPorcao < 0 ? 'text-red-600' : ''}`}>
                    R$ {c.lucroPorcao.toFixed(2)}
                  </td>
                  <td className="px-3 py-1.5 text-right">{c.margemPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Ranking de custo por ingrediente</h3>
        <div className="border border-gray-100 rounded-lg overflow-hidden mb-4 divide-y divide-gray-100">
          {rankingIngredientes.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">Nenhum ingrediente adicionado.</div>
          ) : (
            rankingIngredientes.map((item) => (
              <div key={item.ingredienteId} className="px-3 py-1.5 text-sm">
                <div className="flex justify-between">
                  <span>{item.nome}</span>
                  <span className="text-gray-500">{item.pct.toFixed(1)}% • R$ {item.custoTotal.toFixed(2)}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${Math.min(item.pct, 100)}%` }} />
                </div>
              </div>
            ))
          )}
        </div>

        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">
          Lista de compras para essa producao ({porcoes} {porcoes === 1 ? 'porcao' : 'porcoes'})
        </h3>
        <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100">
          {listaCompras.itens.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">Nenhum ingrediente adicionado.</div>
          ) : (
            <>
              {listaCompras.itens.map((item, idx) => (
                <div key={idx} className="px-3 py-1.5 text-sm flex justify-between">
                  <span>{item.nome}</span>
                  <span className="text-gray-500">{item.quantidadeCompra.toFixed(3)} {item.unidadeCompra} • R$ {item.custo.toFixed(2)}</span>
                </div>
              ))}
              <div className="px-3 py-1.5 text-sm flex justify-between font-semibold bg-gray-50">
                <span>Total estimado da compra</span>
                <span>R$ {listaCompras.total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Quantidades calculadas para esta producao especifica, sem descontar o que ja existe no estoque.
        </p>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-3">
            <h3 className="font-semibold text-lg">Novo ingrediente no estoque</h3>

            <label className="block text-sm">
              Nome
              <input
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Farinha de trigo"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Unidade de compra
                <input
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={novaUnidadeCompra}
                  onChange={(e) => setNovaUnidadeCompra(e.target.value)}
                  placeholder="kg, L, un"
                />
              </label>
              <label className="block text-sm">
                Unidade usada na receita
                <input
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={novaUnidadeUso}
                  onChange={(e) => handleUnidadeUsoChange(e.target.value)}
                  placeholder="g, ml, un"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                1 {novaUnidadeCompra || 'compra'} = quantos {novaUnidadeUso || 'uso'}
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={novoFatorConversao}
                  onChange={(e) => setNovoFatorConversao(toNumber(e.target.value, 1))}
                />
              </label>
              <label className="block text-sm">
                Peso (g) de 1 {novaUnidadeUso || 'unidade de uso'}
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={novoPesoGramas}
                  onChange={(e) => setNovoPesoGramas(toNumber(e.target.value, 1))}
                />
              </label>
            </div>

            <label className="block text-sm">
              Preco por {novaUnidadeCompra || 'unidade de compra'} (opcional, pode ajustar depois)
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={novoPrecoUnitario}
                onChange={(e) => setNovoPrecoUnitario(toNumber(e.target.value, 0))}
                placeholder="0.00"
              />
            </label>

            <p className="text-xs text-gray-500">
              O fator de conversao vem da embalagem/compra (ex: 1kg = 1000g). O peso em gramas so precisa ser ajustado
              para itens contados em unidades (ex: 1 ovo ~50g) — para itens ja comprados em kg/L, deixe 1.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleCriarIngrediente()}
                disabled={criandoIngrediente}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
              >
                {criandoIngrediente ? 'Criando...' : 'Criar ingrediente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}