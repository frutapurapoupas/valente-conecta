'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { ArrowLeft, RefreshCw, Landmark, ArrowDownCircle, ArrowUpCircle, FileText, Gift, CreditCard, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { gerarSessaoTemp, isSessaoTempValida } from '@/lib/auth';

type TipoLancamento = 'credito_mc' | 'debito_mc' | 'bonus_indicacao' | 'pagamento_plano' | 'cashback' | 'estorno';

type ExtratoLine = {
  id: string;
  tipo: TipoLancamento;
  valor: number;
  descricao: string;
  origem: string;
  status: 'concluida' | 'pendente' | 'cancelada';
  createdAt: string;
  direction: 'credito' | 'debito';
  runningBalance: number;
};

const TIPO_LABEL: Record<TipoLancamento, string> = {
  credito_mc: 'Transferencia recebida',
  debito_mc: 'Transferencia enviada',
  bonus_indicacao: 'Bonus de indicacao',
  pagamento_plano: 'Pagamento de plano',
  cashback: 'Cashback / reembolso',
  estorno: 'Estorno'
};

const TIPO_ICON: Record<TipoLancamento, JSX.Element> = {
  credito_mc: <ArrowDownCircle size={14} className="text-emerald-500" />,
  debito_mc: <ArrowUpCircle size={14} className="text-rose-500" />,
  bonus_indicacao: <Gift size={14} className="text-yellow-400" />,
  pagamento_plano: <CreditCard size={14} className="text-blue-400" />,
  cashback: <Star size={14} className="text-purple-400" />,
  estorno: <ArrowDownCircle size={14} className="text-cyan-400" />
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ExtratoPage() {
  const router = useRouter();
  const { user } = useApp();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ExtratoLine[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'creditos' | 'debitos' | 'bonus'>('todos');

  const actorId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const session = localStorage.getItem('sessao_temp_id') || '';
    if (user?.id) return String(user.id);
    if (session && isSessaoTempValida()) return session;
    return gerarSessaoTemp();
  }, [user]);

  const cidadeBase = useMemo(() => {
    if (typeof window === 'undefined') return 'VALENTE';
    return String((user as any)?.cidade || localStorage.getItem('usuario_cidade_base') || 'VALENTE').toUpperCase();
  }, [user]);

  const titular = useMemo(() => String(user?.nome || 'Conta Conecta Visitante'), [user]);

  const carregarExtrato = async () => {
    if (!actorId) return;
    setLoading(true);
    try {
      const mcRes = await fetch(
        `/api/moeda-conecta/transactions?userId=${encodeURIComponent(actorId)}&cidadeBase=${encodeURIComponent(cidadeBase)}&limit=300`,
        { cache: 'no-store' }
      );
      const mcData = await mcRes.json();
      const mcRaw = Array.isArray(mcData?.data) ? mcData.data : [];

      let bonusLines: ExtratoLine[] = [];
      try {
        const bonusRes = await fetch(`/api/referrals/payout-requests?userId=${encodeURIComponent(actorId)}`, { cache: 'no-store' });
        const bonusData = await bonusRes.json();
        if (Array.isArray(bonusData?.data)) {
          bonusLines = bonusData.data.map((item: any) => ({
            id: `bonus_${item.id || item.createdAt}`,
            tipo: 'bonus_indicacao' as TipoLancamento,
            valor: Number(item.valor || item.amount || 0),
            descricao: item.descricao || `Bonus indicacao #${item.id}`,
            origem: 'referral',
            status: item.status === 'pago' ? 'concluida' : 'pendente',
            createdAt: item.createdAt || item.created_at || new Date().toISOString(),
            direction: 'credito' as const,
            runningBalance: 0
          })).filter((line: ExtratoLine) => line.valor > 0);
        }
      } catch {
        // Bonus opcional.
      }

      const mcLines: ExtratoLine[] = mcRaw.map((item: any) => {
        const isCred = item.destinatarioId === actorId;
        return {
          id: item.id,
          tipo: (isCred ? 'credito_mc' : 'debito_mc') as TipoLancamento,
          valor: Number(item.valor || 0),
          descricao: item.descricao || 'Transferencia Conta Conecta',
          origem: isCred ? item.remetenteNome || 'Remetente' : item.destinatarioQr || 'Destinatario',
          status: item.status || 'concluida',
          createdAt: item.createdAt,
          direction: isCred ? 'credito' : 'debito',
          runningBalance: 0
        };
      });

      const all = [...mcLines, ...bonusLines].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

      let saldo = 0;
      const withBalance = all.map((line) => {
        saldo += line.direction === 'credito' ? line.valor : -line.valor;
        return { ...line, runningBalance: Number(saldo.toFixed(2)) };
      });

      setItems(withBalance.reverse());
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Erro ao carregar extrato');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarExtrato();
  }, [actorId, cidadeBase]);

  const filtrados = useMemo(() => {
    if (filtro === 'creditos') return items.filter((line) => line.direction === 'credito');
    if (filtro === 'debitos') return items.filter((line) => line.direction === 'debito');
    if (filtro === 'bonus') return items.filter((line) => line.tipo === 'bonus_indicacao');
    return items;
  }, [items, filtro]);

  const totalCreditos = useMemo(() => items.filter((line) => line.direction === 'credito').reduce((sum, line) => sum + line.valor, 0), [items]);
  const totalDebitos = useMemo(() => items.filter((line) => line.direction === 'debito').reduce((sum, line) => sum + line.valor, 0), [items]);
  const totalBonus = useMemo(() => items.filter((line) => line.tipo === 'bonus_indicacao').reduce((sum, line) => sum + line.valor, 0), [items]);
  const saldoFinal = items.length > 0 ? items[0].runningBalance : 0;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-3 shadow">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white flex items-center gap-2 text-sm font-medium">
            <ArrowLeft size={16} /> Voltar
          </button>
          <h1 className="text-white font-bold">Extrato Conta Conecta</h1>
          <button onClick={carregarExtrato} className="text-white/90 hover:text-white">
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4 pb-10">
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Landmark size={16} className="text-emerald-600" />
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Banco Conecta Digital</p>
              </div>
              <p className="font-bold text-slate-800 text-lg">{titular}</p>
              <p className="text-xs text-slate-500">Conta MC Â· {actorId.slice(0, 16)}...</p>
              <p className="text-xs text-slate-400">Cidade: {cidadeBase}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Saldo disponivel</p>
              <p className={`text-2xl font-extrabold ${saldoFinal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {saldoFinal >= 0 ? '+' : ''}{saldoFinal.toFixed(2)} MC
              </p>
              <p className="text-[10px] text-slate-400">Moeda Conecta</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center">
              <p className="text-[10px] text-emerald-700 font-medium">Total creditos</p>
              <p className="font-bold text-emerald-700 text-sm">+{totalCreditos.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-center">
              <p className="text-[10px] text-rose-700 font-medium">Total debitos</p>
              <p className="font-bold text-rose-700 text-sm">-{totalDebitos.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-2.5 text-center">
              <p className="text-[10px] text-yellow-700 font-medium">Bonus recebidos</p>
              <p className="font-bold text-yellow-700 text-sm">+{totalBonus.toFixed(2)}</p>
            </div>
          </div>
        </section>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['todos', 'creditos', 'debitos', 'bonus'] as const).map((current) => (
            <button
              key={current}
              onClick={() => setFiltro(current)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                filtro === current
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-white border border-slate-300 text-slate-600 hover:border-emerald-400'
              }`}
            >
              {current === 'todos' ? 'Todos' : current === 'creditos' ? 'Creditos' : current === 'debitos' ? 'Debitos' : 'Bonus'}
            </button>
          ))}
        </div>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-slate-600" />
              <p className="font-semibold text-slate-700 text-sm">Lancamentos bancarios</p>
            </div>
            <p className="text-xs text-slate-500">{filtrados.length} registros</p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mb-2" />
              <p className="text-sm">Carregando extrato...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <FileText className="mx-auto mb-2 text-slate-300" size={28} />
              <p className="text-sm">Nenhum lancamento encontrado.</p>
              <p className="text-xs mt-1 text-slate-400">Realize uma transacao para ver aqui.</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-3 py-2.5">Data / Hora</th>
                      <th className="text-left px-3 py-2.5">Historico</th>
                      <th className="text-left px-3 py-2.5">Origem / Destino</th>
                      <th className="text-left px-3 py-2.5">Tipo</th>
                      <th className="text-right px-3 py-2.5 text-emerald-700">Credito</th>
                      <th className="text-right px-3 py-2.5 text-rose-700">Debito</th>
                      <th className="text-right px-3 py-2.5">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((line) => (
                      <tr key={line.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap text-xs">{formatDate(line.createdAt)}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            {TIPO_ICON[line.tipo]}
                            <span className="text-slate-700 text-xs">{line.descricao}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 ml-5">{TIPO_LABEL[line.tipo]}</p>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[120px] truncate">{line.origem}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            line.status === 'concluida'
                              ? 'bg-emerald-100 text-emerald-700'
                              : line.status === 'pendente'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {line.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-emerald-700 whitespace-nowrap text-xs">
                          {line.direction === 'credito' ? `+${line.valor.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-rose-700 whitespace-nowrap text-xs">
                          {line.direction === 'debito' ? `-${line.valor.toFixed(2)}` : '-'}
                        </td>
                        <td className={`px-3 py-2.5 text-right font-bold whitespace-nowrap text-xs ${line.runningBalance >= 0 ? 'text-slate-700' : 'text-rose-700'}`}>
                          {line.runningBalance.toFixed(2)} MC
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-slate-100">
                {filtrados.map((line) => (
                  <div key={line.id} className="px-4 py-3 flex items-start gap-3">
                    <div className="mt-0.5">{TIPO_ICON[line.tipo]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 text-sm font-medium truncate">{line.descricao}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{TIPO_LABEL[line.tipo]} Â· {line.origem}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(line.createdAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm ${line.direction === 'credito' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {line.direction === 'credito' ? '+' : '-'}{line.valor.toFixed(2)} MC
                      </p>
                      <p className="text-[10px] text-slate-400">Saldo {line.runningBalance.toFixed(2)}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        line.status === 'concluida'
                          ? 'bg-emerald-100 text-emerald-600'
                          : line.status === 'pendente'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                      }`}>
                        {line.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

