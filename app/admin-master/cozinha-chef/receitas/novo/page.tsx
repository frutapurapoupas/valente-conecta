'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useReceita from '../../hooks/useReceita';
import { ReceitaCanonicaCompat } from '@/types/receita-canonica';
import { calcularFinanceiroReceita } from '../../services/custoService';
import ReceitaFormularioCanonico from '../_components/ReceitaFormularioCanonico';

function baseReceita(): ReceitaCanonicaCompat {
  const now = new Date().toISOString();
  return {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'tmp-' + Date.now(),
    nome: '',
    descricao: '',
    categoria: 'Geral',
    imagem: null,
    status: 'ativo',
    ingredientes: [],
    rendimento: 1,
    peso_final: null,
    custos_extras_unitario: 0,
    porcoes: 1,
    custo_receita: 0,
    custo_por_unidade: 0,
    margem_percentual: 0,
    lucro: 0,
    preco_sugerido: 0,
    preco_venda: 0,
    integracoes: {
      catalogo: false,
      cardapio: false,
      producao: false,
      estoque: false,
      compras: false,
    },
    created_at: now,
    updated_at: now,
    preco: 0,
    custo_total: 0,
    margem: 0,
    ativo: true,
    images: [],
    ingredients: [],
    servings: 1,
    isAvailable: true,
  };
}

function recalcular(receita: ReceitaCanonicaCompat): ReceitaCanonicaCompat {
  const financeiro = calcularFinanceiroReceita({
    ingredientes: receita.ingredientes,
    porcoes: receita.porcoes,
    preco_venda: receita.preco_venda,
    preco_sugerido: receita.preco_sugerido,
    custo_receita: receita.custo_receita,
  });

  return {
    ...receita,
    ...financeiro,
    rendimento: receita.rendimento || financeiro.porcoes,
    updated_at: new Date().toISOString(),
  };
}

export default function NovaReceitaPage() {
  const router = useRouter();
  const {
    receitaCanonica,
    setReceitaCanonica,
    ingredientesDisponiveis,
    carregarIngredientes,
    adicionarIngrediente,
    removerIngrediente,
    salvarReceita,
    salvando,
  } = useReceita();

  useEffect(() => {
    if (!receitaCanonica) {
      setReceitaCanonica(baseReceita());
    }
  }, [receitaCanonica, setReceitaCanonica]);

  const receita = receitaCanonica || baseReceita();

  return (
    <ReceitaFormularioCanonico
      titulo="Nova Receita"
      receita={receita}
      ingredientesDisponiveis={ingredientesDisponiveis || []}
      salvando={salvando}
      onChange={(next) => setReceitaCanonica(recalcular(next))}
      onAdicionarIngrediente={(item) => {
        const ingrediente = (ingredientesDisponiveis || []).find((ing: any) => String(ing.id) === String(item.ingrediente_id));
        if (!ingrediente) return;

        const quantidade = Number(item.quantidade || 0);
        const precoUnitario = Number(ingrediente.preco_unitario || 0);
        // fator_conversao = quantas unidades de uso (g/ml) cabem em 1 unidade de compra (kg/L)
        // ex: farinha comprada em kg (fator 1000) usada em g -> custo por grama = preco_unitario / 1000
        const fatorConversao = Number(ingrediente.fator_conversao || 1);
        const custoPorUnidadeUso = fatorConversao > 0 ? precoUnitario / fatorConversao : precoUnitario;

        adicionarIngrediente({
          ingrediente_id: String(ingrediente.id),
          ingrediente_nome: String(ingrediente.nome || ''),
          quantidade,
          unidade: item.unidade || ingrediente.unidade_uso || ingrediente.unidade || 'un',
          custo_total: quantidade * custoPorUnidadeUso,
        });
      }}
      onRemoverIngrediente={(index) => removerIngrediente(index)}
      onCriarIngrediente={async (novo) => {
        const response = await fetch('/api/cozinha/estoque', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: novo.nome,
            categoria: 'Geral',
            quantidade: 0,
            unidade: novo.unidade,
            unidade_uso: novo.unidade_uso,
            fator_conversao: novo.fator_conversao,
            peso_gramas_unidade_uso: novo.peso_gramas_unidade_uso,
            preco_unitario: novo.preco_unitario,
            quantidade_minima: 0,
          }),
        });
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Erro ao criar ingrediente');
        }
        await carregarIngredientes();
      }}
      onSalvar={async () => {
        const result = await salvarReceita();
        if (result.success) {
          router.push('/admin-master/cozinha-chef/receitas');
        }
      }}
      onEnviarListaCompras={async (itens, total) => {
        try {
          const response = await fetch('/api/cozinha/lista-compras', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuario_id: 'admin-teste', // TODO: substituir quando o login for implementado
              receita_id: receita.id,
              receita_nome: receita.nome,
              itens,
              total,
            }),
          });
          const result = await response.json();
          if (result.success) {
            toast.success('Lista de compras gerada com sucesso!');
          } else {
            toast.error('Erro ao gerar lista de compras.');
          }
        } catch {
          toast.error('Erro ao gerar lista de compras.');
        }
      }}
    />
  );
}