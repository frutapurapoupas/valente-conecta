"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\suporte\page.tsx
// Admin master define o WhatsApp e email oficiais de suporte da
// plataforma (ver app/api/config-suporte/route.ts). Usado em
// app/ajuda/page.tsx, app/servico-indisponivel/page.tsx e
// app/comercio/page.tsx.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LifeBuoy, Save } from "lucide-react";

export default function ConfigSuportePage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/config-suporte")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setWhatsapp(res.data.whatsapp || "");
          setEmail(res.data.email || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const salvar = async () => {
    setSalvando(true);
    try {
      const resp = await fetch("/api/config-suporte", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp, email }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Contato de suporte atualizado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-400 text-sm">Carregando...</p>;

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <LifeBuoy className="w-6 h-6 text-blue-600" /> Contato de Suporte
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Usado na Central de Ajuda e nas telas de "serviço indisponível" e do carrinho de comércio, pra onde vão
        os pedidos e solicitações de quem usa o app.
      </p>

      <div className="bg-white border rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (DDD + número, sem o 55)</label>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
            placeholder="75998203242"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="suporte@exemplo.com"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium"
        >
          <Save className="w-4 h-4" /> {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
