'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEditarReceita } from '@/hooks/useEditarReceita';
import { Save, ArrowLeft } from 'lucide-react';

export default function EditarReceitaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { receita, setReceita, loading, salvar } = useEditarReceita(id as string);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!receita) return <div className="p-8 text-center">Receita não encontrada</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="p-2 bg-gray-200 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Editar: {receita.name}</h1>
        <button 
          onClick={() => salvar(receita)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Salvar
        </button>
      </div>

      {/* Renderize os inputs e a tabela de ingredientes aqui */}
      {/* Exemplo: <input value={receita.name} onChange={(e) => setReceita({...receita, name: e.target.value})} ... /> */}
    </div>
  );
}