"use client";

// Caminho: C:\valente_conecta\app\admin-master\indicacoes-estabelecimento\page.tsx
//
// Admin master revisa indicações de estabelecimento/fornecedor feitas por
// usuários comuns (ver 100_indicacao_estabelecimento_fornecedor.sql) e
// configura a meta + bônus em Moeda Conecta pago a quem indicou. Aprovar já
// processa o bônus (RPC atômica), mesmo padrão de
// /admin-master/pdv-catalogo/moderacao.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Megaphone, Settings2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

interface ItemIndicacao {
  id: string;
  nome: string;
  categoria: string;
  cidade: string;
  telefone: string | null;
  endereco: string | null;
  observacoes: string | null;
  created_at: string;
  usuarios: { nome: string; whatsapp: string } | null;
}

interface CicloConfig {
  id: string;
  meta: number;
  bonus: number;
  ativo: boolean;
}

export default function IndicacoesEstabelecimentoPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [lista, setLista] = useState<ItemIndicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [motivoPorId, setMotivoPorId] = useState<Record<string, string>>({});

  const [config, setConfig] = useState<CicloConfig | null>(null);
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [formConfig, setFormConfig] = useState({ meta: 1, bonus: 0, ativo: false });

  const carregarLista = () => {
    setLoading(true);
    fetch("/api/admin-master/indicacao-estabelecimento?status=pendente")
      .then((r) => r.json())
      .then((resp) => setLista(resp.success ? resp.data : []))
      .finally(() => setLoading(false));
  };

  const carregarConfig = () => {
    fetch("/api/admin-master/indicacao-estabelecimento/config")
      .then((r) => r.json())
      .then((resp) => {
        if (resp.success && resp.data) {
          setConfig(resp.data);
          setFormConfig({ meta: resp.data.meta, bonus: resp.data.bonus, ativo: resp.data.ativo });
        }
      });
  };

  useEffect(() => {
    setAdmin(getCurrentUser());
    carregarLista();
    carregarConfig();
  }, []);

  const processar = async (id: string, acao: "aprovar" | "recusar") => {
    setProcessando(id);
    try {
      const resp = await fetch(`/api/admin-master/indicacao-estabelecimento?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, adminId: admin?.id, motivo: motivoPorId[id] || undefined }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(acao === "aprovar" ? "Aprovado — bônus processado se a meta foi batida!" : "Recusado");
      setLista((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar");
    } finally {
      setProcessando(null);
    }
  };

  const salvarConfig = async () => {
    setSalvandoConfig(true);
    try {
      const resp = await fetch("/api/admin-master/indicacao-estabelecimento/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formConfig),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setConfig(resultado.data);
      toast.success("Meta atualizada!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar meta");
    } finally {
      setSalvandoConfig(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-emerald-600" /> Indicações de estabelecimento/fornecedor
        </h1>
        <p className="text-sm text-gray-500">
          Comércios e fornecedores indicados por usuários pra entrarem na plataforma. Aprovar conta pra meta de bônus em Moeda Conecta de quem indicou.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-gray-500" /> Meta e bônus do ciclo
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
          <label className="text-xs text-gray-500">
            Indicações aprovadas por ciclo
            <input
              type="number"
              min={1}
              value={formConfig.meta}
              onChange={(e) => setFormConfig((p) => ({ ...p, meta: Number(e.target.value) }))}
              className="w-full mt-1 px-2 py-1.5 border rounded-lg text-sm"
            />
          </label>
          <label className="text-xs text-gray-500">
            Bônus por ciclo (Moeda Conecta)
            <input
              type="number"
              min={0}
              step="0.01"
              value={formConfig.bonus}
              onChange={(e) => setFormConfig((p) => ({ ...p, bonus: Number(e.target.value) }))}
              className="w-full mt-1 px-2 py-1.5 border rounded-lg text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={formConfig.ativo}
              onChange={(e) => setFormConfig((p) => ({ ...p, ativo: e.target.checked }))}
            />
            Ciclo ativo
          </label>
        </div>
        <button
          onClick={salvarConfig}
          disabled={salvandoConfig}
          className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
        >
          {salvandoConfig ? "Salvando..." : "Salvar meta"}
        </button>
        {config && !config.ativo && (
          <p className="text-xs text-amber-600 mt-2">Ciclo desativado — indicações são aprovadas normalmente, mas ninguém recebe bônus até ativar.</p>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : lista.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500 text-sm">Nenhuma indicação pendente.</div>
      ) : (
        <div className="space-y-3">
          {lista.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-4">
              <p className="font-medium text-sm">{item.nome}</p>
              <p className="text-xs text-gray-500 mb-1">{item.categoria} · {item.cidade}</p>
              {(item.telefone || item.endereco) && (
                <p className="text-xs text-gray-500 mb-1">{[item.telefone, item.endereco].filter(Boolean).join(" · ")}</p>
              )}
              {item.observacoes && <p className="text-xs text-gray-600 italic mb-2">"{item.observacoes}"</p>}
              <p className="text-xs text-gray-400 mb-3">
                Indicado por {item.usuarios?.nome || "usuário"} {item.usuarios?.whatsapp ? `(${item.usuarios.whatsapp})` : ""}
              </p>
              <input
                value={motivoPorId[item.id] || ""}
                onChange={(e) => setMotivoPorId((prev) => ({ ...prev, [item.id]: e.target.value }))}
                placeholder="Motivo da recusa (opcional se aprovar)"
                className="w-full mb-3 px-3 py-1.5 border rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => processar(item.id, "aprovar")}
                  disabled={processando === item.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                </button>
                <button
                  onClick={() => processar(item.id, "recusar")}
                  disabled={processando === item.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  <XCircle className="w-3.5 h-3.5" /> Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
