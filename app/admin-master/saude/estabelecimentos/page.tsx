"use client";

// Caminho: C:\valente_conecta\app\admin-master\saude\estabelecimentos\page.tsx
//
// Admin master gerencia o diretorio publico e gratuito de hospitais/
// clinicas/consultorios/laboratorios/farmacias (053_saude_estabelecimentos.sql).
// Importa em massa do Google Maps (mesmo padrao ja usado em Divulgacao) e
// permite pausar/reativar/excluir manualmente.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HeartPulse, MapPin, Trash2, EyeOff, Eye } from "lucide-react";

interface Cidade {
  id: string;
  nome: string;
}

interface Estabelecimento {
  id: string;
  nome: string;
  tipo: string;
  especialidades: string[];
  telefone: string;
  endereco: string;
  cidade: string;
  horario: string;
  status: string;
}

const TIPO_LABEL: Record<string, string> = {
  hospital: "Hospital",
  clinica: "Clínica",
  consultorio: "Consultório",
  laboratorio: "Laboratório",
  farmacia: "Farmácia",
  outro: "Outro",
};

export default function SaudeEstabelecimentosAdminPage() {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [cidadeId, setCidadeId] = useState("");
  const [importando, setImportando] = useState(false);
  const [resumo, setResumo] = useState<string | null>(null);
  const [lista, setLista] = useState<Estabelecimento[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarCidades = async () => {
    try {
      const resp = await fetch("/api/mototaxi?recurso=cidades");
      const resultado = await resp.json();
      if (resultado.success) {
        setCidades(resultado.data);
        if (resultado.data.length > 0) setCidadeId((prev) => prev || resultado.data[0].id);
      }
    } catch {
      // silencioso
    }
  };

  const carregarLista = async () => {
    setCarregando(true);
    try {
      const resp = await fetch("/api/saude/estabelecimentos");
      const resultado = await resp.json();
      setLista(resultado.success ? resultado.data : []);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarCidades();
    carregarLista();
  }, []);

  const importar = async () => {
    if (!cidadeId) {
      toast.error("Escolha uma cidade primeiro");
      return;
    }
    setImportando(true);
    setResumo(null);
    try {
      const resp = await fetch("/api/admin-master/importar-google-places-saude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cidade_id: cidadeId }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setResumo(`${resultado.encontrados} estabelecimento(s) encontrado(s), ${resultado.novos} novo(s) adicionado(s) ao diretório.`);
      toast.success(`${resultado.novos} novo(s) importado(s)`);
      carregarLista();
    } catch (err: any) {
      toast.error(err.message || "Erro ao importar do Google Maps");
    } finally {
      setImportando(false);
    }
  };

  const alternarStatus = async (e: Estabelecimento) => {
    await fetch(`/api/saude/estabelecimentos?id=${e.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: e.status === "publicado" ? "pausado" : "publicado" }),
    });
    carregarLista();
  };

  const remover = async (id: string) => {
    await fetch(`/api/saude/estabelecimentos?id=${id}`, { method: "DELETE" });
    carregarLista();
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <HeartPulse className="w-6 h-6 text-red-600" /> Saúde — Hospitais e Clínicas
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Diretório público e gratuito (sem taxa de desbloqueio de contato) — hospitais, clínicas, consultórios, laboratórios e farmácias.
      </p>

      <div className="bg-white border rounded-lg p-5 mb-4 space-y-3">
        <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400" /> Importar do Google Maps
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={cidadeId}
            onChange={(e) => setCidadeId(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 bg-white"
          >
            {cidades.length === 0 && <option value="">Nenhuma cidade ativa</option>}
            {cidades.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <button
            onClick={importar}
            disabled={importando || !cidadeId}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium whitespace-nowrap"
          >
            {importando ? "Buscando..." : "Importar do Google Maps"}
          </button>
        </div>
        {resumo && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{resumo}</p>}
      </div>

      <div className="bg-white border rounded-lg divide-y">
        {carregando ? (
          <p className="p-4 text-sm text-gray-500">Carregando...</p>
        ) : lista.length === 0 ? (
          <p className="p-4 text-sm text-gray-500 text-center">Nenhum estabelecimento cadastrado ainda.</p>
        ) : (
          lista.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {e.nome} <span className="text-sm text-gray-500">· {TIPO_LABEL[e.tipo] || e.tipo}</span>
                </p>
                <p className="text-sm text-gray-500 truncate">{e.telefone || "sem telefone"} · {e.endereco || "sem endereço"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => alternarStatus(e)} className="p-1.5 text-gray-400 hover:text-gray-700" title={e.status === "publicado" ? "Pausar" : "Reativar"}>
                  {e.status === "publicado" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => remover(e.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
