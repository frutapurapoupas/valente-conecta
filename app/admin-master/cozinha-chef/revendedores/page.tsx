"use client";

// Caminho: C:\valente_conecta\app\admin-master\cozinha-chef\revendedores\page.tsx
//
// Cadastro/aprovacao de revendedores -- transforma "sou revendedor" de uma
// alegacao livre na URL (?perfil=revendedor) numa lista real aprovada pelo
// admin. app/api/cozinha/pedidos/route.ts sempre revalida contra essa
// tabela antes de aplicar desconto/forma de confirmacao de revendedor.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserCheck, Plus, Power } from "lucide-react";

interface Revendedor {
  id: string;
  whatsapp: string;
  nome: string;
  ativo: boolean;
  forma_confirmacao: "fiado_prazo" | "pagamento_entrega" | "aprovacao_manual";
  observacoes: string | null;
  created_at: string;
}

const LABEL_FORMA: Record<string, string> = {
  fiado_prazo: "Fiado / prazo combinado",
  pagamento_entrega: "Paga na entrega",
  aprovacao_manual: "Aprovação manual por pedido",
};

export default function RevendedoresCozinhaPage() {
  const [lista, setLista] = useState<Revendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [formaConfirmacao, setFormaConfirmacao] = useState("aprovacao_manual");
  const [salvando, setSalvando] = useState(false);

  const carregar = () => {
    setLoading(true);
    fetch("/api/cozinha/revendedores")
      .then((r) => r.json())
      .then((resp) => setLista(resp.success ? resp.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const cadastrar = async () => {
    if (!nome.trim() || !whatsapp.trim()) {
      toast.error("Preencha nome e WhatsApp");
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch("/api/cozinha/revendedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, whatsapp, formaConfirmacao }),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      toast.success("Revendedor cadastrado!");
      setNome(""); setWhatsapp(""); setFormaConfirmacao("aprovacao_manual"); setMostrarForm(false);
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar");
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (rev: Revendedor) => {
    await fetch(`/api/cozinha/revendedores?id=${rev.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !rev.ativo }),
    });
    carregar();
  };

  const mudarForma = async (rev: Revendedor, forma: string) => {
    await fetch(`/api/cozinha/revendedores?id=${rev.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formaConfirmacao: forma }),
    });
    carregar();
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold flex items-center gap-2"><UserCheck className="w-6 h-6 text-orange-600" /> Revendedores</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Novo
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Só quem estiver aqui, ativo, ganha o desconto e a forma de confirmação de revendedor no checkout — qualquer outra pessoa que tentar isso na URL é rebaixada pra cliente comum automaticamente.
      </p>

      {mostrarForm && (
        <div className="bg-white border rounded-xl p-4 mb-4 space-y-3">
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp (com DDD)" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <select value={formaConfirmacao} onChange={(e) => setFormaConfirmacao(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
            {Object.entries(LABEL_FORMA).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <button onClick={cadastrar} disabled={salvando} className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
            {salvando ? "Salvando..." : "Cadastrar"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : lista.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500 text-sm">Nenhum revendedor cadastrado ainda.</div>
      ) : (
        <div className="space-y-2">
          {lista.map((rev) => (
            <div key={rev.id} className="bg-white border rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-800">{rev.nome}</p>
                <p className="text-xs text-gray-400">{rev.whatsapp}</p>
              </div>
              <select
                value={rev.forma_confirmacao}
                onChange={(e) => mudarForma(rev, e.target.value)}
                className="text-xs border rounded-lg px-2 py-1.5 bg-white"
              >
                {Object.entries(LABEL_FORMA).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
              <button
                onClick={() => alternarAtivo(rev)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 ${rev.ativo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
              >
                <Power className="w-3.5 h-3.5" /> {rev.ativo ? "Ativo" : "Inativo"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
