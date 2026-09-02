"use client";

// Caminho: C:\valente_conecta\app\admin-master\validacao-motorista\page.tsx
//
// Admin master revisa motoristas de Moto-Táxi e Carona Solidária (ver
// 097_validacao_motorista.sql) -- aprovar libera o selo "Validado pelo
// Valente Conecta" no catálogo público. Mesmo layout de
// app/admin-master/pdv-catalogo/moderacao/page.tsx, com abas pros dois
// módulos (mesma estrutura de dados nas duas tabelas).

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, ShieldCheck, Bike, Car } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

interface ItemValidacao {
  id: string;
  nome: string;
  veiculo: string;
  placa: string;
  cnh_numero: string;
  foto_url: string | null;
  veiculo_foto_url: string | null;
  cnh_foto_url: string | null;
}

const ABAS = [
  { tipo: "mototaxi", label: "Moto-Táxi", icone: Bike },
  { tipo: "carona", label: "Carona Solidária", icone: Car },
] as const;

export default function ValidacaoMotoristaPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [aba, setAba] = useState<"mototaxi" | "carona">("mototaxi");
  const [lista, setLista] = useState<ItemValidacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [motivoPorId, setMotivoPorId] = useState<Record<string, string>>({});

  const carregar = (tipo: string) => {
    setLoading(true);
    fetch(`/api/admin-master/validacao-motorista?tipo=${tipo}&status=pendente`)
      .then((r) => r.json())
      .then((resp) => setLista(resp.success ? resp.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setAdmin(getCurrentUser());
  }, []);

  useEffect(() => {
    carregar(aba);
  }, [aba]);

  const processar = async (id: string, acao: "aprovar" | "recusar") => {
    setProcessando(id);
    try {
      const resp = await fetch(`/api/admin-master/validacao-motorista?tipo=${aba}&id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, adminId: admin?.id, motivo: motivoPorId[id] || undefined }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(acao === "aprovar" ? "Aprovado — selo liberado!" : "Recusado");
      setLista((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar");
    } finally {
      setProcessando(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-blue-600" /> Validação de motoristas
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Revise as fotos e documentos enviados no cadastro. Aprovar libera o selo "Validado pelo Valente Conecta" no catálogo público.
      </p>

      <div className="flex gap-2 mb-6">
        {ABAS.map((a) => {
          const Icone = a.icone;
          return (
            <button
              key={a.tipo}
              onClick={() => setAba(a.tipo)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
                aba === a.tipo ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              <Icone className="w-4 h-4" /> {a.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : lista.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500 text-sm">Nenhum motorista pendente.</div>
      ) : (
        <div className="space-y-3">
          {lista.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-4">
              <div className="flex gap-3 mb-3">
                {item.foto_url && <img src={item.foto_url} alt="Motorista" className="w-20 h-20 object-cover rounded-lg border" />}
                {item.veiculo_foto_url && <img src={item.veiculo_foto_url} alt="Veículo" className="w-20 h-20 object-cover rounded-lg border" />}
                {item.cnh_foto_url && <img src={item.cnh_foto_url} alt="CNH" className="w-20 h-20 object-cover rounded-lg border" />}
              </div>
              <p className="font-medium text-sm text-gray-800">{item.nome}</p>
              <p className="text-sm text-gray-500 mb-2">{item.veiculo} · placa {item.placa} · CNH {item.cnh_numero}</p>
              <input
                value={motivoPorId[item.id] || ""}
                onChange={(e) => setMotivoPorId((prev) => ({ ...prev, [item.id]: e.target.value }))}
                placeholder="Motivo da recusa (opcional se aprovar)"
                className="w-full mb-3 px-3 py-1.5 border rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => processar(item.id, "aprovar")}
                  disabled={processando === item.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                </button>
                <button
                  onClick={() => processar(item.id, "recusar")}
                  disabled={processando === item.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  <XCircle className="w-3.5 h-3.5" /> Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
