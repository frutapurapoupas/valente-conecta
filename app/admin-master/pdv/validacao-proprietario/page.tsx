"use client";

// Caminho: C:\valente_conecta\app\admin-master\pdv\validacao-proprietario\page.tsx
//
// Admin master revisa documentos que comprovam dono/responsavel de loja
// (094_validacao_proprietario_loja.sql) -- pre-requisito pro lojista poder
// aprovar cadastros de produto de consumidor. Mesmo layout de
// app/admin-master/pdv-catalogo/moderacao/page.tsx.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

interface ItemValidacao {
  usuario_id: string;
  nome_exibicao: string;
  categoria_negocio: string | null;
  documento_signed_url: string | null;
  aceitou_termos_documento_em: string | null;
  updated_at: string;
}

export default function ValidacaoProprietarioPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [lista, setLista] = useState<ItemValidacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [motivoPorId, setMotivoPorId] = useState<Record<string, string>>({});

  const carregar = () => {
    setLoading(true);
    fetch("/api/admin-master/validacao-proprietario?status=pendente")
      .then((r) => r.json())
      .then((resp) => setLista(resp.success ? resp.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setAdmin(getCurrentUser());
    carregar();
  }, []);

  const processar = async (usuarioId: string, acao: "aprovar" | "recusar") => {
    setProcessando(usuarioId);
    try {
      const resp = await fetch(`/api/admin-master/validacao-proprietario?usuarioId=${usuarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, adminId: admin?.id, motivo: motivoPorId[usuarioId] || undefined }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(acao === "aprovar" ? "Aprovado — lojista já pode aprovar cadastros" : "Recusado");
      setLista((prev) => prev.filter((r) => r.usuario_id !== usuarioId));
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar");
    } finally {
      setProcessando(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-blue-600" /> Validação de dono/responsável de loja
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Documento comprobatório enviado pelo lojista. Aprovar libera ele pra aprovar cadastros de produto feitos por consumidores.
      </p>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : lista.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500 text-sm">Nenhum documento pendente.</div>
      ) : (
        <div className="space-y-3">
          {lista.map((item) => (
            <div key={item.usuario_id} className="bg-white border rounded-lg p-4">
              {item.documento_signed_url && (
                <a href={item.documento_signed_url} target="_blank" rel="noreferrer">
                  <img src={item.documento_signed_url} alt="Documento" className="w-32 h-32 object-cover rounded-lg border mb-3" />
                </a>
              )}
              <p className="font-medium text-sm mb-1">{item.nome_exibicao}</p>
              <p className="text-sm text-gray-500 mb-3">
                {item.categoria_negocio || "sem categoria"} · declaração aceita em{" "}
                {item.aceitou_termos_documento_em ? new Date(item.aceitou_termos_documento_em).toLocaleString("pt-BR") : "—"}
              </p>
              <input
                value={motivoPorId[item.usuario_id] || ""}
                onChange={(e) => setMotivoPorId((prev) => ({ ...prev, [item.usuario_id]: e.target.value }))}
                placeholder="Motivo da recusa (opcional se aprovar)"
                className="w-full mb-3 px-3 py-1.5 border rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => processar(item.usuario_id, "aprovar")}
                  disabled={processando === item.usuario_id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                </button>
                <button
                  onClick={() => processar(item.usuario_id, "recusar")}
                  disabled={processando === item.usuario_id}
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
