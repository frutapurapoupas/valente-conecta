"use client";

// Caminho: C:\valente_conecta\app\carona\motorista\nova-viagem\page.tsx
//
// Motorista anuncia uma viagem — fica "aguardando_pagamento" ate a taxa de
// exibicao ser confirmada (checkout Mercado Pago), so' entao aparece na
// vitrine pra todo mundo (ver app/api/carona/viagens/route.ts).
//
// Fluxo unico, sem navegar pra outra pagina: se o usuario ainda nao e'
// motorista cadastrado, o formulario de cadastro (fotos + CNH) aparece
// embutido aqui mesmo como primeiro passo — ao concluir, cai direto no
// formulario da viagem, sem sair da tela. Quem ja' e' motorista pula
// direto pro segundo passo.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, Car, MapPin, Bell, Send } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MidiaUploader } from "@/components/catalogo/MidiaUploader";
import type { MidiaItem } from "@/lib/catalogo/marketplaceTypes";

interface Solicitacao {
  id: string; nome_passageiro: string; telefone_passageiro: string;
  cidade_origem: string; origem_local: string | null; cidade_destino: string;
  data_viagem: string; horario_saida: string | null; observacoes: string | null;
}

// Sinal sonoro padrao (beep curto via Web Audio API) — sem depender de
// arquivo de audio nenhum, toca so' quando surge pedido novo na lista.
function tocarBeep() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // navegador sem suporte a Web Audio — silencioso, a lista continua funcionando
  }
}

export default function NovaViagemCaronaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [motorista, setMotorista] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [taxa, setTaxa] = useState(0);
  const [solicitacaoAceita, setSolicitacaoAceita] = useState<Solicitacao | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    if (!u) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(`/api/carona/motoristas?usuarioId=${u.id}`).then((r) => r.json()),
      fetch("/api/admin-master/carona/config").then((r) => r.json()),
    ])
      .then(([motoristaRes, configRes]) => {
        setMotorista(motoristaRes.success ? motoristaRes.data : null);
        setTaxa(configRes.success ? Number(configRes.data.taxaMotorista || 0) : 0);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" /></div>;
  }

  if (!usuario) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-center text-gray-500">Complete seu cadastro no app primeiro.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center gap-2 text-white">
          <Car size={18} />
          <h1 className="font-bold text-lg">{motorista ? "Anunciar viagem" : "Seja motorista da Carona Solidária"}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {!motorista ? (
          <FormularioCadastroMotorista usuario={usuario} onCadastrado={setMotorista} />
        ) : (
          <>
            <PedidosAbertos onAceitar={setSolicitacaoAceita} />
            <FormularioViagem
              motorista={motorista}
              taxa={taxa}
              router={router}
              cidadeBase={usuario?.cidade_base || ""}
              solicitacao={solicitacaoAceita}
            />
          </>
        )}
      </main>
    </div>
  );
}

