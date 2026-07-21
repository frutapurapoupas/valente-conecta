// app/empregos/components/EmpregosStats.tsx

interface Estatisticas {
  total: number;
  abertas: number;
  emAndamento: number;
  fechadas: number;
  totalCandidatos: number;
  mediaCandidatos: number;
}

interface EmpregosStatsProps {
  estatisticas: Estatisticas;
}

// ============================================================================
// COMPONENTE DE DESIGN - APENAS UI
// ============================================================================

export function EmpregosStats({ estatisticas }: EmpregosStatsProps) {
  const stats = [
    { label: "Total de Vagas", value: estatisticas.total, gradient: "from-blue-500 to-indigo-500" },
    { label: "Abertas", value: estatisticas.abertas, gradient: "from-green-500 to-emerald-500" },
    { label: "Em Andamento", value: estatisticas.emAndamento, gradient: "from-yellow-500 to-orange-500" },
    { label: "Candidatos", value: estatisticas.totalCandidatos, gradient: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-gradient-to-r ${stat.gradient} rounded-2xl p-4 text-white text-center`}
        >
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm opacity-90">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

