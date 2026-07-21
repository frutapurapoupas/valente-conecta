'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useReceita from '../../hooks/useReceita';
import { ReceitaCanonicaCompat } from '@/types/receita-canonica';
import { calcularFinanceiroReceita } from '../../services/custoService';
import ReceitaFormularioCanonico from '../_components/ReceitaFormularioCanonico';

function baseReceita(): ReceitaCanonicaCompat {
  const now = new Date().toISOString();
  return {
    id: '',
    nome: '',
    descricao: '',
    categoria: 'Geral',
    imagem: null,
    status: 'ativo',
    ingredientes: [],
    rendimento: 1,
    peso_final: null,
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

        const custoUnitario = Number(ingrediente.preco_unitario || 0);
        const quantidade = Number(item.quantidade || 0);

        adicionarIngrediente({
          ingrediente_id: String(ingrediente.id),
          ingrediente_nome: String(ingrediente.nome || ''),
          quantidade,
          unidade: item.unidade || ingrediente.unidade || 'un',
          custo_total: quantidade * custoUnitario,
        });
      }}
      onRemoverIngrediente={(index) => removerIngrediente(index)}
      onSalvar={async () => {
        const result = await salvarReceita();
        if (result.success) {
          router.push('/admin-master/cozinha-chef/receitas');
        }
      }}
    />
  );
}
