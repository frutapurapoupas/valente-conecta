"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\comunicados\page.tsx
//
// Comunicado oficial real da home: admin master digita e publica
// (segmentado por grupo/cidade, mesma segmentação do aviso geral por
// push), ou gera sugestões a partir de dados reais do sistema e aprova
// antes de publicar.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Megaphone, Sparkles, Check, Archive, Send } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { GRUPOS_INTERESSE } from "@/lib/gruposInteresse";

interface Comunicado {
  id: string;
  titulo: string;
  mensagem: string;
  origem: "admin" | "ia";
  status: "rascunho" | "publicado" | "arquivado";
  grupos: string[] | null;
  cidades: string[] | null;
  created_at: string;
}

export default function ComunicadosPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerandoSugestoes, setGerandoSugestoes] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [publico, setPublico] = useState<"todos" | "segmentado">("todos");
  const [gruposSelecionados, setGruposSelecionados] = useState<string[]>([]);
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);
  const [cidadesSelecionadas, setCidadesSelecionadas] = useState<string[]>([]);
  const [publicando, setPublicando] = useState(false);

  useEffect(() => {
    setAdmin(getCurrentUser());
    carregar();
    fetch("/api/admin-master/push-audiencia")
      .then((r) => r.json())
      .then((res) => res.success && setCidadesDisponiveis(res.data));
  }, []);

  const carregar = () => {
    fetch("/api/admin-master/comunicados", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => res.success && setComunicados(res.data))
      .finally(() => setLoading(false));
  };

  const rascunhos = comunicados.filter((c) => c.status === "rascunho");
  const publicados = comunicados.filter((c) => c.status === "publicado");

  const gerarSugestoes = async () => {
    setGerandoSugestoes(true);
    try {
      const resp = await fetch("/api/admin-master/comunicados/sugerir", { method: "POST" });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      if (resultado.data.length === 0) toast(resultado.mensagem || "Nada novo pra sugerir");
      else toast.success(`${resultado.data.length} sugestão(ões) gerada(s)`);
      carregar();
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar sugestões");
    } finally {
      setGerandoSugestoes(false);
    }
  };

  const moderarRascunho = async (id: string, acao: "publicar" | "arquivar") => {
    if (!admin?.id) {
      toast.error("Faça o cadastro do Admin Master neste navegador pra poder aprovar");
      return;
    }
    const resp = await fetch(`/api/admin-master/comunicados/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao, adminId: admin.id }),
    });
    const resultado = await resp.json();
    if (!resultado.success) {
      toast.error(resultado.error);
      return;
    }
    toast.success(acao === "publicar" ? "Publicado!" : "Arquivado");
    carregar();
  };

  const arquivarPublicado = (id: string) => moderarRascunho(id, "arquivar");

  const publicar = async () => {
    if (!titulo.trim() || !mensagem.trim()) {
      toast.error("Preencha título e mensagem");
      return;
    }
    if (!admin?.id) {
      toast.error("Faça o cadastro do Admin Master neste navegador pra poder publicar");
      return;
    }
    setPublicando(true);
    try {
      const resp = await fetch("/api/admin-master/comunicados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          mensagem,
          adminId: admin.id,
          grupos: publico === "segmentado" ? gruposSelecionados : undefined,
          cidades: publico === "segmentado" ? cidadesSelecionadas : undefined,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Comunicado publicado!");
      setTitulo("");
      setMensagem("");
      setGruposSelecionados([]);
      setCidadesSelecionadas([]);
      carregar();
    } catch (error: any) {
      toast.error(error.message || "Erro ao publicar");
    } finally {
      setPublicando(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-blue-600" /> Comunicado Oficial
        </h1>
        <p className="text-sm text-gray-500">Aparece no card "Comunicado Oficial" da home.</p>
      </div>

      {rascunhos.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" /> Sugestões aguardando aprovação
          </p>
          <div className="space-y-2">
            {rascunhos.map((c) => (
              <div key={c.id} className="border rounded-lg p-3">
                <p className="font-medium text-sm text-gray-800">{c.titulo}</p>
                <p className="text-sm text-gray-600 mt-0.5">{c.mensagem}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => moderarRascunho(c.id, "publicar")}
                    className="flex items-center gap-1 px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm"
                  >
                    <Check className="w-3 h-3" /> Aprovar e publicar
                  </button>
                  <button
                    onClick={() => moderarRascunho(c.id, "arquivar")}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm"
                  >
                    <Archive className="w-3 h-3" /> Descartar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-4">
        <button
          onClick={gerarSugestoes}
          disabled={gerandoSugestoes}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-lg font-medium text-sm"
        >
          <Sparkles className="w-4 h-4" /> {gerandoSugestoes ? "Analisando dados..." : "Gerar sugestões a partir de dados reais"}
        </button>
        <p className="text-sm text-gray-500 mt-1.5 text-center">
          Baseado em atividade real do app (novos anúncios, cadastros, cidades novas) — nunca inventa números.
        </p>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <p className="font-semibold text-gray-800 mb-3">Escrever comunicado</p>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título"
          maxLength={80}
          className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
        />
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={3}
          maxLength={220}
          placeholder="Mensagem"
          className="w-full px-3 py-2 border rounded-lg text-sm resize-none mb-3"
        />

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setPublico("todos")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${publico === "todos" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}
          >
            Todos
          </button>
          <button
            onClick={() => setPublico("segmentado")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${publico === "segmentado" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}
          >
            Por grupo/cidade
          </button>
        </div>

        {publico === "segmentado" && (
          <div className="space-y-3 bg-gray-50 rounded-lg p-3 mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1.5">Grupos de interesse</p>
              <div className="flex flex-wrap gap-1.5">
                {GRUPOS_INTERESSE.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGruposSelecionados((prev) => (prev.includes(g.id) ? prev.filter((x) => x !== g.id) : [...prev, g.id]))}
                    className={`px-2.5 py-1 rounded-full text-sm border ${gruposSelecionados.includes(g.id) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1.5">Cidades</p>
              {cidadesDisponiveis.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum usuário informou cidade ainda.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {cidadesDisponiveis.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCidadesSelecionadas((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))}
                      className={`px-2.5 py-1 rounded-full text-sm border ${cidadesSelecionadas.includes(c) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={publicar}
          disabled={publicando}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium text-sm"
        >
          <Send className="w-4 h-4" /> {publicando ? "Publicando..." : "Publicar"}
        </button>
      </div>

      <div className="bg-white border rounded-lg divide-y">
        <p className="p-3 text-sm font-semibold text-gray-800">Publicados</p>
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Carregando...</p>
        ) : publicados.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">Nenhum comunicado publicado ainda.</p>
        ) : (
          publicados.map((c) => (
            <div key={c.id} className="p-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{c.titulo}</p>
                <p className="text-sm text-gray-500">{c.mensagem}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {c.origem === "ia" ? "Sugerido pelo sistema" : "Admin master"} ·{" "}
                  {c.grupos || c.cidades ? "Segmentado" : "Todos"}
                </p>
              </div>
              <button onClick={() => arquivarPublicado(c.id)} className="text-sm text-gray-500 hover:text-red-500 shrink-0">
                Arquivar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
