"use client";

// Caminho: C:\valente_conecta\app\pdv\notas-fiscais\page.tsx
//
// Controle MANUAL de notas fiscais — base pra emissao real futura (ver
// migration 045_base_fiscal_pdv.sql). Nao emite nada: e' um caderno pro
// comerciante organizar o que ja emitiu por fora (portal do MEI, contador)
// ou o que ainda precisa emitir.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, FileText, Plus, X, CheckCircle2, Clock, Ban } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PdvSubNav } from "@/components/pdv/PdvSubNav";
import { SemPermissaoPdv } from "@/components/pdv/SemPermissaoPdv";
import { getOperadorAtivo, temPermissao, type OperadorAtivo } from "@/lib/pdv/operadorPdv";
import { DadosFiscaisLoja } from "@/components/pdv/DadosFiscaisLoja";
import { StatusPlanoFisco } from "@/components/pdv/StatusPlanoFisco";

interface Nota {
  id: string;
  tipo: "nfce" | "nfe";
  numero: string | null;
  serie: string | null;
  valor: number;
  status: "pendente" | "emitida" | "cancelada";
  observacoes: string | null;
  created_at: string;
}

const STATUS_INFO: Record<string, { label: string; classe: string; icone: any }> = {
  pendente: { label: "Pendente", classe: "bg-amber-100 text-amber-700", icone: Clock },
  emitida: { label: "Emitida", classe: "bg-emerald-100 text-emerald-700", icone: CheckCircle2 },
  cancelada: { label: "Cancelada", classe: "bg-gray-100 text-gray-500", icone: Ban },
};

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export default function NotasFiscaisPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [operador, setOperador] = useState<OperadorAtivo | null>(null);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [formAberto, setFormAberto] = useState(false);

  const [tipo, setTipo] = useState<"nfce" | "nfe">("nfce");
  const [valor, setValor] = useState<number | "">("");
  const [numero, setNumero] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregar = async (usuarioId: string) => {
    setLoading(true);
    const resp = await fetch(`/api/pdv/notas-fiscais?usuarioId=${usuarioId}`, { cache: "no-store" }).then((r) => r.json());
    if (resp.success) setNotas(resp.data);
    setLoading(false);
  };

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    setOperador(getOperadorAtivo());
    if (u) carregar(u.id);
    else setLoading(false);
  }, []);

  const registrar = async () => {
    if (!usuario || !valor || Number(valor) <= 0) {
      toast.error("Informe o valor.");
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch("/api/pdv/notas-fiscais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id, tipo, valor: Number(valor), numero: numero.trim() || null }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Nota registrada!");
      setValor("");
      setNumero("");
      setFormAberto(false);
      carregar(usuario.id);
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar");
    } finally {
      setSalvando(false);
    }
  };

  const mudarStatus = async (id: string, status: string) => {
    if (!usuario) return;
    await fetch(`/api/pdv/notas-fiscais?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    carregar(usuario.id);
  };

  if (!loading && !usuario) {
    return <div className="max-w-md mx-auto p-6 text-center text-gray-500">Complete seu cadastro no app pra usar essa área.</div>;
  }

  if (operador && !temPermissao(operador, "notas-fiscais")) {
    return <SemPermissaoPdv />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-bold text-gray-800 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Notas Fiscais</h1>
      </header>
      <PdvSubNav ativa="notas-fiscais" operador={operador} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
          Controle manual, pra organização — ainda não emite nota de verdade. Emissão automática (NFC-e/NFe) é a próxima etapa, depende de custo de certificado/integração a ser resolvido antes do lançamento.
        </div>

        {usuario && <StatusPlanoFisco usuarioId={usuario.id} />}
        {usuario && <DadosFiscaisLoja usuarioId={usuario.id} />}

        <button
          onClick={() => setFormAberto(true)}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Registrar nota
        </button>

        {loading ? (
          <p className="text-center text-sm text-gray-500 py-8">Carregando...</p>
        ) : notas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow text-gray-500">Nenhuma nota registrada ainda.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow divide-y">
            {notas.map((n) => {
              const info = STATUS_INFO[n.status];
              const Icone = info.icone;
              return (
                <div key={n.id} className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {n.tipo.toUpperCase()} {n.numero ? `· nº ${n.numero}` : ""} — {formatarMoeda(Number(n.valor))}
                    </p>
                    <p className="text-sm text-gray-500">{new Date(n.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  {n.status === "pendente" ? (
                    <button
                      onClick={() => mudarStatus(n.id, "emitida")}
                      className={`text-sm font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${info.classe}`}
                    >
                      <Icone className="w-3.5 h-3.5" /> {info.label}
                    </button>
                  ) : (
                    <span className={`text-sm font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${info.classe}`}>
                      <Icone className="w-3.5 h-3.5" /> {info.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {formAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Registrar nota</h2>
              <button onClick={() => setFormAberto(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="nfce">NFC-e (venda no balcão)</option>
                  <option value="nfe">NF-e (venda p/ empresa)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Valor</label>
                <input type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value === "" ? "" : parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Número (se já emitiu por fora)</label>
                <input value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <button onClick={registrar} disabled={salvando} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60">
                {salvando ? "Salvando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
