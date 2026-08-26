"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\carrossel\page.tsx
// Admin master define de quanto em quanto tempo o carrossel de destaques
// da home avança sozinho (ver app/api/config-carrossel/route.ts).

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Timer, Save } from "lucide-react";

export default function ConfigCarrosselPage() {
  const [intervalo, setIntervalo] = useState("5");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/config-carrossel")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.intervaloSegundos) setIntervalo(String(res.data.intervaloSegundos));
      })
      .finally(() => setLoading(false));
  }, []);

  const salvar = async () => {
    setSalvando(true);
    try {
      const resp = await fetch("/api/config-carrossel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intervaloSegundos: Number(intervalo) }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Intervalo do carrossel atualizado!");
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
        <Timer className="w-6 h-6 text-blue-600" /> Carrossel da Home
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Define de quantos em quantos segundos os destaques da home (comércio local, Cozinha Chef Neide etc.)
        avançam sozinhos.
      </p>

      <div className="bg-white border rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Intervalo (segundos)</label>
          <input
            type="number"
            min="2"
            value={intervalo}
            onChange={(e) => setIntervalo(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">Mínimo de 2 segundos. Padrão: 5 segundos.</p>
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