function FormularioCadastroMotorista({ usuario, onCadastrado }: { usuario: any; onCadastrado: (m: any) => void }) {
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ veiculo: "", placa: "", cnhNumero: "", cnhValida: false });
  const [fotoRosto, setFotoRosto] = useState<MidiaItem[]>([]);
  const [fotoVeiculo, setFotoVeiculo] = useState<MidiaItem[]>([]);
  const [fotoCnh, setFotoCnh] = useState<MidiaItem[]>([]);

  const cadastrar = async () => {
    if (!fotoRosto[0] || !fotoVeiculo[0] || !fotoCnh[0]) {
      toast.error("Envie as 3 fotos: seu rosto, o veículo e a CNH.");
      return;
    }
    if (!form.veiculo.trim() || !form.placa.trim() || !form.cnhNumero.trim()) {
      toast.error("Preencha veículo, placa e número da CNH.");
      return;
    }
    if (!form.cnhValida) {
      toast.error("Confirme que sua CNH está válida.");
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch("/api/carona/motoristas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuario.id,
          nome: usuario.nome,
          telefone: usuario.whatsapp,
          fotoUrl: fotoRosto[0].url,
          veiculoFotoUrl: fotoVeiculo[0].url,
          cnhFotoUrl: fotoCnh[0].url,
          veiculo: form.veiculo,
          placa: form.placa,
          cnhNumero: form.cnhNumero,
          cnhValida: form.cnhValida,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      toast.success("Cadastro concluído! Agora é só anunciar sua viagem.");
      onCadastrado(resultado.data);
    } catch (error: any) {
      toast.error(error.message || "Erro no cadastro");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-4">
      <p className="text-sm text-gray-500">Primeiro passo: seu cadastro de motorista. Só precisa fazer isso uma vez.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input value={form.veiculo} onChange={(e) => setForm((p) => ({ ...p, veiculo: e.target.value }))} placeholder="Veículo (ex: Fiat Uno prata)" className="border rounded-lg px-3 py-2" />
        <input value={form.placa} onChange={(e) => setForm((p) => ({ ...p, placa: e.target.value }))} placeholder="Placa" className="border rounded-lg px-3 py-2" />
        <input value={form.cnhNumero} onChange={(e) => setForm((p) => ({ ...p, cnhNumero: e.target.value }))} placeholder="Número da CNH" className="border rounded-lg px-3 py-2 md:col-span-2" />
      </div>

      <div>
        <p className="text-sm font-medium mb-1.5">Sua foto (rosto) *</p>
        <MidiaUploader midia={fotoRosto} onChange={setFotoRosto} maximo={1} />
      </div>
      <div>
        <p className="text-sm font-medium mb-1.5">Foto do veículo *</p>
        <MidiaUploader midia={fotoVeiculo} onChange={setFotoVeiculo} maximo={1} />
      </div>
      <div>
        <p className="text-sm font-medium mb-1.5">Foto da CNH *</p>
        <MidiaUploader midia={fotoCnh} onChange={setFotoCnh} maximo={1} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.cnhValida} onChange={(e) => setForm((p) => ({ ...p, cnhValida: e.target.checked }))} /> CNH válida confirmada
      </label>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-800 text-xs flex items-start gap-2">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        Suas fotos ficam visíveis pros caronistas quando eles decidirem desbloquear o contato de uma viagem sua.
      </div>

      <button onClick={cadastrar} disabled={enviando} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold disabled:opacity-60">
        {enviando ? "Enviando..." : "Concluir cadastro e continuar"}
      </button>
    </div>
  );
}

