"use client";

// Caminho: C:\valente_conecta\app\admin-master\usuarios\cidades-adicionais\page.tsx
// Admin master gerencia pedidos de acesso a cidade adicional (feitos em
// /minhas-cidades) e define o preco da assinatura extra.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MapPin, DollarSign, Check, X as XIcon, Clock, Save } from "lucide-react";

interface Pedido {
  id: string;
  cidade: string;
  status: "solicitado" | "aguardando_pagamento" | "ativo" | "recusado";
  valor_cobrado: number | null;
  solicitado_em: string;
  usuario: { nome: string; whatsapp: string; cidade_base: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
  solicitado: "Pedido enviado",
  aguardando_pagamento: "Aguardando pagamento",
  ativo: "Ativo",
  recusado: "Recusado",
};

export default function AdminCidadesAdicionaisPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [preco, setPreco] = useState("0");
  const [salvandoPreco, setSalvandoPreco] = useState(false);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);

  const carregar = () =>
    fetch("/api/admin-master/cidades-adicionais")
      .then((r) => r.json())
      .then((res) => res.success && setPedidos(res.data));

  useEffect(() => {
    Promise.all([
      carregar(),
      fetch("/api/config-preco-cidade-adicional")
        .then((r) => r.json())
        .then((res) => res.success && setPreco(String(res.data.preco))),
    ]).finally(() => setCarregando(false));
  }, []);

  const salvarPreco = async () => {
    setSalvandoPreco(true);
    try {
      const resp = await fetch("/api/config-preco-cidade-adicional", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preco: Number(preco) }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Preço atualizado");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar preço");
    } finally {
      setSalvandoPreco(false);
    }
  };

  const mudarStatus = async (id: string, status: string) => {
    setAtualizandoId(id);
    try {
      const resp = await fetch(`/api/admin-master/cidades-adicionais?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status: status as any } : p)));
      toast.success("Atualizado");
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    } finally {
      setAtualizandoId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-blue-600" /> Cidades adicionais
      </h1>
      <p className="text-sm text-gray-500 mb-6">Pedidos de usuários pra ter acesso a mais de uma cidade.</p>

      <div className="bg-white border rounded-lg p-4 mb-4 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <label className="text-sm text-gray-600 flex-shrink-0">Preço da assinatura adicional (R$)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="w-28 px-2 py-1.5 border rounded-lg text-sm"
        />
        <button
          onClick={salvarPreco}
          disabled={salvandoPreco}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-medium"
        >
          <Save className="w-3.5 h-3.5" /> Salvar
        </button>
      </div>

      <div className="bg-white border rounded-lg divide-y">
        {carregando ? (
          <p className="p-4 text-sm text-gray-400">Carregando...</p>
        ) : pedidos.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">Nenhum pedido ainda.</p>
        ) : (
          pedidos.map((p) => (
            <div key={p.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {p.usuario?.nome || "Usuário"} <span className="text-gray-400 font-normal">· {p.usuario?.whatsapp}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Cidade base: {p.usuario?.cidade_base || "—"} → pediu: <span className="font-medium">{p.cidade}</span>
                  </p>
                  {p.valor_cobrado != null && (
                    <p className="text-xs text-gray-400">R$ {Number(p.valor_cobrado).toFixed(2)}</p>
                  )}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => mudarStatus(p.id, "aguardando_pagamento")}
                  disabled={atualizandoId === p.id || p.status === "aguardando_pagamento"}
                  className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 hover:bg-orange-100 disabled:opacity-40 text-orange-700 rounded-lg text-xs"
                >
                  <Clock className="w-3 h-3" /> Aguardando pagamento
                </button>
                <button
                  onClick={() => mudarStatus(p.id, "ativo")}
                  disabled={atualizandoId === p.id || p.status === "ativo"}
                  className="flex items-center gap-1 px-2.5 py-1 bg-green-50 hover:bg-green-100 disabled:opacity-40 text-green-700 rounded-lg text-xs"
                >
                  <Check className="w-3 h-3" /> Ativar
                </button>
                <button
                  onClick={() => mudarStatus(p.id, "recusado")}
                  disabled={atualizandoId === p.id || p.status === "recusado"}
                  className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-700 rounded-lg text-xs"
                >
                  <XIcon className="w-3 h-3" /> Recusar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
