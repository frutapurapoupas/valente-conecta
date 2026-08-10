"use client";

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Users, Plus, X, Save, Phone, CheckCircle } from "lucide-react";
import EmpresaHeader from "../_lib/EmpresaHeader";
import { useEmpresa } from "../_lib/useEmpresa";

interface GymMember {
  id: string;
  nome: string;
  foto: string;
  plano: string;
  whatsapp: string;
  total_checkins: number;
  ultimo_checkin: string | null;
  ativo: boolean;
}

export default function MembrosPage() {
  const { empresa, empresaId, carregando: carregandoEmpresa } = useEmpresa();
  const [membros, setMembros] = useState<GymMember[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novo, setNovo] = useState({ nome: "", whatsapp: "", plano: "gratuito" });

  const carregarMembros = useCallback(async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const res = await fetch(`/api/academia?recurso=membros&gym_unit_id=${empresaId}`);
      const data = await res.json();
      setMembros(Array.isArray(data?.data) ? data.data : []);
    } catch {
      toast.error("Erro ao carregar membros.");
    } finally {
      setCarregando(false);
    }
  }, [empresaId]);

  useEffect(() => { carregarMembros(); }, [carregarMembros]);

  const handleAdicionar = async () => {
    if (!novo.nome.trim()) { toast.error("Informe o nome do membro."); return; }
    if (!empresaId) return;
    setSalvando(true);
    try {
      const res = await fetch("/api/academia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurso: "membros", gym_unit_id: empresaId, ...novo }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Erro ao adicionar membro.");
      toast.success("Membro adicionado!");
      setNovo({ nome: "", whatsapp: "", plano: "gratuito" });
      setMostrarForm(false);
      carregarMembros();
    } catch (err: any) {
      toast.error(err.message || "Erro ao adicionar membro.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <EmpresaHeader titulo="Membros" />
      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-4">
        {!carregandoEmpresa && !empresaId ? (
          <p className="text-center text-zinc-400 py-12">Cadastre sua academia primeiro.</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{empresa?.nome}</h2>
              <button onClick={() => setMostrarForm(v => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-500 transition">
                {mostrarForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {mostrarForm ? "Cancelar" : "Novo membro"}
              </button>
            </div>

            {mostrarForm && (
              <div className="bg-white/10 rounded-2xl p-4 space-y-3">
                <input type="text" placeholder="Nome *" value={novo.nome}
                  onChange={e => setNovo({ ...novo, nome: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-zinc-400" />
                <input type="tel" placeholder="WhatsApp" value={novo.whatsapp}
                  onChange={e => setNovo({ ...novo, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-zinc-400" />
                <select value={novo.plano} onChange={e => setNovo({ ...novo, plano: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white">
                  <option value="gratuito" className="bg-slate-900">Gratuito</option>
                  <option value="basico" className="bg-slate-900">Básico</option>
                </select>
                <button onClick={handleAdicionar} disabled={salvando}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {salvando ? "Salvando..." : "Salvar membro"}
                </button>
              </div>
            )}

            <div className="space-y-3">
              {carregando ? (
                <p className="text-center text-zinc-400 py-8">Carregando membros...</p>
              ) : membros.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhum membro cadastrado ainda</p>
                </div>
              ) : (
                membros.map(m => (
                  <div key={m.id} className="bg-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/30 flex items-center justify-center font-black text-emerald-300">
                      {m.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{m.nome}</p>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        {m.whatsapp && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{m.whatsapp}</span>}
                        <span className="capitalize">{m.plano}</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />{m.total_checkins} check-ins</span>
                      </div>
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
