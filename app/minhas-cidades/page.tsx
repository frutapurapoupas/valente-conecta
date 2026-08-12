"use client";

// Caminho: C:\valente_conecta\app\minhas-cidades\page.tsx
// Usuario registrado ve a cidade base do cadastro e pode pedir acesso a
// outras cidades — o pedido cai direto no chat de suporte pro admin master.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Plus, Clock, Check, X as XIcon } from "lucide-react";
import toast from "react-hot-toast";
import { getCurrentUser } from "@/lib/auth";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";

interface PedidoCidade {
  id: string;
  cidade: string;
  status: "solicitado" | "aguardando_pagamento" | "ativo" | "recusado";
  valor_cobrado: number | null;
  solicitado_em: string;
}

const STATUS_INFO: Record<string, { label: string; cor: string; icone: any }> = {
  solicitado: { label: "Pedido enviado", cor: "text-yellow-600 bg-yellow-50", icone: Clock },
  aguardando_pagamento: { label: "Aguardando pagamento", cor: "text-orange-600 bg-orange-50", icone: Clock },
  ativo: { label: "Ativo", cor: "text-green-600 bg-green-50", icone: Check },
  recusado: { label: "Recusado", cor: "text-red-600 bg-red-50", icone: XIcon },
};

export default function MinhasCidadesPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [pedidos, setPedidos] = useState<PedidoCidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novaCidade, setNovaCidade] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [preco, setPreco] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    setUsuario(user);
    if (!user) {
      setCarregando(false);
      return;
    }
    Promise.all([
      fetch(`/api/usuario-cidades-adicionais?usuarioId=${user.id}`).then((r) => r.json()),
      fetch("/api/config-preco-cidade-adicional").then((r) => r.json()),
    ])
      .then(([resPedidos, resPreco]) => {
        if (resPedidos.success) setPedidos(resPedidos.data);
        if (resPreco.success) setPreco(resPreco.data.preco);
      })
      .finally(() => setCarregando(false));
  }, []);

  const solicitar = async () => {
    if (!novaCidade.trim() || !usuario) return;
    setEnviando(true);
    try {
      const resp = await fetch("/api/usuario-cidades-adicionais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuario.id,
          usuarioLocalId: obterUsuarioLocalId(),
          cidade: novaCidade.trim(),
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Pedido enviado! Acompanhe por aqui ou pelo chat.");
      setPedidos((prev) => [resultado.data, ...prev]);
      setNovaCidade("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao solicitar cidade");
    } finally {
      setEnviando(false);
    }
  };

  if (!carregando && !usuario) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-gray-300 mb-4">Complete seu cadastro pra gerenciar suas cidades.</p>
          <button onClick={() => router.push("/")} className="text-blue-400 underline text-sm">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-10">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/")} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-bold text-lg">🏙️ Minhas cidades</h1>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {carregando ? (
          <p className="text-gray-500 text-sm text-center mt-8">Carregando...</p>
        ) : (
          <>
            <div className="bg-gray-800 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Cidade base do seu cadastro</p>
                <p className="text-white font-semibold">{usuario?.cidade_base || "Não informada"}</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-4 mb-4">
              <p className="text-sm text-gray-300 mb-2">
                Quer acesso a outra cidade também? Peça aqui — o pedido vai direto pro suporte.
                {preco > 0 && (
                  <span className="block text-xs text-yellow-500 mt-1">
                    Assinatura adicional: R$ {preco.toFixed(2)} por cidade.
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <input
                  value={novaCidade}
                  onChange={(e) => setNovaCidade(e.target.value)}
                  placeholder="Nome da cidade"
                  className="flex-1 bg-gray-700 text-white placeholder-gray-500 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={solicitar}
                  disabled={enviando || !novaCidade.trim()}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Pedir
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {pedidos.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">Nenhum pedido de cidade adicional ainda.</p>
              ) : (
                pedidos.map((p) => {
                  const info = STATUS_INFO[p.status];
                  const Icone = info.icone;
                  return (
                    <div key={p.id} className="bg-gray-800 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{p.cidade}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(p.solicitado_em).toLocaleDateString("pt-BR")}
                          {p.valor_cobrado ? ` · R$ ${Number(p.valor_cobrado).toFixed(2)}` : ""}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${info.cor}`}>
                        <Icone className="w-3 h-3" /> {info.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
