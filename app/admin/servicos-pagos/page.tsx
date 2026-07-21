"use client";

import { useBeneficios } from "@/modules/admin";

// Por enquanto, reutilizando o hook de benefícios para serviços pagos
// TODO: Criar hook específico useServicosPagos()

export default function ServicosPagosPage() {
  const { data, loading, error } = useBeneficios();

  if (loading) return <div className="p-6">Carregando...</div>;
  if (error) return <div className="p-6 text-red-600">Erro: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Serviços Pagos</h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800">⚠️ Em desenvolvimento - Serviços pagos em breve</p>
      </div>
      <div className="grid gap-4">
        {data?.slice(0, 3).map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">{item.nome}</h3>
            <p className="text-sm text-gray-600">{item.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
