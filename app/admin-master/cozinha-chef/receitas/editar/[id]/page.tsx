'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
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
    carregarIngredientes,
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

        const quantidade = Number(item.quantidade || 0);
        const precoUnitario = Number(ingrediente.preco_unitario || 0);
        // fator_conversao = quantas unidades de uso (g/ml) cabem em 1 unidade de compra (kg/L)
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
      onAdicionarIngredienteDireto={(item) => adicionarIngrediente(item)}
      onCriarIngrediente={async (novo) => {
        const response = await fetch('/api/cozinha/estoque', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: novo.nome,
            categoria: novo.categoria,
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
        return { id: String(result.data.id) };
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
              receita_id: receitaCanonica.id,
              receita_nome: receitaCanonica.nome,
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