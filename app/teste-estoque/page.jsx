// app/teste-estoque/page.jsx
'use client';

import { useEstoque } from '@/hooks/useEstoque';

export default function TesteEstoque() {
  const { ingredientes, loading, error, adicionarItem } = useEstoque();

  if (loading) {
    return <div className="p-8">Carregando estoque...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        <h2>Erro ao carregar estoque</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">📦 Estoque ({ingredientes.length} itens)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ingredientes.map(item => (
          <div key={item.id} className="border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-lg">{item.nome}</h3>
            <p className="text-gray-600">Categoria: {item.categoria}</p>
            <p className="text-gray-600">Quantidade: {item.quantidade} {item.unidade}</p>
            <p className="text-green-600 font-bold">R$ {item.preco.toFixed(2)}</p>
          </div>
        ))}
      </div>
      
      {ingredientes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum ingrediente cadastrado</p>
          <button 
            onClick={() => {
              adicionarItem({
                nome: 'Teste',
                categoria: 'Outros',
                quantidade: 10,
                unidade: 'kg',
                preco: 5.00
              });
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Adicionar item de teste
          </button>
        </div>
      )}
    </div>
  );
}
