'use client';

import { useRouter } from 'next/navigation';
import useReceita from '../../../hooks/useReceita';
import { ReceitaCanonicaCompat } from '@/types/receita-canonica';
import { calcularFinanceiroReceita } from '../../../services/custoService';
import ReceitaFormularioCanonico from '../../_components/ReceitaFormularioCanonico';

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

type Props = {
  params: {
    id: string;
  };
};

export default function EditarReceitaPage({ params }: Props) {
  const router = useRouter();
  const {
    receitaCanonica,
    setReceitaCanonica,
    ingredientesDisponiveis,
    adicionarIngrediente,
    removerIngrediente,
    salvarReceita,
    salvando,
    loading,
    error,
  } = useReceita(params.id);

  if (loading || !receitaCanonica) {
    return <div className="p-6">Carregando receita...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Erro: {error}</div>;
  }

  return (
    <ReceitaFormularioCanonico
      titulo="Editar Receita"
      receita={receitaCanonica}
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
