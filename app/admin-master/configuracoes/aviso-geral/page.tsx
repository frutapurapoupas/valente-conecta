"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\aviso-geral\page.tsx
// Admin master manda um aviso por push pra todo mundo que ja usa o app
// (tem inscricao de notificacao ativa) — sem custo, sem precisar de
// WhatsApp Business API. Pra quem ainda nao usa o app, ver
// /admin-master/configuracoes/divulgacao.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Megaphone, Send } from "lucide-react";
import { GRUPOS_INTERESSE } from "@/lib/gruposInteresse";

export default function AvisoGeralPage() {
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [url, setUrl] = useState("/");
  const [enviando, setEnviando] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState<{ enviados: number; total: number } | null>(null);
  const [publico, setPublico] = useState<"todos" | "segmentado">("todos");
  const [gruposSelecionados, setGruposSelecionados] = useState<string[]>([]);
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);
  const [cidadesSelecionadas, setCidadesSelecionadas] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin-master/push-audiencia")
      .then((r) => r.json())
      .then((res) => res.success && setCidadesDisponiveis(res.data))
      .catch(() => {});
  }, []);

  const alternarGrupo = (id: string) => {
    setGruposSelecionados((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  };
  const alternarCidade = (nome: string) => {
    setCidadesSelecionadas((prev) => (prev.includes(nome) ? prev.filter((c) => c !== nome) : [...prev, nome]));
  };

  const enviar = async () => {
    if (!titulo.trim() || !mensagem.trim()) {
      toast.error("Preencha título e mensagem");
      return;
    }
    if (publico === "segmentado" && gruposSelecionados.length === 0 && cidadesSelecionadas.length === 0) {
      toast.error("Escolha ao menos um grupo ou cidade, ou mude o público para \"Todos\"");
      return;
    }
    setEnviando(true);
    try {
      const resp = await fetch("/api/admin-master/aviso-geral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          mensagem,
          url,
          grupos: publico === "segmentado" ? gruposSelecionados : undefined,
          cidades: publico === "segmentado" ? cidadesSelecionadas : undefined,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setUltimoResultado(resultado.data);
      toast.success(`Enviado para ${resultado.data.enviados} de ${resultado.data.total} usuários.`);
      setTitulo("");
      setMensagem("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar aviso");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Megaphone className="w-6 h-6 text-blue-600" /> Aviso Geral
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Manda uma notificação por push pra todo mundo que já usa o app e ativou as notificações. Bom pra
        anunciar novidades, campanhas, ou convidar pra indicar amigos.
      </p>

      <div className="bg-white border rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Novidade no Valente Conecta!"
            maxLength={60}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={3}
            maxLength={180}
            placeholder="Ex: Conheça o novo módulo de Moda — roupas e calçados perto de você!"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link ao tocar (opcional)</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/moda"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Público</label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setPublico("todos")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                publico === "todos" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setPublico("segmentado")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                publico === "segmentado" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              Por grupo/cidade
            </button>
          </div>

          {publico === "segmentado" && (
            <div className="space-y-3 bg-gray-50 rounded-lg p-3">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1.5">Grupos de interesse</p>
                <div className="flex flex-wrap gap-1.5">
                  {GRUPOS_INTERESSE.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => alternarGrupo(g.id)}
                      className={`px-2.5 py-1 rounded-full text-xs border ${
                        gruposSelecionados.includes(g.id)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-1.5">Cidades</p>
                {cidadesDisponiveis.length === 0 ? (
                  <p className="text-xs text-gray-400">Nenhum usuário informou cidade ainda.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {cidadesDisponiveis.map((c) => (
                      <button
                        key={c}
                        onClick={() => alternarCidade(c)}
                        className={`px-2.5 py-1 rounded-full text-xs border ${
                          cidadesSelecionadas.includes(c)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                Sem escolher nenhuma cidade, alcança o grupo em todas as cidades. Sem escolher nenhum grupo, alcança todo mundo da(s) cidade(s) marcada(s).
              </p>
            </div>
          )}
        </div>

        <button
          onClick={enviar}
          disabled={enviando}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium"
        >
          <Send className="w-4 h-4" /> {enviando ? "Enviando..." : publico === "todos" ? "Enviar para todos" : "Enviar para o público selecionado"}
        </button>

        {ultimoResultado && (
          <p className="text-xs text-gray-400 text-center">
            Último envio: {ultimoResultado.enviados} de {ultimoResultado.total} usuários alcançados.
          </p>
        )}
      </div>
    </div>
  );
}
