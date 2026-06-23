// components/financeiro/FiltrosFinanceiro.tsx
// 🎨 DESIGN - Filtros do financeiro

import { opcoesPeriodo, opcoesTipo } from '@/utils/financeiroUtils';

interface FiltrosFinanceiroProps {
  filtroPeriodo: string;
  filtroTipo: string;
  totalRegistros: number;
  onPeriodoChange: (value: string) => void;
  onTipoChange: (value: string) => void;
}

export default function FiltrosFinanceiro({
  filtroPeriodo,
  filtroTipo,
  totalRegistros,
  onPeriodoChange,
  onTipoChange,
}: FiltrosFinanceiroProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 bg-gray-800/30 rounded-xl border border-gray-700 p-3">
      <span className="text-sm text-gray-400">📊 Filtros:</span>
      <select
        value={filtroPeriodo}
        onChange={(e) => onPeriodoChange(e.target.value)}
        className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:border-green-500 focus:outline-none"
      >
        {opcoesPeriodo.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>
      <select
        value={filtroTipo}
        onChange={(e) => onTipoChange(e.target.value)}
        className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:border-green-500 focus:outline-none"
      >
        {opcoesTipo.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>
      <span className="text-xs text-gray-500 ml-auto">
        {totalRegistros} registros
      </span>
    </div>
  );
}
