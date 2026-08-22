"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\divulgacao\page.tsx
//
// Divulgacao pra gente que ainda NAO usa o app: admin digita contato a
// contato ou sobe uma planilha (.xlsx/.csv), escreve a mensagem-convite uma
// vez, e pra cada contato aparece um botao que abre o WhatsApp ja com a
// mensagem pronta (link wa.me). Nao dispara nada sozinho: e' um envio um a
// um, clicado pelo admin — a API oficial paga do WhatsApp Business nao foi
// contratada, entao esse e' o jeito seguro de nao correr risco de o numero
// ser bloqueado por disparo automatico em massa.

import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { UserPlus, Upload, Trash2, MessageCircle, Check, Users, MapPin } from "lucide-react";

interface Contato {
  id: string;
  nome: string | null;
  telefone: string;
  origem: "manual" | "planilha" | "google_places";
  status: "pendente" | "enviado";
  criado_em: string;
  categoria?: string | null;
  endereco?: string | null;
}

interface Cidade {
  id: string;
  nome: string;
}

const MENSAGEM_PADRAO =
  "Oi! Te chamando pra conhecer o Valente Conecta, o app que reúne comércios e serviços de Valente-BA num só lugar. Dá uma olhada: https://valente-conecta-five.vercel.app";

export default function DivulgacaoPage() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState(MENSAGEM_PADRAO);
  const [filtro, setFiltro] = useState<"todos" | "pendente" | "enviado">("pendente");
  const [enviandoManual, setEnviandoManual] = useState(false);
  const [importando, setImportando] = useState(false);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [cidadeId, setCidadeId] = useState("");
  const [importandoGoogle, setImportandoGoogle] = useState(false);
  const [resumoGoogle, setResumoGoogle] = useState<string | null>(null);

  const carregar = async () => {
    try {
      const resp = await fetch("/api/admin-master/contatos-divulgacao");
      const resultado = await resp.json();
      if (resultado.success) setContatos(resultado.data);
    } finally {
      setCarregando(false);
    }
  };

  const carregarCidades = async () => {
    try {
      const resp = await fetch("/api/mototaxi?recurso=cidades");
      const resultado = await resp.json();
      if (resultado.success) {
        setCidades(resultado.data);
        if (resultado.data.length > 0) setCidadeId((prev) => prev || resultado.data[0].id);
      }
    } catch {
      // silencioso — o seletor so fica vazio, importacao do Google exige escolher cidade
    }
  };

  useEffect(() => {
    carregar();
    carregarCidades();
  }, []);

  const importarDoGoogle = async () => {
    if (!cidadeId) {
      toast.error("Escolha uma cidade primeiro");
      return;
    }
    setImportandoGoogle(true);
    setResumoGoogle(null);
    try {
      const resp = await fetch("/api/admin-master/importar-google-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cidade_id: cidadeId }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setResumoGoogle(
        `${resultado.encontrados} comércio(s) encontrado(s), ${resultado.comTelefone} com telefone, ${resultado.novos} novo(s) adicionado(s) à lista.`
      );
      toast.success(`${resultado.novos} contato(s) novo(s) importado(s)`);
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao importar do Google Maps");
    } finally {
      setImportandoGoogle(false);
    }
  };

  const adicionarManual = async () => {
    const telefoneLimpo = telefone.replace(/\D/g, "");
    if (telefoneLimpo.length < 10) {
      toast.error("Informe um telefone válido (com DDD)");
      return;
    }
    setEnviandoManual(true);
    try {
      const resp = await fetch("/api/admin-master/contatos-divulgacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone: telefoneLimpo }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Contato adicionado");
      setNome("");
      setTelefone("");
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao adicionar contato");
    } finally {
      setEnviandoManual(false);
    }
  };

  const importarPlanilha = async (arquivo: File) => {
    setImportando(true);
    try {
      const form = new FormData();
      form.append("arquivo", arquivo);
      const resp = await fetch("/api/admin-master/contatos-divulgacao", { method: "POST", body: form });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(`${resultado.importados} contato(s) importado(s) da planilha`);
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao importar planilha");
    } finally {
      setImportando(false);
      if (inputArquivoRef.current) inputArquivoRef.current.value = "";
    }
  };

  const abrirWhatsapp = async (contato: Contato) => {
    const link = `https://wa.me/55${contato.telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(link, "_blank");
    if (contato.status === "pendente") {
      await fetch(`/api/admin-master/contatos-divulgacao?id=${contato.id}`, { method: "PUT" });
      setContatos((prev) => prev.map((c) => (c.id === contato.id ? { ...c, status: "enviado" } : c)));
    }
  };

  const excluir = async (id: string) => {
    await fetch(`/api/admin-master/contatos-divulgacao?id=${id}`, { method: "DELETE" });
    setContatos((prev) => prev.filter((c) => c.id !== id));
  };

  const contatosFiltrados = contatos.filter((c) => filtro === "todos" || c.status === filtro);
  const pendentes = contatos.filter((c) => c.status === "pendente").length;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <UserPlus className="w-6 h-6 text-blue-600" /> Divulgação
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Convide quem ainda não usa o app. Adicione contatos manualmente ou suba uma planilha, escreva a
        mensagem e clique em cada um pra abrir o WhatsApp já com o texto pronto.
      </p>

      <div className="bg-white border rounded-lg p-5 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem do convite</label>
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
        />
      </div>

      <div className="bg-white border rounded-lg p-5 mb-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Adicionar contato manualmente</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome (opcional)"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="WhatsApp (com DDD)"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={adicionarManual}
            disabled={enviandoManual}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium whitespace-nowrap"
          >
            Adicionar
          </button>
        </div>

        <div className="pt-1">
          <input
            ref={inputArquivoRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importarPlanilha(e.target.files[0])}
          />
          <button
            onClick={() => inputArquivoRef.current?.click()}
            disabled={importando}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-gray-600 rounded-lg text-sm"
          >
            <Upload className="w-4 h-4" /> {importando ? "Importando..." : "Importar planilha (.xlsx/.csv)"}
          </button>
          <p className="text-xs text-gray-400 mt-1">
            Coluna A = nome, coluna B = telefone (ou só uma coluna com o telefone).
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-5 mb-4 space-y-3">
        <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400" /> Importar comércios do Google Maps
        </p>
        <p className="text-xs text-gray-400">
          Busca nome, categoria, endereço e telefone dos comércios cadastrados no Google Maps dentro da
          cidade escolhida, e adiciona à lista abaixo (sem duplicar quem já está aqui).
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={cidadeId}
            onChange={(e) => setCidadeId(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {cidades.length === 0 && <option value="">Nenhuma cidade ativa</option>}
            {cidades.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <button
            onClick={importarDoGoogle}
            disabled={importandoGoogle || !cidadeId}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium whitespace-nowrap"
          >
            {importandoGoogle ? "Buscando..." : "Importar do Google Maps"}
          </button>
        </div>
        {resumoGoogle && <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{resumoGoogle}</p>}
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 text-sm">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">{pendentes} pendente(s) de {contatos.length}</span>
        </div>
        <div className="flex gap-1 text-xs">
          {(["pendente", "enviado", "todos"] as const).map((op) => (
            <button
              key={op}
              onClick={() => setFiltro(op)}
              className={`px-2.5 py-1 rounded-full border ${
                filtro === op ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              {op === "pendente" ? "Pendentes" : op === "enviado" ? "Enviados" : "Todos"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-lg divide-y">
        {carregando ? (
          <p className="p-4 text-sm text-gray-400">Carregando...</p>
        ) : contatosFiltrados.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">Nenhum contato aqui.</p>
        ) : (
          contatosFiltrados.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{c.nome || "(sem nome)"}</p>
                <p className="text-xs text-gray-400 truncate">
                  {c.telefone} ·{" "}
                  {c.origem === "planilha" ? "planilha" : c.origem === "google_places" ? "Google Maps" : "manual"}
                  {c.categoria ? ` · ${c.categoria}` : ""}
                </p>
                {c.endereco && <p className="text-xs text-gray-300 truncate">{c.endereco}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.status === "enviado" && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="w-3.5 h-3.5" /> enviado
                  </span>
                )}
                <button
                  onClick={() => abrirWhatsapp(c)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <button onClick={() => excluir(c.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
