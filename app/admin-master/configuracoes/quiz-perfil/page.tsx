"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\quiz-perfil\page.tsx
// Liga/desliga o quiz de perfil pós-cadastro + mostra quantos usuários já
// responderam, por segmento (ver app/api/quiz-perfil/route.ts).

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipboardList, Wrench, Store, Sparkles } from "lucide-react";

interface Resumo {
  total: number;
  porSegmento: { servico: number; produto: number; geral: number };
}

export default function ConfigQuizPerfilPage() {
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [resumo, setResumo] = useState<Resumo | null>(null);

  useEffect(() => {
    fetch("/api/admin-master/config-quiz-perfil")
      .then((r) => r.json())
      .then((res) => { if (res.success) setAtivo(!!res.data.ativo); })
      .finally(() => setLoading(false));

    fetch("/api/admin-master/quiz-perfil/resumo")
      .then((r) => r.json())
      .then((res) => { if (res.success) setResumo(res.data); })
      .catch(() => {});
  }, []);

  const alternar = async () => {
    setSalvando(true);
    try {
      const resp = await fetch("/api/admin-master/config-quiz-perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativo }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setAtivo(resultado.data.ativo);
      toast.success(resultado.data.ativo ? "Quiz ativado!" : "Quiz desativado.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-blue-600" /> Quiz de Perfil
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Mostrado uma vez pro usuário logo após o cadastro — descobre se é prestador de serviço, dono de loja, ou
        público geral, e adapta as perguntas seguintes.
      </p>

      {loading ? (
        <p className="text-gray-400 text-sm">Carregando...</p>
      ) : (
        <div className="bg-white border rounded-lg p-5 flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-gray-700">Quiz ativo</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {ativo ? "Sendo exibido pros novos usuários." : "Desligado — ninguém vê o quiz agora."}
            </p>
          </div>
          <button
            onClick={alternar}
            disabled={salvando}
            className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-60 ${ativo ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${ativo ? "translate-x-5" : ""}`} />
          </button>
        </div>
      )}

      {resumo && (
        <div className="grid grid-cols-3 gap-3">
          <CardResumo icone={<Wrench className="w-4 h-4" />} label="Prestadores de serviço" valor={resumo.porSegmento.servico} />
          <CardResumo icone={<Store className="w-4 h-4" />} label="Donos de loja" valor={resumo.porSegmento.produto} />
          <CardResumo icone={<Sparkles className="w-4 h-4" />} label="Público geral" valor={resumo.porSegmento.geral} />
        </div>
      )}
    </div>
  );
}

function CardResumo({ icone, label, valor }: { icone: React.ReactNode; label: string; valor: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">{icone} {label}</div>
      <p className="text-2xl font-bold text-gray-800">{valor}</p>
    </div>
  );
}
