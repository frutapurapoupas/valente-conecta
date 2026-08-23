"use client";

// Caminho: C:\valente_conecta\app\admin-master\pdv\importacao-fotos\page.tsx
//
// Moderação das fotos enviadas por lojistas pra substituir o placeholder de
// itens publicados via importação de planilha (app/pdv/importar-estoque).
// Só tem fila aqui quando o toggle abaixo está com auto=false.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Camera, Check, Image as ImageIcon, X } from "lucide-react";

interface ItemPendente {
  id: string;
  titulo: string;
  midia: { url: string; thumb_url: string }[];
  metadata: { foto_pendente_aprovacao?: { url: string; thumb_url: string } };
}

export default function ImportacaoFotosAdminPage() {
  const [itens, setItens] = useState<ItemPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [auto, setAuto] = useState(false);
  const [salvandoToggle, setSalvandoToggle] = useState(false);

  useEffect(() => {
    carregar();
    carregarConfig();
  }, []);

  const carregar = async () => {
    setLoading(true);
    try {
      const resposta = await fetch("/api/admin-master/pdv/importacao-fotos", { cache: "no-store" });
      const resultado = await resposta.json();
      if (resultado.success) setItens(resultado.data);
    } finally {
      setLoading(false);
    }
  };

  const carregarConfig = async () => {
    const resposta = await fetch("/api/admin-master/pdv/importacao-fotos-config", { cache: "no-store" });
    const resultado = await resposta.json();
    if (resultado.success) setAuto(Boolean(resultado.data.auto));
  };

  const alternarAuto = async () => {
    setSalvandoToggle(true);
    const novoValor = !auto;
    try {
      const resposta = await fetch("/api/admin-master/pdv/importacao-fotos-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto: novoValor }),
      });
      const resultado = await resposta.json();
      if (!resultado.success) throw new Error(resultado.error);
      setAuto(novoValor);
      toast.success(novoValor ? "Aprovação automática ativada" : "Aprovação manual ativada");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar");
    } finally {
      setSalvandoToggle(false);
    }
  };

  const moderar = async (id: string, aprovar: boolean) => {
    try {
      const resposta = await fetch("/api/admin-master/pdv/importacao-fotos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, aprovar }),
      });
      const resultado = await resposta.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(aprovar ? "Foto aprovada" : "Foto rejeitada");
      setItens((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      toast.error(err?.message || "Erro ao moderar");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-600" /> Fotos da importação de planilha
          </h1>
          <p className="text-sm text-gray-500">Lojistas atualizando a foto provisória de itens importados por planilha.</p>
        </div>

        <button
          onClick={alternarAuto}
          disabled={salvandoToggle}
          className={`px-4 py-2 rounded-xl text-sm font-medium border ${
            auto ? "bg-green-50 border-green-300 text-green-700" : "bg-gray-50 border-gray-300 text-gray-600"
          } disabled:opacity-50`}
        >
          Aprovação {auto ? "automática" : "manual"} — clique para trocar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {loading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Carregando...</p>
        ) : itens.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center flex items-center justify-center gap-2">
            <ImageIcon className="w-4 h-4" /> Nenhuma foto aguardando aprovação.
          </p>
        ) : (
          <div className="space-y-3">
            {itens.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b last:border-0 pb-3 last:pb-0">
                <img
                  src={item.midia?.[0]?.thumb_url}
                  alt="Foto atual"
                  className="w-14 h-14 rounded-lg object-cover border bg-gray-50"
                  title="Foto atual (placeholder)"
                />
                <img
                  src={item.metadata.foto_pendente_aprovacao?.thumb_url}
                  alt="Foto enviada"
                  className="w-14 h-14 rounded-lg object-cover border"
                  title="Foto enviada pelo lojista"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.titulo}</p>
                </div>
                <button onClick={() => moderar(item.id, true)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => moderar(item.id, false)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
