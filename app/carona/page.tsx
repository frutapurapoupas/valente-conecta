"use client";

// Caminho: C:\valente_conecta\app\carona\page.tsx
//
// Vitrine da Carona Solidaria — disponibilidade de viagens visivel pra
// TODO MUNDO, sem custo (so' a listagem publicada, ver
// app/api/carona/viagens/route.ts). O contato do motorista so' aparece
// depois que o usuario paga a taxa de desbloqueio (por viagem, nao por
// assinatura).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Car, Lock, MapPin, MessageCircle, Phone, Search, Star, Unlock, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

interface Viagem {
  id: string;
  cidade_origem: string;
  cidade_destino: string;
  data_viagem: string;
  horario_saida: string | null;
  vagas_disponiveis: number;
  preco_sugerido_vaga: number | null;
  observacoes: string | null;
  motorista: { id: string; nome: string; foto_url: string; veiculo_foto_url: string; veiculo: string; placa: string };
}

export default function CaronaSolidariaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscaOrigem, setBuscaOrigem] = useState("");
  const [buscaDestino, setBuscaDestino] = useState("");
  const [desbloqueios, setDesbloqueios] = useState<Record<string, string | null>>({});
  const [desbloqueando, setDesbloqueando] = useState<string | null>(null);

  useEffect(() => {
    setUsuario(getCurrentUser());
  }, []);

  const carregar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (buscaOrigem.trim()) params.set("cidadeOrigem", buscaOrigem.trim());
      if (buscaDestino.trim()) params.set("cidadeDestino", buscaDestino.trim());
      const resp = await fetch(`/api/carona/viagens?${params}`, { cache: "no-store" }).then((r) => r.json());
      const lista: Viagem[] = resp.success ? resp.data : [];
      setViagens(lista);

      if (usuario) {
        const checagens = await Promise.all(
          lista.map((v) =>
            fetch(`/api/carona/desbloqueios?usuarioId=${usuario.id}&viagemId=${v.id}`)
              .then((r) => r.json())
              .then((res) => [v.id, res.success && res.data?.status === "pago" ? res.data.telefone_motorista || "" : null] as const)
          )
        );
        setDesbloqueios(Object.fromEntries(checagens));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  const desbloquear = async (viagem: Viagem) => {
    if (!usuario) {
      toast.error("Complete seu cadastro no app pra desbloquear contatos.");
      return;
    }
    setDesbloqueando(viagem.id);
    try {
      const resp = await fetch("/api/carona/desbloqueios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id, viagemId: viagem.id, nomeUsuario: usuario.nome }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      if (resultado.precisaPagamento && resultado.checkoutUrl) {
        window.location.href = resultado.checkoutUrl;
      } else {
        toast.success("Contato desbloqueado!");
        const check = await fetch(`/api/carona/desbloqueios?usuarioId=${usuario.id}&viagemId=${viagem.id}`).then((r) => r.json());
        setDesbloqueios((prev) => ({ ...prev, [viagem.id]: check.success ? check.data?.telefone_motorista || "" : "" }));
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao desbloquear contato");
    } finally {
      setDesbloqueando(null);
    }
  };

  const formatDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 text-white">
          <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-bold text-lg flex items-center gap-2"><Car className="w-5 h-5" /> Carona Solidária</h1>
          <button onClick={() => router.push("/carona/motorista/nova-viagem")} className="text-xs bg-white/20 px-3 py-1.5 rounded-full">Sou motorista</button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={buscaOrigem} onChange={(e) => setBuscaOrigem(e.target.value)} placeholder="De onde?" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={buscaDestino} onChange={(e) => setBuscaDestino(e.target.value)} placeholder="Pra onde?" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <button onClick={carregar} className="mt-2 w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-sm font-medium">Buscar</button>
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray-400 py-8">Carregando...</p>
        ) : viagens.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">Nenhuma viagem disponível no momento.</p>
        ) : (
          <div className="space-y-3">
            {viagens.map((v) => {
              const telefoneDesbloqueado = desbloqueios[v.id];
              const desbloqueado = telefoneDesbloqueado !== null && telefoneDesbloqueado !== undefined;
              return (
                <div key={v.id} className="bg-white rounded-2xl shadow p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-orange-500" /> {v.cidade_origem} → {v.cidade_destino}
                    </p>
                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">{v.vagas_disponiveis} vaga(s)</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(v.data_viagem)}{v.horario_saida ? ` · ${v.horario_saida.slice(0, 5)}` : ""}
                    {v.preco_sugerido_vaga ? ` · R$ ${Number(v.preco_sugerido_vaga).toFixed(2)}/vaga (a combinar)` : ""}
                  </p>
                  {v.observacoes && <p className="text-xs text-gray-400 mt-1">{v.observacoes}</p>}

                  <div className="mt-3 pt-3 border-t flex items-center gap-3">
                    {v.motorista?.foto_url ? (
                      <img src={v.motorista.foto_url} alt={v.motorista.nome} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"><User className="w-5 h-5 text-gray-400" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{v.motorista?.nome}</p>
                      <p className="text-xs text-gray-400">{v.motorista?.veiculo} · {v.motorista?.placa}</p>
                    </div>
                  </div>

                  {desbloqueado ? (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-xs text-green-700 flex items-center gap-1 mb-2"><Unlock className="w-3.5 h-3.5" /> Contato desbloqueado</p>
                      <div className="flex items-center gap-2 text-sm text-gray-800 mb-2">
                        <Phone className="w-4 h-4 text-gray-500" /> {telefoneDesbloqueado || "—"}
                      </div>
                      {v.motorista?.veiculo_foto_url && (
                        <img src={v.motorista.veiculo_foto_url} alt="Veículo" className="w-full h-28 object-cover rounded-lg mb-2" />
                      )}
                      <a
                        href={`https://wa.me/55${(telefoneDesbloqueado || "").replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" /> Chamar no WhatsApp
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => desbloquear(v)}
                      disabled={desbloqueando === v.id}
                      className="mt-3 w-full bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Lock className="w-4 h-4" /> {desbloqueando === v.id ? "Abrindo pagamento..." : "Desbloquear contato"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
