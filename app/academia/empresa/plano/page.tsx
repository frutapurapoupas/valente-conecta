"use client";

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, Check, X as XIcon, Star } from "lucide-react";
import EmpresaHeader from "../_lib/EmpresaHeader";
import { useEmpresa } from "../_lib/useEmpresa";

interface Funcionalidade {
  plano_id: string;
  incluida: boolean;
  gym_funcionalidades: { id: string; label: string } | null;
}

interface Plano {
  id: string;
  nome: string;
  descricao: string | null;
  preco_mensal: number;
  limite_alunos: number | null;
  limite_usuarios_adicionais: number;
  ordem_exibicao: number;
  funcionalidades: Funcionalidade[];
}

export default function PlanoPage() {
  const { empresa, empresaId, carregando: carregandoEmpresa } = useEmpresa();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarPlanos = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/academia?recurso=planos");
      const data = await res.json();
      setPlanos(Array.isArray(data?.data) ? data.data : []);
    } catch {
      toast.error("Erro ao carregar planos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarPlanos(); }, [carregarPlanos]);

  if (!carregandoEmpresa && !empresaId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
        <EmpresaHeader titulo="Meu Plano" />
        <p className="text-center text-zinc-400 py-12">Cadastre sua academia primeiro.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <EmpresaHeader titulo="Meu Plano" />
      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-4">
        {carregando ? (
          <p className="text-center text-zinc-400 py-8">Carregando planos...</p>
        ) : planos.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum plano configurado ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {planos.map(plano => {
              const atual = plano.id === empresa?.plano_id;
              return (
                <div key={plano.id} className={`rounded-2xl p-5 border ${atual ? 'bg-violet-500/20 border-violet-400' : 'bg-white/10 border-white/10'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-lg flex items-center gap-2">
                      {atual && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                      {plano.nome}
                    </h3>
                    <span className="font-bold text-violet-300">
                      {plano.preco_mensal > 0 ? `R$ ${Number(plano.preco_mensal).toFixed(2)}/mês` : "Grátis"}
                    </span>
                  </div>
                  {plano.descricao && <p className="text-sm text-zinc-400 mb-3">{plano.descricao}</p>}
                  <div className="text-xs text-zinc-400 mb-3">
                    {plano.limite_alunos ? `Até ${plano.limite_alunos} alunos` : "Alunos ilimitados"} • {plano.limite_usuarios_adicionais} usuário(s) de equipe
                  </div>
                  {plano.funcionalidades?.length > 0 && (
                    <ul className="space-y-1">
                      {plano.funcionalidades.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          {f.incluida ? <Check className="w-4 h-4 text-green-400" /> : <XIcon className="w-4 h-4 text-zinc-600" />}
                          <span className={f.incluida ? "text-white" : "text-zinc-500 line-through"}>{f.gym_funcionalidades?.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {atual && <p className="mt-3 text-xs text-violet-300 font-semibold">Plano atual da sua academia</p>}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-center text-xs text-zinc-500 pt-2">
          Para mudar de plano, entre em contato com o suporte da plataforma.
        </p>
      </main>
    </div>
  );
}
