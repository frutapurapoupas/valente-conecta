'use client';

export const dynamic = 'force-dynamic';

// Caminho: C:\valente_conecta\app\extrato\page.tsx
//
// Extrato real da Moeda Conecta. Antes usava useApp().user (AppContext),
// que nunca e' preenchido nesse projeto (nao ha' login real ligado a ele —
// mesmo problema ja documentado em app/qr-code/page.tsx) e recalculava o
// saldo somando tudo no navegador a cada carregamento. Agora usa
// getCurrentUser() (identidade real do cadastro) e o saldo vem pronto de
// /api/moeda-conecta/saldo (autoritativo, guardado no banco).

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Landmark, ArrowDownCircle, ArrowUpCircle, FileText, Gift, Clock, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCurrentUser } from '@/lib/auth';

type TipoLinha = 'credito_mc' | 'debito_mc' | 'bonus_indicacao';

type ExtratoLine = {
  id: string;
  tipo: TipoLinha;
  valor: number;
  descricao: string;
  origem: string;
  status: 'concluida' | 'pendente_moderacao' | 'estornada' | 'pendente';
  createdAt: string;
  direction: 'credito' | 'debito';
};

const TIPO_LABEL: Record<TipoLinha, string> = {
  credito_mc: 'Transferência recebida',
  debito_mc: 'Transferência enviada',
  bonus_indicacao: 'Bônus de indicação',
};

const TIPO_ICON: Record<TipoLinha, JSX.Element> = {
  credito_mc: <ArrowDownCircle size={14} className="text-emerald-500" />,
  debito_mc: <ArrowUpCircle size={14} className="text-rose-500" />,
  bonus_indicacao: <Gift size={14} className="text-yellow-400" />,
};

const STATUS_LABEL: Record<string, string> = {
  concluida: 'Concluída',
  pendente_moderacao: 'Aguardando aprovação',
  estornada: 'Estornada',
  pendente: 'Pendente',
};