function PedidosAbertos({ onAceitar }: { onAceitar: (s: Solicitacao) => void }) {
  const [lista, setLista] = useState<Solicitacao[]>([]);
  const idsVistosRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    const carregar = () => {
      fetch("/api/carona/solicitacoes?status=aberta")
        .then((r) => r.json())
        .then((res) => {
          if (!res.success) return;
          const novos: Solicitacao[] = res.data;
          if (idsVistosRef.current && novos.some((s) => !idsVistosRef.current!.has(s.id))) {
            tocarBeep();
          }
          idsVistosRef.current = new Set(novos.map((s) => s.id));
          setLista(novos);
        })
        .catch(() => {});
    };
    carregar();
    const intervalo = setInterval(carregar, 15000);
    return () => clearInterval(intervalo);
  }, []);

  if (lista.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="font-bold text-gray-800 flex items-center gap-1.5 mb-3">
        <Bell className="w-4 h-4 text-orange-500" /> Pedidos de passageiros ({lista.length})
      </p>
      <div className="space-y-2">
        {lista.map((s) => (
          <div key={s.id} className="border rounded-xl p-3">
            <p className="text-sm font-medium text-gray-800">{s.cidade_origem} → {s.cidade_destino}</p>
            <p className="text-xs text-gray-500">
              {new Date(s.data_viagem + "T00:00:00").toLocaleDateString("pt-BR")}
              {s.horario_saida ? ` · ${s.horario_saida.slice(0, 5)}` : ""} · {s.nome_passageiro}
            </p>
            {s.origem_local && <p className="text-xs text-gray-400">Partida: {s.origem_local}</p>}
            {s.observacoes && <p className="text-xs text-gray-400 mt-0.5">{s.observacoes}</p>}
            <button
              onClick={() => onAceitar(s)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg py-1.5 text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" /> Aceitar e anunciar essa viagem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormularioViagem({ motorista, taxa, router, cidadeBase, solicitacao }: {
  motorista: any; taxa: number; router: ReturnType<typeof useRouter>; cidadeBase: string; solicitacao: Solicitacao | null;
}) {
  const [enviando, setEnviando] = useState(false);
  // Pré-preenche com a cidade base do motorista (cadastrada no app) — a
  // maioria das viagens começa de onde a pessoa mora, mas continua editável.
  // Se veio de um pedido aceito, prevalece o que o passageiro pediu.
  const [cidadeOrigem, setCidadeOrigem] = useState(solicitacao?.cidade_origem || cidadeBase);
  const [cidadeDestino, setCidadeDestino] = useState(solicitacao?.cidade_destino || "");
  const [dataViagem, setDataViagem] = useState(solicitacao?.data_viagem || "");
  const [horarioSaida, setHorarioSaida] = useState(solicitacao?.horario_saida?.slice(0, 5) || "");
  const [vagas, setVagas] = useState(1);
  const [precoSugerido, setPrecoSugerido] = useState<number | "">("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (!solicitacao) return;
    setCidadeOrigem(solicitacao.cidade_origem);
    setCidadeDestino(solicitacao.cidade_destino);
    setDataViagem(solicitacao.data_viagem);
    setHorarioSaida(solicitacao.horario_saida?.slice(0, 5) || "");
  }, [solicitacao]);

  const anunciar = async () => {
    if (!cidadeOrigem.trim() || !cidadeDestino.trim() || !dataViagem || vagas <= 0) {
      toast.error("Preencha origem, destino, data e vagas disponíveis.");
      return;
    }
    if (!precoSugerido || Number(precoSugerido) <= 0) {
      toast.error("Informe o valor da passagem por vaga.");
      return;
    }
    setEnviando(true);
    try {
      const resp = await fetch("/api/carona/viagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motoristaId: motorista.id,
          nomeMotorista: motorista.nome,
          cidadeOrigem: cidadeOrigem.trim(),
          cidadeDestino: cidadeDestino.trim(),
          dataViagem,
          horarioSaida: horarioSaida || null,
          vagasDisponiveis: vagas,
          precoSugeridoVaga: precoSugerido,
          observacoes: observacoes.trim() || null,
          solicitacaoId: solicitacao?.id || null,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      if (resultado.precisaPagamento && resultado.checkoutUrl) {
        toast.success("Viagem registrada! Falta só pagar a taxa de exibição.");
        window.location.href = resultado.checkoutUrl;
      } else {
        toast.success("Viagem publicada!");
        router.push("/carona");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao anunciar viagem");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-3">
      <div className="flex items-center gap-3 pb-3 border-b">
        {motorista.foto_url && <img src={motorista.foto_url} alt={motorista.nome} className="w-10 h-10 rounded-full object-cover" />}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{motorista.nome}</p>
          <p className="text-xs text-gray-400">{motorista.veiculo} · {motorista.placa}</p>
        </div>
      </div>

      {solicitacao && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-xs text-orange-800">
          Aceitando o pedido de <strong>{solicitacao.nome_passageiro}</strong> — confirme os dados abaixo e anuncie.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="relative">
          <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={cidadeOrigem} onChange={(e) => setCidadeOrigem(e.target.value)} placeholder="Cidade de origem" className="w-full pl-9 pr-3 py-2 border rounded-lg" />
        </div>
        <div className="relative">
          <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={cidadeDestino} onChange={(e) => setCidadeDestino(e.target.value)} placeholder="Cidade de destino" className="w-full pl-9 pr-3 py-2 border rounded-lg" />
        </div>
        <input type="date" value={dataViagem} onChange={(e) => setDataViagem(e.target.value)} className="border rounded-lg px-3 py-2" />
        <input type="time" value={horarioSaida} onChange={(e) => setHorarioSaida(e.target.value)} className="border rounded-lg px-3 py-2" />
        <input type="number" min={1} value={vagas} onChange={(e) => setVagas(parseInt(e.target.value, 10) || 1)} placeholder="Vagas disponíveis" className="border rounded-lg px-3 py-2" />
        <input type="number" step="0.01" min="0.01" required value={precoSugerido} onChange={(e) => setPrecoSugerido(e.target.value === "" ? "" : parseFloat(e.target.value))} placeholder="Valor da passagem por vaga (R$) *" className="border rounded-lg px-3 py-2" />
      </div>
      <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações (opcional)" rows={2} className="w-full border rounded-lg px-3 py-2" />

      <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-orange-800 text-xs">
        {taxa > 0
          ? `Pra sua viagem aparecer na vitrine, tem uma taxa de R$ ${taxa.toFixed(2)} — depois de anunciar você vai pra tela de pagamento. O valor da passagem é combinado direto com o passageiro, não passa pela plataforma.`
          : "Sem taxa de exibição no momento. O valor da passagem é combinado direto com o passageiro."}
      </div>

      <button onClick={anunciar} disabled={enviando} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold disabled:opacity-60">
        {enviando ? "Enviando..." : taxa > 0 ? "Anunciar e pagar taxa" : "Anunciar viagem"}
      </button>
    </div>
  );
}
