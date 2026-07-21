'use client';

import { useCatalogo, ItemCardapio } from '../../admin-master/cozinha-chef/hooks/useCatalogo';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

function CardItem({ item }: { item: ItemCardapio }) {
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
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors">
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  const router = useRouter();
  const { pratos, sobremesas, loading, perfil, desconto } = useCatalogo();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition mb-4">
          <ArrowLeft size={16} /> Voltar para seleção
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cardápio Chef Neide</h1>
        <p className="text-gray-600 mb-6">Exibindo preços para o perfil: <span className="font-semibold text-orange-600 capitalize">{perfil}</span> {desconto > 0 && `(${desconto}% OFF)`}</p>

        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-orange-500 pb-2 mb-4">Pratos do Dia</h2>
        {pratos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">Nenhum prato disponível hoje.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pratos.map((item) => <CardItem key={item.id} item={item} />)}
          </div>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-purple-500 pb-2 my-8">Sobremesas e Lanches</h2>
        {sobremesas.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">Nenhuma sobremesa disponível.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sobremesas.map((item) => <CardItem key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}

