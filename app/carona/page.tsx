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
import { ArrowLeft, Car, Clock, Lock, MapPin, MessageCircle, Phone, Search, Star, Unlock, User, Send, Navigation, X, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";

interface Viagem {
  id: string;
  cidade_origem: string;
  cidade_destino: string;
  data_viagem: string;
  horario_saida: string | null;
  vagas_disponiveis: number;
  preco_sugerido_vaga: number | null;
  observacoes: string | null;
  status?: string;
  motorista: { id: string; nome: string; foto_url: string; veiculo_foto_url: string; veiculo: string; placa: string };
}

interface Solicitacao {
  id: string;
  cidade_origem: string;
  origem_local: string | null;
  cidade_destino: string;
  data_viagem: string;
  horario_saida: string | null;
  status: "aberta" | "atendida" | "cancelada";
  viagem_id: string | null;
  created_at: string;
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
  const [mostrarSolicitar, setMostrarSolicitar] = useState(false);
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<Solicitacao[]>([]);
  const [viagensAceitas, setViagensAceitas] = useState<Record<string, Viagem>>({});

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    // Pré-preenche a busca com a cidade base do usuário (informada no
    // cadastro do app) — quem mora em Valente provavelmente quer ver
    // caronas saindo de lá primeiro, mas o campo continua editável.
    if (u?.cidade_base) setBuscaOrigem(u.cidade_base);
  }, []);

  const carregarMinhasSolicitacoes = async () => {
    const usuarioId = usuario?.id || obterUsuarioLocalId();
    if (!usuarioId) return;
    try {
      const resp = await fetch(`/api/carona/solicitacoes?status=aberta,atendida&usuarioId=${usuarioId}`, { cache: "no-store" }).then((r) => r.json());
      const lista: Solicitacao[] = resp.success ? resp.data : [];
      setMinhasSolicitacoes(lista);

      const aceitas = lista.filter((s) => s.status === "atendida" && s.viagem_id);
      if (aceitas.length) {
        const pares = await Promise.all(
          aceitas.map(async (s) => {
            const r = await fetch(`/api/carona/viagens?id=${s.viagem_id}`).then((res) => res.json());
            return [s.viagem_id as string, r.success ? r.data : null] as const;
          })
        );
        setViagensAceitas(Object.fromEntries(pares.filter(([, v]) => v)) as Record<string, Viagem>);

        if (usuario) {
          const checagens = await Promise.all(
            aceitas.map((s) =>
              fetch(`/api/carona/desbloqueios?usuarioId=${usuario.id}&viagemId=${s.viagem_id}`)
                .then((r) => r.json())
                .then((res) => [s.viagem_id as string, res.success && res.data?.status === "pago" ? res.data.telefone_motorista || "" : undefined] as const)
            )
          );
          setDesbloqueios((prev) => ({ ...prev, ...Object.fromEntries(checagens.filter(([, v]) => v !== undefined)) }));
        }
      }
    } catch {
      // silencioso — a lista de viagens continua funcionando normalmente
    }
  };

  useEffect(() => {
    carregarMinhasSolicitacoes();
    // Acompanha o proprio pedido ate' um motorista aceitar — sem push,
    // so' um polling leve enquanto a tela fica aberta.
    const intervalo = setInterval(carregarMinhasSolicitacoes, 20000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  const cancelarSolicitacao = async (id: string) => {
    try {
      const resp = await fetch(`/api/carona/solicitacoes?id=${id}`, { method: "DELETE" }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      toast.success("Pedido cancelado");
      carregarMinhasSolicitacoes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao cancelar pedido");
    }
  };

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

        <button
          onClick={() => setMostrarSolicitar(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 py-3 rounded-2xl text-sm font-semibold"
        >
          <Send className="w-4 h-4" /> Não achou o destino que precisa? Solicitar carona
        </button>

        {minhasSolicitacoes.length > 0 && (
          <div className="space-y-2">
            {minhasSolicitacoes.map((s) => {
              const viagem = s.viagem_id ? viagensAceitas[s.viagem_id] : null;
              return (
                <div key={s.id} className={`rounded-2xl p-4 border ${s.status === "atendida" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                      <MapPin className="w-4 h-4 text-orange-500" /> {s.cidade_origem} → {s.cidade_destino}
                    </p>
                    {s.status === "aberta" && (
                      <button onClick={() => cancelarSolicitacao(s.id)} className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Cancelar
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(s.data_viagem)}{s.horario_saida ? ` · ${s.horario_saida.slice(0, 5)}` : ""}
                  </p>

                  {s.status === "aberta" ? (
                    <p className="mt-2 text-xs text-amber-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Seu pedido está com os motoristas — assim que alguém aceitar, avisamos aqui.
                    </p>
                  ) : (
                    <div className="mt-2 text-xs text-green-700">
                      <p className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {viagem?.motorista?.nome ? `${viagem.motorista.nome} aceitou sua carona!` : "Um motorista aceitou sua carona!"}
                      </p>

                      {!viagem && <p className="mt-1 text-green-600">Só falta o motorista confirmar a viagem — os detalhes aparecem aqui em instantes.</p>}

                      {viagem && (
                        <div className="mt-2 bg-white/70 rounded-xl p-2.5 flex items-center gap-2.5">
                          {viagem.motorista?.foto_url ? (
                            <img src={viagem.motorista.foto_url} alt={viagem.motorista.nome} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><User className="w-4 h-4 text-gray-400" /></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{viagem.motorista?.nome}</p>
                            <p className="text-[11px] text-gray-400">{viagem.motorista?.veiculo} · {viagem.motorista?.placa}</p>
                          </div>
                        </div>
                      )}

                      {viagem && viagem.status && viagem.status !== "publicada" && (
                        <p className="mt-2 text-green-600">Assim que o motorista confirmar o pagamento da vaga, você pode desbloquear o contato aqui.</p>
                      )}

                      {viagem && (!viagem.status || viagem.status === "publicada") && (
                        desbloqueios[viagem.id] !== undefined && desbloqueios[viagem.id] !== null ? (
                          <a
                            href={`https://wa.me/55${(desbloqueios[viagem.id] || "").replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Chamar no WhatsApp
                          </a>
                        ) : (
                          <button
                            onClick={() => desbloquear(viagem)}
                            disabled={desbloqueando === viagem.id}
                            className="mt-2 w-full bg-orange-600 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            <Lock className="w-3.5 h-3.5" /> {desbloqueando === viagem.id ? "Abrindo pagamento..." : "Desbloquear contato"}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

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

      {mostrarSolicitar && (
        <ModalSolicitar usuario={usuario} onFechar={() => { setMostrarSolicitar(false); carregarMinhasSolicitacoes(); }} />
      )}
    </div>
  );
}

function ModalSolicitar({ usuario, onFechar }: { usuario: any; onFechar: () => void }) {
  const [form, setForm] = useState({
    nome: usuario?.nome || "",
    telefone: usuario?.whatsapp || "",
    cidadeOrigem: usuario?.cidade_base || "",
    origemLocal: "",
    cidadeDestino: "",
    dataViagem: "",
    horarioSaida: "",
    observacoes: "",
  });
  const [origemCoords, setOrigemCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [localizando, setLocalizando] = useState(false);
  const [destinosConhecidos, setDestinosConhecidos] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch("/api/carona/solicitacoes?recurso=destinos")
      .then((r) => r.json())
      .then((res) => { if (res.success) setDestinosConhecidos(res.data); })
      .catch(() => {});
  }, []);

  const usarLocalizacaoAtual = () => {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não suporta localização");
      return;
    }
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setOrigemCoords({ lat: latitude, lng: longitude });
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
            headers: { "User-Agent": "ValenteConecta/1.0" },
          });
          const data = await resp.json();
          if (data?.display_name) set("origemLocal", data.display_name);
        } catch {
          // silencioso — usuario ainda pode digitar o local na mao
        } finally {
          setLocalizando(false);
        }
      },
      () => {
        toast.error("Não foi possível pegar sua localização. Digite o local manualmente.");
        setLocalizando(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  };

  const enviar = async () => {
    if (!form.nome.trim() || !form.telefone.trim() || !form.cidadeOrigem.trim() || !form.cidadeDestino.trim() || !form.dataViagem) {
      toast.error("Preencha nome, telefone, origem, destino e data");
      return;
    }
    setEnviando(true);
    try {
      const resp = await fetch("/api/carona/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuario?.id || obterUsuarioLocalId(),
          nomePassageiro: form.nome,
          telefonePassageiro: form.telefone,
          cidadeOrigem: form.cidadeOrigem,
          origemLocal: form.origemLocal || null,
          origemLat: origemCoords?.lat ?? null,
          origemLng: origemCoords?.lng ?? null,
          cidadeDestino: form.cidadeDestino,
          dataViagem: form.dataViagem,
          horarioSaida: form.horarioSaida || null,
          observacoes: form.observacoes || null,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setEnviado(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar solicitação");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
          <Send className="w-10 h-10 text-orange-500 mx-auto mb-3" />
          <h2 className="font-bold text-lg mb-1">Pedido enviado!</h2>
          <p className="text-sm text-gray-500 mb-5">Assim que algum motorista aceitar fazer essa viagem, ela aparece aqui na vitrine.</p>
          <button onClick={onFechar} className="w-full bg-orange-600 text-white py-2.5 rounded-xl font-bold">Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85dvh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="font-bold text-lg">Solicitar carona</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          <p className="text-sm text-gray-500">Conta pra gente pra onde você precisa ir — os motoristas cadastrados vão ver esse pedido e quem topar a viagem aparece aqui.</p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Seu nome *</label>
              <input value={form.nome} onChange={(e) => set("nome", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">WhatsApp *</label>
              <input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Cidade de origem *</label>
            <input value={form.cidadeOrigem} onChange={(e) => set("cidadeOrigem", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-xs text-gray-500 flex items-center justify-between">
              Ponto de partida (bairro/referência dentro da cidade)
              <button type="button" onClick={usarLocalizacaoAtual} disabled={localizando} className="text-orange-600 font-medium flex items-center gap-1 disabled:opacity-60">
                <Navigation className="w-3 h-3" /> {localizando ? "Localizando..." : "Usar minha localização"}
              </button>
            </label>
            <input value={form.origemLocal} onChange={(e) => set("origemLocal", e.target.value)} placeholder="Ex: Praça Central, Bairro São José..." className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-xs text-gray-500">Cidade de destino *</label>
            <input
              list="destinos-conhecidos"
              value={form.cidadeDestino}
              onChange={(e) => set("cidadeDestino", e.target.value)}
              placeholder="Digite ou escolha um já usado antes"
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
            />
            <datalist id="destinos-conhecidos">
              {destinosConhecidos.map((d) => <option key={d} value={d} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Data *</label>
              <input type="date" value={form.dataViagem} onChange={(e) => set("dataViagem", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Horário</label>
              <input type="time" value={form.horarioSaida} onChange={(e) => set("horarioSaida", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Observações</label>
            <textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} rows={2} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
        </div>

        <div className="px-5 py-4 border-t shrink-0">
          <button onClick={enviar} disabled={enviando} className="w-full bg-orange-600 text-white py-2.5 rounded-xl font-bold disabled:opacity-60">
            {enviando ? "Enviando..." : "Enviar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}
