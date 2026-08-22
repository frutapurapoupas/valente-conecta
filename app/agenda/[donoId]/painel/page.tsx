"use client";

// Caminho: C:\valente_conecta\app\agenda\[donoId]\painel\page.tsx
//
// Painel do empresario/funcionario (camada 2). Duas partes:
//  - "Gerenciar equipe": so' o dono da loja ve' (mesmo id local usado no
//    resto do catalogo) — cadastra funcionarios com PIN proprio.
//  - Fila do dia: qualquer funcionario entra escolhendo o proprio nome numa
//    lista e digitando o PIN (autenticacao simples pra tablet/computador
//    compartilhado na recepcao, nao e' um login de sessao completa).

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Users, Lock, Plus, PhoneCall, CheckCircle2, XCircle, Loader2, Settings, UserPlus, MessageSquare, Send, Camera, X } from "lucide-react";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";
import { MidiaUploader } from "@/components/catalogo/MidiaUploader";
import type { MidiaItem } from "@/lib/catalogo/marketplaceTypes";

interface Profissional { id: string; nome: string; especialidade: string | null; foto_url?: string | null }
interface Agendamento {
  id: string; senha_fila: string; cliente_nome: string; cliente_telefone: string;
  servico: string | null; status: string; created_at: string;
}

export default function AgendaPainelPage() {
  const params = useParams();
  const donoId = params?.donoId as string;
  const [souDono, setSouDono] = useState(false);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [funcionarioLogado, setFuncionarioLogado] = useState<Profissional | null>(null);
  const [modoEquipe, setModoEquipe] = useState(false);
  const [modoPacientes, setModoPacientes] = useState(false);

  useEffect(() => {
    setSouDono(obterUsuarioLocalId() === donoId);
    carregarProfissionais();
  }, [donoId]);

  const carregarProfissionais = () => {
    fetch(`/api/agenda/profissionais?donoId=${donoId}`)
      .then((r) => r.json())
      .then((res) => setProfissionais(res.success ? res.data : []))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  if (modoEquipe && souDono) {
    return <GerenciarEquipe donoId={donoId} profissionais={profissionais} onAtualizar={carregarProfissionais} onVoltar={() => setModoEquipe(false)} />;
  }

  if (modoPacientes) {
    return <GerenciarPacientes donoId={donoId} onVoltar={() => setModoPacientes(false)} />;
  }

  if (funcionarioLogado) {
    return <FilaDoDia profissional={funcionarioLogado} donoId={donoId} onSair={() => setFuncionarioLogado(null)} onAbrirPacientes={() => setModoPacientes(true)} />;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Lock className="w-6 h-6 text-blue-600" /> Painel da equipe
      </h1>
      <p className="text-sm text-gray-500 mb-6">Escolha seu nome e digite seu PIN para abrir a fila de atendimento.</p>

      {souDono && (
        <div className="flex gap-2 mb-4">
          <button onClick={() => setModoEquipe(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
            <Settings className="w-4 h-4" /> Equipe
          </button>
          <button onClick={() => setModoPacientes(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
            <UserPlus className="w-4 h-4" /> Pacientes
          </button>
        </div>
      )}

      {profissionais.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500 text-sm">
          {souDono ? 'Nenhum funcionário cadastrado ainda — clique em "Gerenciar equipe".' : "Nenhum funcionário cadastrado ainda."}
        </div>
      ) : (
        <div className="space-y-2">
          {profissionais.map((p) => (
            <SeletorFuncionario key={p.id} profissional={p} onEntrar={setFuncionarioLogado} />
          ))}
        </div>
      )}
    </div>
  );
}

function SeletorFuncionario({ profissional, onEntrar }: { profissional: Profissional; onEntrar: (p: Profissional) => void }) {
  const [mostrarPin, setMostrarPin] = useState(false);
  const [pin, setPin] = useState("");
  const [entrando, setEntrando] = useState(false);

  const tentarEntrar = async () => {
    setEntrando(true);
    try {
      const resp = await fetch("/api/agenda/funcionario/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profissionalId: profissional.id, pin }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      onEntrar(resultado.data);
    } catch (err: any) {
      toast.error(err.message || "PIN incorreto");
    } finally {
      setEntrando(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-3">
      <button onClick={() => setMostrarPin((v) => !v)} className="w-full text-left flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {profissional.foto_url ? (
            <img src={profissional.foto_url} alt={profissional.nome} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Camera className="w-3.5 h-3.5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium">{profissional.nome}</p>
            {profissional.especialidade && <p className="text-xs text-gray-500">{profissional.especialidade}</p>}
          </div>
        </div>
        <Lock className="w-4 h-4 text-gray-400" />
      </button>
      {mostrarPin && (
        <div className="flex gap-2 mt-3">
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="flex-1 px-3 py-2 border rounded-lg text-center tracking-widest"
            maxLength={6}
          />
          <button onClick={tentarEntrar} disabled={entrando || pin.length < 4} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
            {entrando ? "..." : "Entrar"}
          </button>
        </div>
      )}
    </div>
  );
}

function FilaDoDia({ profissional, donoId, onSair, onAbrirPacientes }: { profissional: Profissional; donoId: string; onSair: () => void; onAbrirPacientes: () => void }) {
  const [fila, setFila] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [avisoAbertoId, setAvisoAbertoId] = useState<string | null>(null);
  const [fotoAtual, setFotoAtual] = useState(profissional.foto_url || "");
  const [mostrarFotoModal, setMostrarFotoModal] = useState(false);

  const carregar = () => {
    fetch(`/api/agenda/agendamentos?profissionalId=${profissional.id}`)
      .then((r) => r.json())
      .then((res) => setFila(res.success ? res.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 5000);
    return () => clearInterval(intervalo);
  }, [profissional.id]);

  const atualizarStatus = async (id: string, status: string) => {
    await fetch(`/api/agenda/agendamentos?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    carregar();
  };

  const enviarAviso = async (f: Agendamento, mensagem: string) => {
    if (!mensagem.trim()) return;
    await fetch(`/api/agenda/agendamentos?id=${f.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem }),
    });
    const numero = f.cliente_telefone.replace(/\D/g, "");
    if (numero) {
      window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`, "_blank");
    }
    toast.success("Aviso enviado (notificação + WhatsApp)");
    setAvisoAbertoId(null);
  };

  const aguardando = fila.filter((f) => f.status === "aguardando");
  const emAtendimento = fila.filter((f) => f.status === "chamado" || f.status === "em_atendimento");

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setMostrarFotoModal(true)} className="relative shrink-0">
            {fotoAtual ? (
              <img src={fotoAtual} alt={profissional.nome} className="w-11 h-11 rounded-full object-cover border" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center border">
                <Camera className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5"><Camera className="w-2.5 h-2.5" /></span>
          </button>
          <div>
            <h1 className="text-xl font-bold">{profissional.nome}</h1>
            <p className="text-sm text-gray-500">Fila de hoje</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onAbrirPacientes} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <UserPlus className="w-4 h-4" /> Pacientes
          </button>
          <button onClick={onSair} className="text-sm text-gray-500 hover:text-gray-700">Sair</button>
        </div>
      </div>

      {mostrarFotoModal && (
        <ModalMinhaFoto
          profissionalId={profissional.id}
          fotoAtual={fotoAtual}
          onSalvo={(url) => { setFotoAtual(url); setMostrarFotoModal(false); }}
          onFechar={() => setMostrarFotoModal(false)}
        />
      )}

      {emAtendimento.length > 0 && (
        <div className="mb-4 space-y-2">
          {emAtendimento.map((f) => (
            <div key={f.id} className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-700">{f.senha_fila} · {f.cliente_nome}</p>
                  <p className="text-xs text-emerald-600">{f.status === "chamado" ? "Chamado — aguardando chegar" : "Em atendimento"}</p>
                </div>
                <div className="flex gap-2">
                  {f.status === "chamado" && (
                    <button onClick={() => atualizarStatus(f.id, "em_atendimento")} className="text-xs px-2.5 py-1.5 bg-blue-600 text-white rounded-lg font-medium">Iniciar</button>
                  )}
                  <button onClick={() => atualizarStatus(f.id, "atendido")} className="text-xs px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                  </button>
                  <button onClick={() => setAvisoAbertoId(avisoAbertoId === f.id ? null : f.id)} className="text-xs p-1.5 bg-white border border-emerald-300 text-emerald-700 rounded-lg" title="Enviar aviso">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {avisoAbertoId === f.id && <ComposerAviso onEnviar={(msg) => enviarAviso(f, msg)} />}
            </div>
          ))}
        </div>
      )}

      <p className="text-sm font-medium text-gray-700 mb-2">Aguardando ({aguardando.length})</p>
      {aguardando.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500 text-sm">Fila vazia.</div>
      ) : (
        <div className="space-y-2">
          {aguardando.map((f, i) => (
            <div key={f.id} className="bg-white border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{f.senha_fila} · {f.cliente_nome}</p>
                  <p className="text-xs text-gray-500">{f.cliente_telefone}{f.servico ? ` · ${f.servico}` : ""}</p>
                </div>
                <div className="flex gap-2">
                  {i === 0 && (
                    <button onClick={() => atualizarStatus(f.id, "chamado")} className="text-xs px-2.5 py-1.5 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5" /> Chamar
                    </button>
                  )}
                  <button onClick={() => setAvisoAbertoId(avisoAbertoId === f.id ? null : f.id)} className="text-xs p-1.5 bg-gray-100 text-gray-600 rounded-lg" title="Enviar aviso">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => atualizarStatus(f.id, "cancelado")} className="text-xs px-2.5 py-1.5 bg-red-100 text-red-700 rounded-lg font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {avisoAbertoId === f.id && <ComposerAviso onEnviar={(msg) => enviarAviso(f, msg)} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ModalMinhaFoto({ profissionalId, fotoAtual, onSalvo, onFechar }: {
  profissionalId: string; fotoAtual: string; onSalvo: (url: string) => void; onFechar: () => void;
}) {
  const [midia, setMidia] = useState<MidiaItem[]>(fotoAtual ? [{ tipo: "imagem", url: fotoAtual, ordem: 0 }] : []);
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    if (!midia[0]?.url) {
      toast.error("Envie uma foto");
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch(`/api/agenda/profissionais?id=${profissionalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fotoUrl: midia[0].url }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Foto atualizada! Já aparece pros clientes na hora de escolher.");
      onSalvo(midia[0].url);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar foto");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Minha foto</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-3">Essa foto aparece pro cliente na hora de escolher quem vai atender.</p>
        <MidiaUploader midia={midia} onChange={setMidia} maximo={1} />
        <button onClick={salvar} disabled={salvando} className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-xl font-bold disabled:opacity-60">
          {salvando ? "Salvando..." : "Salvar foto"}
        </button>
      </div>
    </div>
  );
}

function ComposerAviso({ onEnviar }: { onEnviar: (mensagem: string) => void }) {
  const [texto, setTexto] = useState("");
  return (
    <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Ex: traga um documento com foto..."
        className="flex-1 px-3 py-2 border rounded-lg text-sm"
      />
      <button onClick={() => onEnviar(texto)} disabled={!texto.trim()} className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-1 text-sm font-medium">
        <Send className="w-3.5 h-3.5" /> Enviar
      </button>
    </div>
  );
}

function GerenciarPacientes({ donoId, onVoltar }: { donoId: string; onVoltar: () => void }) {
  const [pacientes, setPacientes] = useState<{ id: string; nome: string; telefone: string; observacao: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nome: "", telefone: "", observacao: "" });
  const [salvando, setSalvando] = useState(false);

  const carregar = () => {
    fetch(`/api/agenda/pacientes?donoId=${donoId}`)
      .then((r) => r.json())
      .then((res) => setPacientes(res.success ? res.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, [donoId]);

  const adicionar = async () => {
    if (!form.nome.trim() || !form.telefone.trim()) {
      toast.error("Preencha nome e telefone do paciente");
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch("/api/agenda/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donoId, ...form }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Paciente cadastrado!");
      setForm({ nome: "", telefone: "", observacao: "" });
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <button onClick={onVoltar} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Voltar</button>
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><UserPlus className="w-6 h-6 text-blue-600" /> Pacientes</h1>
      <p className="text-sm text-gray-500 mb-6">
        Cadastro presencial: registre aqui quem passou na recepção. Quando o estabelecimento exige cadastro prévio (ver admin master), só quem estiver nesta lista consegue entrar na fila pelo celular.
      </p>

      <div className="bg-white rounded-lg shadow p-5 space-y-3 mb-6">
        <p className="text-sm font-medium text-gray-700">Novo paciente</p>
        <input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" className="w-full px-3 py-2 border rounded-lg" />
        <input value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} placeholder="WhatsApp / Telefone" className="w-full px-3 py-2 border rounded-lg" />
        <input value={form.observacao} onChange={(e) => setForm((p) => ({ ...p, observacao: e.target.value }))} placeholder="Observação (opcional)" className="w-full px-3 py-2 border rounded-lg" />
        <button onClick={adicionar} disabled={salvando} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Cadastrar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        {loading ? (
          <p className="text-sm text-gray-400">Carregando...</p>
        ) : pacientes.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum paciente cadastrado ainda.</p>
        ) : (
          pacientes.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
              <div>
                <span className="text-sm font-medium">{p.nome}</span>
                {p.observacao && <p className="text-xs text-gray-400">{p.observacao}</p>}
              </div>
              <span className="text-xs text-gray-400">{p.telefone}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function GerenciarEquipe({ donoId, profissionais, onAtualizar, onVoltar }: { donoId: string; profissionais: Profissional[]; onAtualizar: () => void; onVoltar: () => void }) {
  const [form, setForm] = useState({ nome: "", especialidade: "", pin: "" });
  const [salvando, setSalvando] = useState(false);

  const adicionar = async () => {
    if (!form.nome.trim() || !/^\d{4,6}$/.test(form.pin)) {
      toast.error("Preencha o nome e um PIN de 4 a 6 números");
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch("/api/agenda/profissionais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donoId, nome: form.nome, especialidade: form.especialidade, pin: form.pin }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Funcionário cadastrado!");
      setForm({ nome: "", especialidade: "", pin: "" });
      onAtualizar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <button onClick={onVoltar} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Voltar</button>
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Users className="w-6 h-6 text-blue-600" /> Equipe</h1>
      <p className="text-sm text-gray-500 mb-6">Cada funcionário usa o próprio PIN para abrir a fila no painel — ninguém mexe na fila de outro.</p>

      <div className="bg-white rounded-lg shadow p-4 space-y-2 mb-6">
        {profissionais.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum funcionário ainda.</p>
        ) : (
          profissionais.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
              <span className="text-sm font-medium">{p.nome}</span>
              <span className="text-xs text-gray-400">{p.especialidade}</span>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-5 space-y-3">
        <p className="text-sm font-medium text-gray-700">Novo funcionário</p>
        <input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} placeholder="Nome" className="w-full px-3 py-2 border rounded-lg" />
        <input value={form.especialidade} onChange={(e) => setForm((p) => ({ ...p, especialidade: e.target.value }))} placeholder="Especialidade (opcional)" className="w-full px-3 py-2 border rounded-lg" />
        <input
          value={form.pin}
          onChange={(e) => setForm((p) => ({ ...p, pin: e.target.value.replace(/\D/g, "") }))}
          placeholder="PIN (4 a 6 números)"
          inputMode="numeric"
          maxLength={6}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <button onClick={adicionar} disabled={salvando} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
    </div>
  );
}
