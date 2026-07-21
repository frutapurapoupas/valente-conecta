// components/financeiro/CardsResumoFinanceiro.tsx
// ?? DESIGN - Cards de resumo

interface CardsResumoFinanceiroProps {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  margem: number;
}

export default function CardsResumoFinanceiro({
  totalReceitas,
  totalDespesas,
  saldo,
  margem,
}: CardsResumoFinanceiroProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-center">
        <p className="text-sm text-gray-400">Total Receitas</p>
        <p className="text-2xl font-bold text-green-400">R$ {totalReceitas.toFixed(2)}</p>
      </div>
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-center">
        <p className="text-sm text-gray-400">Total Despesas</p>
        <p className="text-2xl font-bold text-red-400">R$ {totalDespesas.toFixed(2)}</p>
      </div>
      <div className={`rounded-xl border p-4 text-center ${
        saldo >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
      }`}>
        <p className="text-sm text-gray-400">Saldo</p>
        <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          R$ {saldo.toFixed(2)}
        </p>
      </div>
      <div className={`rounded-xl border p-4 text-center ${
        margem >= 30 ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
      }`}>
        <p className="text-sm text-gray-400">Margem</p>
        <p className={`text-2xl font-bold ${margem >= 30 ? 'text-green-400' : 'text-yellow-400'}`}>
          {margem.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

