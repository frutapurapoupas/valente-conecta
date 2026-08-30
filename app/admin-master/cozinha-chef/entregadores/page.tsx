"use client";

// Caminho: C:\valente_conecta\app\admin-master\cozinha-chef\entregadores\page.tsx
//
// Cadastro de entregador PROPRIO da cozinha (088_entrega_avulsa.sql,
// tabela generica entregadores_proprios). Enquanto nao houver nenhum ativo
// aqui, toda entrega paga vai pro pool compartilhado de Moto Taxi
// (app/api/cozinha/pedidos/route.ts::despacharEntrega decide isso
// sozinho). Mesmo padrao de link-por-WhatsApp ja usado no Agua e Gas.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bike, Plus, Power, Send } from "lucide-react";

interface Entregador {
  id: string;
  nome: string;
  telefone: string;
  veiculo: string | null;
  ativo: boolean;
  latitude: number | null;
  longitude: number | null;
}

export default function EntregadoresCozinhaPage() {
  const [lista, setLista] = useState<Entregador[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregar = () => {
    setLoading(true);
    fetch("/api/entregadores-proprios?origemModulo=cozinha")
      .then((r) => r.json())
      .then((resp) => setLista(resp.success ? resp.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const cadastrar = async () => {
    if (!nome.trim() || !telefone.trim()) {
      toast.error("Preencha nome e telefone");
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch("/api/entregadores-proprios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origemModulo: "cozinha", nome, telefone, veiculo: veiculo || undefined }),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      toast.success("Entregador cadastrado!");
      setNome(""); setTelefone(""); setVeiculo(""); setMostrarForm(false);
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar");
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (ent: Entregador) => {
    await fetch(`/api/entregadores-proprios?id=${ent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ent.ativo }),
    });
    carregar();
  };

  const enviarLink = (ent: Entregador) => {
    const link = `${window.location.origin}/entregador/${ent.id}`;
    const numero = ent.telefone.replace(/\D/g, "");
    window.open(`https://wa.me/${numero.startsWith("55") ? numero : `55${numero}`}?text=${encodeURIComponent(`Oi ${ent.nome}! Use este link pra ligar sua localização durante as entregas: ${link}`)}`, "_blank");
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bike className="w-6 h-6 text-orange-600" /> Entregadores próprios</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Novo
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Sem nenhum ativo aqui, toda entrega paga aciona o pool de Moto Táxi automaticamente. Com um ativo, a entrega vai direto pra ele.
      </p>

      {mostrarForm && (
        <div className="bg-white border rounded-xl p-4 mb-4 space-y-3">
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone/WhatsApp (com DDD)" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <input value={veiculo} onChange={(e) => setVeiculo(e.target.value)} placeholder="Veículo (opcional)" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <button onClick={cadastrar} disabled={salvando} className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
            {salvando ? "Salvando..." : "Cadastrar"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : lista.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500 text-sm">Nenhum entregador próprio cadastrado ainda.</div>
      ) : (
        <div className="space-y-2">
          {lista.map((ent) => (
            <div key={ent.id} className="bg-white border rounded-xl p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-800">{ent.nome}</p>
                <p className="text-xs text-gray-400">{ent.telefone} {ent.veiculo && `· ${ent.veiculo}`}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => enviarLink(ent)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Enviar link por WhatsApp">
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alternarAtivo(ent)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium ${ent.ativo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                >
                  <Power className="w-3.5 h-3.5" /> {ent.ativo ? "Ativo" : "Inativo"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
