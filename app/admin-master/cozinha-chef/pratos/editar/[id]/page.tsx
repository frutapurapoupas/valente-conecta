// app/admin-master/cozinha-chef/pratos/editar/[id]/page.tsx

"use client";

import { useParams, useRouter } from 'next/navigation';
import { usePratoForm } from '@/hooks/cozinha/usePratoForm';
import { PratoForm } from '@/components/cozinha/PratoForm';

export default function EditarPratoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string || '';

  const {
    formData,
    ingredientesDisponiveis,
    loading,
    salvando,
    error,
    margem,
    calcularCustoTotal,
    atualizarCampo,
    adicionarIngrediente,
    removerIngrediente,
    atualizarQuantidadeIngrediente,
    salvarPrato
  } = usePratoForm(id);

  const handleSalvar = async () => {
    const result = await salvarPrato();
    if (result.success) {
      router.push('/admin-master/cozinha-chef/pratos');
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">❌ ID não informado</h1>
          <button
            onClick={() => router.push('/admin-master/cozinha-chef/pratos')}
            className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white transition"
          >
            Voltar para lista de pratos
          </button>
        </div>
      </div>
    );
  }

  return (
    <PratoForm
      formData={formData}
      ingredientesDisponiveis={ingredientesDisponiveis}
      loading={loading}
      salvando={salvando}
      error={error}
      margem={margem}
      custoTotal={calcularCustoTotal()}
      onAtualizarCampo={atualizarCampo}
      onAdicionarIngrediente={adicionarIngrediente}
      onRemoverIngrediente={removerIngrediente}
      onAtualizarQuantidade={atualizarQuantidadeIngrediente}
      onSalvar={handleSalvar}
      isEdit={true}
    />
  );
}