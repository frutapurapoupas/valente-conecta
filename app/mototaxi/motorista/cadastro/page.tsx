// Caminho sugerido: C:\valente_conecta\app\mototaxi\motorista\cadastro\page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, Bike } from "lucide-react";

export default function CadastroMotoristaPage() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    veiculo: "",
    placa: "",
    foto_url: "",
    cnh_numero: "",
    cnh_valida: false,
    documento_veiculo_ok: false,
    licenciamento_vencimento: "",
    plano: "gratis",
  });

  const cadastrar = async () => {
    setEnviando(true);
    try {
      const res = await fetch("/api/mototaxi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurso: "motoristas", ...form }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Falha no cadastro");

      toast.success("Cadastro enviado! Guarde o ID do motorista para configurar seu acesso.");
      // Enquanto nao existe login, mostramos o ID gerado para o motorista
      // usar manualmente na tela /mototaxi/motorista.
      toast(`Seu ID de motorista: ${data.data.id}`, { duration: 15000 });
      router.push("/mototaxi/motorista");
    } catch (error: any) {
      toast.error(error?.message || "Erro no cadastro do motorista");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-emerald-700 to-teal-600 px-4 py-3 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <Bike size={18} />
          <h1 className="font-bold text-lg">Cadastro de Motorista</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} placeholder="Nome" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
            <input value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} placeholder="Telefone" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
            <input value={form.veiculo} onChange={(e) => setForm((p) => ({ ...p, veiculo: e.target.value }))} placeholder="Veiculo" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
            <input value={form.placa} onChange={(e) => setForm((p) => ({ ...p, placa: e.target.value }))} placeholder="Placa" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
            <input value={form.cnh_numero} onChange={(e) => setForm((p) => ({ ...p, cnh_numero: e.target.value }))} placeholder="Numero da CNH" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
            <input type="date" value={form.licenciamento_vencimento} onChange={(e) => setForm((p) => ({ ...p, licenciamento_vencimento: e.target.value }))} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
            <input value={form.foto_url} onChange={(e) => setForm((p) => ({ ...p, foto_url: e.target.value }))} placeholder="URL da foto (opcional)" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 md:col-span-2" />
            <select value={form.plano} onChange={(e) => setForm((p) => ({ ...p, plano: e.target.value }))} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 md:col-span-2">
              <option value="gratis">Plano Gratis</option>
              <option value="basico">Plano Basico</option>
              <option value="premium">Plano Premium</option>
            </select>
          </div>

          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.cnh_valida} onChange={(e) => setForm((p) => ({ ...p, cnh_valida: e.target.checked }))} /> CNH valida confirmada
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.documento_veiculo_ok} onChange={(e) => setForm((p) => ({ ...p, documento_veiculo_ok: e.target.checked }))} /> Documentacao do veiculo valida
            </label>
          </div>

          <div className="rounded-xl bg-amber-950/40 border border-amber-700/50 p-3 text-amber-200 text-xs flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5" />
            Somente motoristas com CNH valida e licenciamento em dia podem ser aprovados.
          </div>

          <button
            onClick={cadastrar}
            disabled={enviando}
            className="w-full bg-cyan-600 py-2.5 rounded-xl font-bold disabled:opacity-70"
          >
            {enviando ? "Enviando..." : "Cadastrar motorista"}
          </button>
        </div>
      </main>
    </div>
  );
}
