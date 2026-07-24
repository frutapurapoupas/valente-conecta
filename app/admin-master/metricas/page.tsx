"use client";

interface DemandViewProps {
  category: string;
  title: string;
  children?: React.ReactNode;
}

function DemandView({ category, title, children }: DemandViewProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">Categoria: {category}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Solicitação</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-green-600">Ativo</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Prioridade</p>
              <p className="font-medium text-orange-600">Média</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Descrição</p>
            <p className="font-medium text-gray-800 mt-1">
              Solicitação para {category.toLowerCase()}
            </p>
          </div>
          {children}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Aprovar
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              Rejeitar
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
              Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MetricasPage() {
  return <DemandView category="Métricas" title="Métricas Gerais" />;
}