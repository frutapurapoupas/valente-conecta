"use client";

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Wrench, Plus, X, Save, DollarSign, Clock3 } from "lucide-react";
import EmpresaHeader from "../_lib/EmpresaHeader";
import { useEmpresa } from "../_lib/useEmpresa";

interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  cobranca_de: string;
}

interface Aluno {
  id: number;
  nome: string;
}

interface Consumo {
  id: string;
  aluno_id: number | null;
  valor_cobrado: number;
  status_pagamento: string;
  created_at: string;
  academia_servicos?: { nome: string; preco: number } | null;
}

export default function ServicosPage() {
  const { empresaId, carregando: carregandoEmpresa } = useEmpresa();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novo, setNovo] = useState({ servico_id: "", aluno_id: "", valor_cobrado: "" });

  const carregarTudo = useCallback(async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const [servicosRes, alunosRes, consumosRes] = await Promise.all([
        fetch("/api/academia?recurso=servicos"),
        fetch(`/api/academia?recurso=alunos&gym_unit_id=${empresaId}`),
        fetch(`/api/academia?recurso=consumos&gym_unit_id=${empresaId}`),
      ]);
      const servicosData = await servicosRes.json();
      const alunosData = await alunosRes.json();
      const consumosData = await consumosRes.json();
      setServicos(Array.isArray(servicosData?.data) ? servicosData.data : []);
      setAlunos(Array.isArray(alunosData?.data) ? alunosData.data : []);
      setConsumos(Array.isArray(consumosData?.data) ? consumosData.data : []);
    } catch {
      toast.error("Erro ao carregar serviços.");
    } finally {
      setCarregando(false);
    }
  }, [empresaId]);

  useEffect(() => { carregarTudo(); }, [carregarTudo]);

  const handleServicoSelecionado = (servicoId: string) => {
    const servico = servicos.find(s => s.id === servicoId);
    setNovo({ ...novo, servico_id: servicoId, valor_cobrado: servico ? String(servico.preco) : novo.valor_cobrado });
  };

  const handleRegistrar = async () => {
    if (!novo.servico_id || !novo.valor_cobrado) { toast.error("Escolha o serviço e o valor."); return; }
    if (!empresaId) return;
    setSalvando(true);
    try {
      const res = await fetch("/api/academia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recurso: "consumos",
          gym_unit_id: empresaId,
          servico_id: novo.servico_id,
          aluno_id: novo.aluno_id || null,
          valor_cobrado: Number(novo.valor_cobrado),
        }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Erro ao registrar consumo.");
      toast.success("Consumo registrado!");
      setNovo({ servico_id: "", aluno_id: "", valor_cobrado: "" });
      setMostrarForm(false);
      carregarTudo();
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar consumo.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <EmpresaHeader titulo="Serviços" />
      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        {!carregandoEmpresa && !empresaId ? (
          <p className="text-center text-zinc-400 py-12">Cadastre sua academia primeiro.</p>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold mb-3">Catálogo de serviços</h2>
              {carregando ? (
                <p className="text-center text-zinc-400 py-4">Carregando...</p>
              ) : servicos.length === 0 ? (
                <p className="text-sm text-zinc-400">Nenhum serviço disponível no catálogo da plataforma ainda.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {servicos.map(s => (
                    <div key={s.id} className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white text-sm">{s.nome}</p>
                        {s.descricao && <p className="text-xs text-zinc-400">{s.descricao}</p>}
                      </div>
                      <span className="text-sm font-bold text-orange-400">R$ {Number(s.preco).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Consumos registrados</h2>
              <button onClick={() => setMostrarForm(v => !v)} disabled={servicos.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 rounded-xl text-sm font-semibold hover:bg-orange-500 transition disabled:opacity-40">
                {mostrarForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {mostrarForm ? "Cancelar" : "Registrar consumo"}
              </button>
            </div>

            {mostrarForm && (
              <div className="bg-white/10 rounded-2xl p-4 space-y-3">
                <select value={novo.servico_id} onChange={e => handleServicoSelecionado(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white">
                  <option value="" className="bg-slate-900">Selecione o serviço *</option>
                  {servicos.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.nome}</option>)}
                </select>
                <select value={novo.aluno_id} onChange={e => setNovo({ ...novo, aluno_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white">
                  <option value="" className="bg-slate-900">Aluno (opcional)</option>
                  {alunos.map(a => <option key={a.id} value={a.id} className="bg-slate-900">{a.nome}</option>)}
                </select>
                <input type="number" step="0.01" placeholder="Valor cobrado (R$) *" value={novo.valor_cobrado}
                  onChange={e => setNovo({ ...novo, valor_cobrado: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-zinc-400" />
                <button onClick={handleRegistrar} disabled={salvando}
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {salvando ? "Registrando..." : "Registrar consumo"}
                </button>
              </div>
            )}

            <div className="space-y-3">
              {consumos.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <Wrench className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhum consumo registrado ainda</p>
                </div>
              ) : (
                consumos.map(c => (
                  <div key={c.id} className="bg-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">{c.academia_servicos?.nome || "Serviço"}</p>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                        <Clock3 className="w-3 h-3" /> {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-400 flex items-center gap-1 justify-end">
                        <DollarSign className="w-3 h-3" /> {Number(c.valor_cobrado).toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.status_pagamento === 'pago' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {c.status_pagamento}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
