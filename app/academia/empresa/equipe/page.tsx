"use client";

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserCog, Plus, X, Save, Mail, Phone } from "lucide-react";
import EmpresaHeader from "../_lib/EmpresaHeader";
import { useEmpresa } from "../_lib/useEmpresa";

interface UsuarioEmpresa {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  papel: string;
}

const PAPEIS = ["gerente", "instrutor", "recepcao", "financeiro"];

export default function EquipePage() {
  const { empresaId, carregando: carregandoEmpresa } = useEmpresa();
  const [usuarios, setUsuarios] = useState<UsuarioEmpresa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novo, setNovo] = useState({ nome: "", email: "", telefone: "", papel: PAPEIS[0] });

  const carregarUsuarios = useCallback(async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const res = await fetch(`/api/academia?recurso=usuarios_empresa&gym_unit_id=${empresaId}`);
      const data = await res.json();
      setUsuarios(Array.isArray(data?.data) ? data.data : []);
    } catch {
      toast.error("Erro ao carregar equipe.");
    } finally {
      setCarregando(false);
    }
  }, [empresaId]);

  useEffect(() => { carregarUsuarios(); }, [carregarUsuarios]);

  const handleAdicionar = async () => {
    if (!novo.nome.trim()) { toast.error("Informe o nome."); return; }
    if (!empresaId) return;
    setSalvando(true);
    try {
      const res = await fetch("/api/academia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurso: "usuarios_empresa", gym_unit_id: empresaId, ...novo }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Erro ao adicionar integrante.");
      toast.success("Integrante adicionado!");
      setNovo({ nome: "", email: "", telefone: "", papel: PAPEIS[0] });
      setMostrarForm(false);
      carregarUsuarios();
    } catch (err: any) {
      toast.error(err.message || "Erro ao adicionar integrante.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <EmpresaHeader titulo="Equipe" />
      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-4">
        {!carregandoEmpresa && !empresaId ? (
          <p className="text-center text-zinc-400 py-12">Cadastre sua academia primeiro.</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Instrutores e funcionários</h2>
              <button onClick={() => setMostrarForm(v => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-500 transition">
                {mostrarForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {mostrarForm ? "Cancelar" : "Adicionar"}
              </button>
            </div>

            {mostrarForm && (
              <div className="bg-white/10 rounded-2xl p-4 space-y-3">
                <input type="text" placeholder="Nome *" value={novo.nome}
                  onChange={e => setNovo({ ...novo, nome: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-zinc-400" />
                <input type="email" placeholder="E-mail" value={novo.email}
                  onChange={e => setNovo({ ...novo, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-zinc-400" />
                <input type="tel" placeholder="Telefone" value={novo.telefone}
                  onChange={e => setNovo({ ...novo, telefone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-zinc-400" />
                <select value={novo.papel} onChange={e => setNovo({ ...novo, papel: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white capitalize">
                  {PAPEIS.map(p => <option key={p} value={p} className="bg-slate-900 capitalize">{p}</option>)}
                </select>
                <button onClick={handleAdicionar} disabled={salvando}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {salvando ? "Salvando..." : "Salvar integrante"}
                </button>
              </div>
            )}

            <div className="space-y-3">
              {carregando ? (
                <p className="text-center text-zinc-400 py-8">Carregando equipe...</p>
              ) : usuarios.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <UserCog className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhum integrante cadastrado ainda</p>
                </div>
              ) : (
                usuarios.map(u => (
                  <div key={u.id} className="bg-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center font-black text-blue-300">
                      {u.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white truncate">{u.nome}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 capitalize">{u.papel}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        {u.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>}
                        {u.telefone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{u.telefone}</span>}
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
