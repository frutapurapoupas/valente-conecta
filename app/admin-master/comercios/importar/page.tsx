"use client";

// Caminho: C:\valente_conecta\app\admin-master\comercios\importar\page.tsx
//
// Admin master importa comércios do Google Maps por módulo (mesmo padrão
// já usado em Saúde e Divulgação) — grava em comercios_diretorio
// (056_comercios_diretorio.sql).

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Store, MapPin, Trash2, Eye, EyeOff } from "lucide-react";

interface Cidade { id: string; nome: string }
interface Comercio { id: string; nome: string; modulo: string; categoria: string; telefone: string; endereco: string; status: string }

const MODULOS = [
  { id: "alimentacao", label: "Alimentação" },
  { id: "mercados", label: "Mercados" },
  { id: "moda", label: "Moda" },
  { id: "pet", label: "Pet Shop" },
  { id: "construcao", label: "Construção" },
  { id: "servicos", label: "Serviços" },
  { id: "imoveis", label: "Imóveis (imobiliárias)" },
];

export default function ImportarComerciosAdminPage() {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [cidadeId, setCidadeId] = useState("");
  const [modulo, setModulo] = useState(MODULOS[0].id);
  const [importando, setImportando] = useState(false);
  const [resumo, setResumo] = useState<string | null>(null);
  const [lista, setLista] = useState<Comercio[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/mototaxi?recurso=cidades")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setCidades(res.data);
          if (res.data.length > 0) setCidadeId((prev) => prev || res.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const carregarLista = () => {
    setCarregando(true);
    fetch(`/api/comercios-diretorio?modulo=${modulo}`)
      .then((r) => r.json())
      .then((res) => setLista(res.success ? res.data.map((c: any) => ({ ...c, categoria: c.categoria })) : []))
      .finally(() => setCarregando(false));
  };

  useEffect(() => { carregarLista(); }, [modulo]);

  const importar = async () => {
    if (!cidadeId) {
      toast.error("Escolha uma cidade primeiro");
      return;
    }
    setImportando(true);
    setResumo(null);
    try {
      const resp = await fetch("/api/admin-master/importar-google-places-comercios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cidade_id: cidadeId, modulo }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setResumo(`${resultado.encontrados} estabelecimento(s) encontrado(s), ${resultado.novos} novo(s) adicionado(s).`);
      toast.success(`${resultado.novos} novo(s) importado(s)`);
      carregarLista();
    } catch (err: any) {
      toast.error(err.message || "Erro ao importar do Google Maps");
    } finally {
      setImportando(false);
    }
  };

  const alternarStatus = async (c: Comercio) => {
    await fetch(`/api/comercios-diretorio?id=${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: c.status === "publicado" ? "pausado" : "publicado" }),
    });
    carregarLista();
  };

  const remover = async (id: string) => {
    await fetch(`/api/comercios-diretorio?id=${id}`, { method: "DELETE" });
    carregarLista();
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Store className="w-6 h-6 text-blue-600" /> Importar Comércios
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Diretório público e gratuito, por módulo — alimentação, mercados, moda, pet, construção, serviços e imóveis (imobiliárias).
      </p>

      <div className="bg-white border rounded-lg p-5 mb-4 space-y-3">
        <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400" /> Importar do Google Maps
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select value={modulo} onChange={(e) => setModulo(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white">
            {MODULOS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <select value={cidadeId} onChange={(e) => setCidadeId(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white">
            {cidades.length === 0 && <option value="">Nenhuma cidade ativa</option>}
            {cidades.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <button
            onClick={importar}
            disabled={importando || !cidadeId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium whitespace-nowrap"
          >
            {importando ? "Buscando..." : "Importar"}
          </button>
        </div>
        {resumo && <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{resumo}</p>}
      </div>

      <div className="bg-white border rounded-lg divide-y">
        {carregando ? (
          <p className="p-4 text-sm text-gray-400">Carregando...</p>
        ) : lista.length === 0 ? (
          <p className="p-4 text-sm text-gray-400 text-center">Nenhum estabelecimento nesse módulo ainda.</p>
        ) : (
          lista.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{c.nome} <span className="text-xs text-gray-400">· {c.categoria}</span></p>
                <p className="text-xs text-gray-400 truncate">{c.telefone || "sem telefone"} · {c.endereco || "sem endereço"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => alternarStatus(c)} className="p-1.5 text-gray-400 hover:text-gray-700" title={c.status === "publicado" ? "Pausar" : "Reativar"}>
                  {c.status === "publicado" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => remover(c.id)} className="p-1.5 text-gray-400 hover:text-red-500">
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