const STATUS_COR: Record<string, string> = {
  concluida: 'bg-emerald-100 text-emerald-700',
  pendente_moderacao: 'bg-yellow-100 text-yellow-700',
  estornada: 'bg-red-100 text-red-700',
  pendente: 'bg-yellow-100 text-yellow-700',
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function ExtratoPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(0);
  const [moedaConfig, setMoedaConfig] = useState<{ moeda_nome: string; moeda_prefixo: string } | null>(null);
  const [items, setItems] = useState<ExtratoLine[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'creditos' | 'debitos' | 'bonus'>('todos');

  const carregarExtrato = async (u: any) => {
    setLoading(true);
    try {
      const [saldoRes, mcRes] = await Promise.all([
        fetch(`/api/moeda-conecta/saldo?usuarioId=${u.id}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/moeda-conecta/transactions?userId=${u.id}&limit=300`, { cache: 'no-store' }).then((r) => r.json()),
      ]);

      if (saldoRes.success) setSaldo(Number(saldoRes.data.saldo || 0));
      if (u.cidade_base) {
        fetch(`/api/moeda-conecta/cidade-config?cidade=${encodeURIComponent(u.cidade_base)}`)
          .then((r) => r.json())
          .then((res) => res.success && setMoedaConfig(res.data));
      }
      const mcRaw = Array.isArray(mcRes?.data) ? mcRes.data : [];

      let bonusLines: ExtratoLine[] = [];
      try {
        const bonusRes = await fetch(`/api/referrals/payout-requests?userId=${u.id}`, { cache: 'no-store' });
        const bonusData = await bonusRes.json();
        if (Array.isArray(bonusData?.data)) {
          bonusLines = bonusData.data
            .map((item: any) => ({
              id: `bonus_${item.id || item.createdAt}`,
              tipo: 'bonus_indicacao' as TipoLinha,
              valor: Number(item.valor || item.amount || 0),
              descricao: item.descricao || `Bônus indicação #${item.id}`,
              origem: 'Indicação',
              status: item.status === 'pago' ? 'concluida' : 'pendente',
              createdAt: item.createdAt || item.created_at || new Date().toISOString(),
              direction: 'credito' as const,
            }))
            .filter((line: ExtratoLine) => line.valor > 0);
        }
      } catch {
        // Bonus opcional.
      }

      const mcLines: ExtratoLine[] = mcRaw.map((item: any) => {
        const isCred = item.destinatario_id === u.id;
        return {
          id: item.id,
          tipo: (isCred ? 'credito_mc' : 'debito_mc') as TipoLinha,
          valor: Number(item.valor || 0),
          descricao: item.descricao || 'Transferência Moeda Conecta',
          origem: isCred ? item.remetente_nome : item.destinatario_nome,
          status: item.status,
          createdAt: item.created_at,
          direction: isCred ? ('credito' as const) : ('debito' as const),
        };
      });

      const all = [...mcLines, ...bonusLines].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      setItems(all);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Erro ao carregar extrato');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    if (u) carregarExtrato(u);
    else setLoading(false);
  }, []);

  const filtrados = useMemo(() => {
    if (filtro === 'creditos') return items.filter((line) => line.direction === 'credito');
    if (filtro === 'debitos') return items.filter((line) => line.direction === 'debito');
    if (filtro === 'bonus') return items.filter((line) => line.tipo === 'bonus_indicacao');
    return items;
  }, [items, filtro]);

  const totalCreditos = useMemo(
    () => items.filter((l) => l.direction === 'credito' && l.status === 'concluida').reduce((sum, l) => sum + l.valor, 0),
    [items]
  );
  const totalDebitos = useMemo(
    () => items.filter((l) => l.direction === 'debito' && l.status !== 'estornada').reduce((sum, l) => sum + l.valor, 0),
    [items]
  );
  const totalBonus = useMemo(() => items.filter((l) => l.tipo === 'bonus_indicacao').reduce((sum, l) => sum + l.valor, 0), [items]);
  const sigla = moedaConfig?.moeda_prefixo || 'MC';

  if (!loading && !usuario) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-center">
        <div>
          <FileText className="mx-auto mb-3 text-slate-300" size={40} />
          <p className="text-slate-600">Complete seu cadastro pra ver seu extrato.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-3 shadow">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white flex items-center gap-2 text-sm font-medium">
            <ArrowLeft size={16} /> Voltar
          </button>
          <h1 className="text-white font-bold">Extrato {moedaConfig?.moeda_nome || 'Moeda Conecta'}</h1>
          <button onClick={() => usuario && carregarExtrato(usuario)} className="text-white/90 hover:text-white">
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
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Moeda Conecta</p>
              </div>
              <p className="font-bold text-slate-800 text-lg">{usuario?.nome || 'Visitante'}</p>
              <p className="text-xs text-slate-400">Cidade: {usuario?.cidade_base || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Saldo disponível</p>
              <p className={`text-2xl font-extrabold ${saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{saldo.toFixed(2)} {sigla}</p>
              <p className="text-[10px] text-slate-400">Saldo real, guardado no banco</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center">
              <p className="text-[10px] text-emerald-700 font-medium">Total créditos</p>
              <p className="font-bold text-emerald-700 text-sm">+{totalCreditos.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-center">
              <p className="text-[10px] text-rose-700 font-medium">Total débitos</p>
              <p className="font-bold text-rose-700 text-sm">-{totalDebitos.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-2.5 text-center">
              <p className="text-[10px] text-yellow-700 font-medium">Bônus recebidos</p>
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
                filtro === current ? 'bg-emerald-600 text-white shadow' : 'bg-white border border-slate-300 text-slate-600 hover:border-emerald-400'
              }`}
            >
              {current === 'todos' ? 'Todos' : current === 'creditos' ? 'Créditos' : current === 'debitos' ? 'Débitos' : 'Bônus'}
            </button>
          ))}
        </div>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-slate-600" />
              <p className="font-semibold text-slate-700 text-sm">Lançamentos</p>
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
              <p className="text-sm">Nenhum lançamento encontrado.</p>
              <p className="text-xs mt-1 text-slate-400">Faça uma transferência na Carteira pra ver aqui.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtrados.map((line) => (
                <div key={line.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="mt-0.5">{line.status === 'estornada' ? <Ban size={14} className="text-slate-400" /> : TIPO_ICON[line.tipo]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-sm font-medium truncate">{line.descricao}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {TIPO_LABEL[line.tipo]} · {line.origem}
                    </p>
                    <p className="text-[10px] text-slate-400">{formatDate(line.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-sm ${line.status === 'estornada' ? 'text-slate-400 line-through' : line.direction === 'credito' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {line.direction === 'credito' ? '+' : '-'}
                      {line.valor.toFixed(2)} {sigla}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${STATUS_COR[line.status]}`}>{STATUS_LABEL[line.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
