"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\interesses-popup\page.tsx
// Liga/desliga o pop-up periódico de itens de interesse + intervalo entre
// checagens (ver app/api/admin-master/config-interesses-popup/route.ts).

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";

export default function ConfigInteressesPopupPage() {
  const [ativo, setAtivo] = useState(true);
  const [intervaloHoras, setIntervaloHoras] = useState(24);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/admin-master/config-interesses-popup")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setAtivo(!!res.data.ativo);
          setIntervaloHoras(res.data.intervaloHoras || 24);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const salvar = async (novoAtivo = ativo, novoIntervalo = intervaloHoras) => {
    setSalvando(true);
    try {
      const resp = await fetch("/api/admin-master/config-interesses-popup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: novoAtivo, intervaloHoras: novoIntervalo }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setAtivo(resultado.data.ativo);
      setIntervaloHoras(resultado.data.intervaloHoras);
      toast.success("Salvo!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-blue-600" /> Pop-up de Interesses
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Mostra periodicamente itens já publicados no app que batem com o que o usuário disse ter interesse no quiz de
        perfil (só funciona pra quem escolheu "Só quero aproveitar o app").
      </p>

      {loading ? (
        <p className="text-gray-400 text-sm">Carregando...</p>
      ) : (
        <div className="bg-white border rounded-lg p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Pop-up ativo</p>
              <p className="text-xs text-gray-400 mt-0.5">{ativo ? "Sendo exibido pros usuários." : "Desligado."}</p>
            </div>
            <button
              onClick={() => salvar(!ativo)}
              disabled={salvando}
              className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-60 ${ativo ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${ativo ? "translate-x-5" : ""}`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intervalo mínimo entre exibições</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={intervaloHoras}
                onChange={(e) => setIntervaloHoras(Number(e.target.value) || 24)}
                onBlur={() => salvar(ativo, intervaloHoras)}
                className="w-24 px-3 py-2 border rounded-lg text-sm"
              />
              <span className="text-sm text-gray-500">horas</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
