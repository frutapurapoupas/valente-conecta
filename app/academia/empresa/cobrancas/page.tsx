"use client";

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Wallet, CalendarClock } from "lucide-react";
import EmpresaHeader from "../_lib/EmpresaHeader";
import { useEmpresa } from "../_lib/useEmpresa";

interface Cobranca {
  id: string;
  referencia_mes: string;
  valor: number;
  vencimento: string;
  status: string;
  pago_em: string | null;
}

const STATUS_ESTILO: Record<string, string> = {
  pago: "bg-green-500/20 text-green-300",
  pendente: "bg-yellow-500/20 text-yellow-300",
  atrasado: "bg-red-500/20 text-red-300",
};

export default function CobrancasPage() {
  const { empresaId, carregando: carregandoEmpresa } = useEmpresa();
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarCobrancas = useCallback(async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const res = await fetch(`/api/academia?recurso=cobrancas&gym_unit_id=${empresaId}`);
      const data = await res.json();
      setCobrancas(Array.isArray(data?.data) ? data.data : []);
    } catch {
      toast.error("Erro ao carregar cobranças.");
    } finally {
      setCarregando(false);
    }
  }, [empresaId]);

  useEffect(() => { carregarCobrancas(); }, [carregarCobrancas]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <EmpresaHeader titulo="Cobranças" />
      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-4">
        {!carregandoEmpresa && !empresaId ? (
          <p className="text-center text-zinc-400 py-12">Cadastre sua academia primeiro.</p>
        ) : carregando ? (
          <p className="text-center text-zinc-400 py-8">Carregando cobranças...</p>
        ) : cobrancas.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <Wallet className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nenhuma cobrança gerada ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cobrancas.map(c => (
              <div key={c.id} className="bg-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Mensalidade — {c.referencia_mes}</p>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                    <CalendarClock className="w-3 h-3" /> Vencimento: {new Date(c.vencimento).toLocaleDateString()}
                    {c.pago_em && <span> • Pago em {new Date(c.pago_em).toLocaleDateString()}</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-pink-400">R$ {Number(c.valor).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_ESTILO[c.status] || 'bg-white/10 text-white'}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-center text-xs text-zinc-500 pt-2">
          Pagamentos são confirmados pela administração da plataforma após a compensação.
        </p>
      </main>
    </div>
  );
}
