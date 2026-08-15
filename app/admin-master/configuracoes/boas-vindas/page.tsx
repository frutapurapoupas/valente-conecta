"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\boas-vindas\page.tsx
// Admin master sobe (ou troca) o video de boas-vindas exibido em pop-up
// pro usuario logo apos o cadastro, nas primeiras 2 aberturas do app. O
// video pode ser enviado com o pop-up ainda DESLIGADO ("ativo": false) —
// so liga de fato quando o admin marcar o interruptor, o que permite
// preparar o arquivo com antecedencia sem impactar ninguem.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PlayCircle, Upload, Sparkles } from "lucide-react";

interface ConfigBoasVindas {
  url: string | null;
  ativo: boolean;
  atualizadoEm: string | null;
}

export default function ConfigBoasVindasPage() {
  const [config, setConfig] = useState<ConfigBoasVindas>({ url: null, ativo: false, atualizadoEm: null });
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [salvandoToggle, setSalvandoToggle] = useState(false);

  const carregar = () => {
    fetch("/api/admin-master/config-boas-vindas")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setConfig(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const handleArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (!arquivo.type.startsWith("video/")) {
      toast.error("Envie um arquivo de vídeo (mp4, webm...)");
      return;
    }
    if (arquivo.size > 4 * 1024 * 1024) {
      toast.error("Vídeo maior que 4MB — comprima antes de enviar (limite do upload direto).");
      return;
    }

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      formData.append("pasta", "boas-vindas");
      const resp = await fetch("/api/upload/institucional", { method: "POST", body: formData });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      const respConfig = await fetch("/api/admin-master/config-boas-vindas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: resultado.url }),
      });
      const resultadoConfig = await respConfig.json();
      if (!resultadoConfig.success) throw new Error(resultadoConfig.error);

      toast.success("Vídeo enviado! Ative o pop-up abaixo quando quiser publicar.");
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar vídeo");
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  };

  const alternarAtivo = async () => {
    if (!config.url) {
      toast.error("Envie o vídeo antes de ativar o pop-up.");
      return;
    }
    setSalvandoToggle(true);
    try {
      const resp = await fetch("/api/admin-master/config-boas-vindas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !config.ativo }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setConfig(resultado.data);
      toast.success(resultado.data.ativo ? "Pop-up ativado! Já vale para novos cadastros." : "Pop-up desativado.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    } finally {
      setSalvandoToggle(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-emerald-600" /> Vídeo de Boas-vindas
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Esse vídeo aparece em pop-up pro usuário logo depois do cadastro, nas primeiras 2 vezes que ele abrir o
        app pelo ícone da tela inicial. Você pode subir o arquivo agora e só ativar o pop-up quando estiver pronto.
      </p>

      {loading ? (
        <p className="text-gray-400 text-sm">Carregando...</p>
      ) : (
        <div className="bg-white border rounded-lg p-5 space-y-4">
          <p className="text-sm font-medium text-gray-700">Vídeo atual</p>
          {config.url ? (
            <>
              <video src={config.url} controls className="w-full max-h-80 rounded-lg bg-black" />
              {config.atualizadoEm && (
                <p className="text-xs text-gray-400">Atualizado em {new Date(config.atualizadoEm).toLocaleString("pt-BR")}</p>
              )}
            </>
          ) : (
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm text-center px-4">
              Nenhum vídeo enviado ainda. Envie o arquivo aqui assim que estiver pronto.
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Enviar vídeo (até 4MB)</span>
            <div className="mt-2">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg font-medium cursor-pointer">
                <Upload className="w-4 h-4" />
                {enviando ? "Enviando..." : config.url ? "Trocar vídeo" : "Escolher arquivo de vídeo"}
                <input type="file" accept="video/*" className="hidden" onChange={handleArquivo} disabled={enviando} />
              </label>
            </div>
          </label>

          <div className="pt-4 border-t flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4 text-emerald-600" /> Pop-up ativo
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {config.ativo ? "Sendo exibido pros usuários agora." : "Desligado — nada é exibido, mesmo com vídeo enviado."}
              </p>
            </div>
            <button
              onClick={alternarAtivo}
              disabled={salvandoToggle}
              className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-60 ${config.ativo ? "bg-emerald-600" : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${config.ativo ? "translate-x-5" : ""}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
