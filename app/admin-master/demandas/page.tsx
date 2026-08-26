"use client";

// Caminho: C:\valente_conecta\app\admin-master\demandas\page.tsx
// Lista quem buscou algo que ninguem publicou ainda na plataforma. Permite
// avisar fornecedores do modulo (push automatico + WhatsApp manual) e
// marcar como atendida quando o produto/servico aparecer (avisa por push
// quem fez a busca).

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BellRing, Clock, CheckCircle2, Send, MessageCircle } from "lucide-react";
import { LABEL_MODULO, type ModuloId } from "@/lib/catalogo/marketplaceTypes";

interface Demanda {
  id: string;
  termo: string;
  modulo: string | null;
  usuario_nome: string | null;
  usuario_telefone: string | null;
  status: string;
  created_at: string;
  atendido_em: string | null;
}

export default function AdminDemandasPage() {
  const [itens, setItens] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificando, setNotificando] = useState<string | null>(null);
  const [resultadoNotificacao, setResultadoNotificacao] = useState<Record<string, { totalNotificados: number; linkCadastro: string; fornecedores: { nome: string; whatsapp: string }[] }>>({});

  const carregar = () => {
    fetch("/api/admin-master/demandas-busca")
      .then((r) => r.json())
      .then((res) => setItens(res.success ? res.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const notificarFornecedores = async (demandaId: string) => {
    setNotificando(demandaId);
    try {
      const resp = await fetch("/api/admin-master/demandas-busca/notificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demandaId }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setResultadoNotificacao((prev) => ({ ...prev, [demandaId]: resultado.data }));
      toast.success(`${resultado.data.totalNotificados} fornecedor(es) avisado(s) por push.`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao notificar fornecedores");
    } finally {
      setNotificando(null);
    }
  };

  const marcarAtendida = async (id: string) => {
    const resp = await fetch(`/api/admin-master/demandas-busca?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "atendida" }),
    });
    const resultado = await resp.json();
    if (!resultado.success) {
      toast.error("Erro ao marcar como atendida");
      return;
    }
    toast.success("Marcado como atendida — a pessoa que buscou foi avisada por push.");
    carregar();
  };

  const pendentes = itens.filter((d) => d.status === "aguardando");
  const atendidas = itens.filter((d) => d.status === "atendida");

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <BellRing className="w-6 h-6 text-blue-600" /> Demandas de busca
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Termos que alguém buscou e ninguém oferece ainda na plataforma. Avise os fornecedores do módulo pra
        fecharem essa lacuna — quando publicarem, quem buscou recebe um aviso automático.
      </p>

      {loading ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : pendentes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">Nenhuma demanda em aberto.</div>
      ) : (
        <div className="space-y-3 mb-10">
          {pendentes.map((d) => {
            const resultado = resultadoNotificacao[d.id];
            return (
              <div key={d.id} className="bg-white border rounded-lg p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">"{d.termo}"</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {d.modulo ? LABEL_MODULO[d.modulo as ModuloId] || d.modulo : "Sem módulo específico"}
                      {d.usuario_nome && ` · ${d.usuario_nome}`}
                      {d.usuario_telefone && ` · ${d.usuario_telefone}`}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(d.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => notificarFornecedores(d.id)}
                      disabled={notificando === d.id}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {notificando === d.id ? "Avisando..." : "Avisar fornecedores"}
                    </button>
                    <button
                      onClick={() => marcarAtendida(d.id)}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Marcar atendida
                    </button>
                  </div>
                </div>

                {resultado && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {resultado.fornecedores.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhum fornecedor cadastrado ainda pra avisar manualmente.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {resultado.fornecedores.map((f, i) => (
                          f.whatsapp ? (
                            <a
                              key={i}
                              href={`https://wa.me/55${f.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${f.nome}! Um cliente do Valente Conecta está procurando "${d.termo}" e ainda não achou ninguém oferecendo. Você tem esse produto/serviço? Cadastre em: ${typeof window !== "undefined" ? window.location.origin : ""}${resultado.linkCadastro}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200"
                            >
                              <MessageCircle className="w-3 h-3" /> {f.nome || "Fornecedor"}
                            </a>
                          ) : (
                            <span key={i} className="text-sm px-2.5 py-1.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                              {f.nome || "Fornecedor"} (sem WhatsApp)
                            </span>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {atendidas.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-500 mb-3">Já atendidas</h2>
          <div className="space-y-2">
            {atendidas.map((d) => (
              <div key={d.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 text-sm">
                <span className="text-gray-600">"{d.termo}"</span>
                <span className="text-sm text-gray-500">
                  Atendida em {d.atendido_em ? new Date(d.atendido_em).toLocaleDateString("pt-BR") : "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
