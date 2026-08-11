"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Building2, Save, Users, Wrench, Wallet, UserCog,
  ChevronRight, CreditCard, ShieldAlert, ShieldCheck, ArrowLeft, Navigation, CheckCircle,
} from "lucide-react";
import { useEmpresa, setEmpresaIdLocal, planoDaEmpresa } from "./_lib/useEmpresa";

const CIDADES = ["Valente", "Santa Luz", "Retirolândia", "Nordestina", "São Domingos", "Outra"];

function CadastroEmpresa({ onCriada }: { onCriada: () => void }) {
  const [salvando, setSalvando] = useState(false);
  const [capturandoLocal, setCapturandoLocal] = useState(false);
  const [form, setForm] = useState({
    nome: "", responsavel: "", cidade: "Valente", contato: "", endereco: "",
    dono_nome: "", dono_email: "",
  });
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null);

  const camposOk = form.nome && form.responsavel && form.cidade && form.contato && form.endereco;

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada neste navegador.");
      return;
    }
    setCapturandoLocal(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordenadas({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCapturandoLocal(false);
        toast.success("Localização capturada!");
      },
      () => { setCapturandoLocal(false); toast.error("Erro ao capturar localização."); },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSalvar = async () => {
    if (!camposOk) {
      toast.error("Preencha nome, responsável, cidade, contato e endereço.");
      return;
    }
    setSalvando(true);
    try {
      const res = await fetch("/api/academia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recurso: "empresas", ...form,
          latitude: coordenadas?.lat ?? null,
          longitude: coordenadas?.lng ?? null,
        }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Erro ao cadastrar academia.");
      setEmpresaIdLocal(data.data.id);
      toast.success("Academia cadastrada! Aguarde a aprovação do admin master.");
      onCriada();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar academia.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Cadastre sua academia</h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          Preencha os dados abaixo para começar a gerenciar membros, serviços e cobranças.
        </p>
      </div>

      <div className="bg-white/10 rounded-3xl p-6 space-y-4">
        <input type="text" placeholder="Nome da academia *" value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-zinc-400" />
        <input type="text" placeholder="Responsável *" value={form.responsavel}
          onChange={e => setForm({ ...form, responsavel: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-zinc-400" />
        <select value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 rounded-xl text-white">
          {CIDADES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
        </select>
        <input type="tel" placeholder="Contato (telefone/WhatsApp) *" value={form.contato}
          onChange={e => setForm({ ...form, contato: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-zinc-400" />
        <input type="text" placeholder="Endereço *" value={form.endereco}
          onChange={e => setForm({ ...form, endereco: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-zinc-400" />
        <button type="button" onClick={capturarLocalizacao} disabled={capturandoLocal}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm font-semibold disabled:opacity-50">
          {coordenadas ? <CheckCircle className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
          {capturandoLocal ? "Capturando..." : coordenadas ? "Localização capturada" : "Capturar localização (para check-in dos alunos)"}
        </button>
        <input type="text" placeholder="Nome do dono (se diferente do responsável)" value={form.dono_nome}
          onChange={e => setForm({ ...form, dono_nome: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-zinc-400" />
        <input type="email" placeholder="E-mail do dono" value={form.dono_email}
          onChange={e => setForm({ ...form, dono_email: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-zinc-400" />
      </div>

      <button onClick={handleSalvar} disabled={!camposOk || salvando}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
        <Save className="w-5 h-5" /> {salvando ? "Cadastrando..." : "Cadastrar academia"}
      </button>
    </div>
  );
}

export default function AcademiaEmpresaPage() {
  const router = useRouter();
  const { empresa, empresaId, carregando, recarregar } = useEmpresa();

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-yellow-400 animate-pulse mx-auto" />
          <p className="text-white mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  const plano = planoDaEmpresa(empresa);

  const cards = [
    { id: "membros", icon: <Users className="w-6 h-6" />, titulo: "Membros", descricao: "Gerencie os alunos da sua academia", href: "/academia/empresa/membros", bgGradient: "from-emerald-500 to-teal-500" },
    { id: "equipe", icon: <UserCog className="w-6 h-6" />, titulo: "Equipe", descricao: "Instrutores e funcionários com acesso", href: "/academia/empresa/equipe", bgGradient: "from-blue-500 to-cyan-500" },
    { id: "servicos", icon: <Wrench className="w-6 h-6" />, titulo: "Serviços & Consumos", descricao: "Registre serviços avulsos prestados", href: "/academia/empresa/servicos", bgGradient: "from-orange-500 to-red-500" },
    { id: "cobrancas", icon: <Wallet className="w-6 h-6" />, titulo: "Cobranças", descricao: "Acompanhe sua mensalidade da plataforma", href: "/academia/empresa/cobrancas", bgGradient: "from-pink-500 to-rose-500" },
    { id: "plano", icon: <CreditCard className="w-6 h-6" />, titulo: "Meu Plano", descricao: plano ? `Plano atual: ${plano.nome}` : "Nenhum plano ativo", href: "/academia/empresa/plano", bgGradient: "from-violet-500 to-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <button onClick={() => router.push("/academia")} className="relative group">
            <ArrowLeft className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
          </button>
          <div className="font-black uppercase italic text-white text-sm tracking-widest">
            <span>ÁREA EMPRESARIAL</span>
          </div>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        {!empresaId || !empresa ? (
          <CadastroEmpresa onCriada={recarregar} />
        ) : (
          <>
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white mb-1">{empresa.nome}</h1>
              <p className="text-zinc-400 text-sm">{empresa.cidade} • {empresa.endereco}</p>
            </div>

            {!empresa.ativa && (
              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                <ShieldAlert className="w-5 h-5 text-yellow-400 shrink-0" />
                <p className="text-sm text-yellow-200">Seu cadastro está aguardando aprovação do admin master. Alguns recursos podem ficar limitados até a liberação.</p>
              </div>
            )}

            {empresa.status_assinatura === 'inadimplente' && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-200">Existe uma cobrança em atraso. Verifique a área de Cobranças.</p>
              </div>
            )}

            {empresa.ativa && empresa.status_assinatura === 'ativo' && (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                <p className="text-sm text-green-200">Assinatura em dia. Academia ativa na plataforma.</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-black text-yellow-400">{empresa.alunos ?? 0}</p>
                <p className="text-xs text-zinc-400">Alunos</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-black text-emerald-400">{plano?.nome || '—'}</p>
                <p className="text-xs text-zinc-400">Plano</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-black text-blue-400 capitalize">{empresa.status_assinatura}</p>
                <p className="text-xs text-zinc-400">Assinatura</p>
              </div>
            </div>

            <div className="space-y-4">
              {cards.map(card => (
                <Link key={card.id} href={card.href} className="group relative block">
                  <div className={`bg-gradient-to-r ${card.bgGradient} rounded-2xl p-5 backdrop-blur-xl border border-white/20 shadow-xl transition-all duration-300`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                        {card.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg break-words">{card.titulo}</h3>
                        <p className="text-white/70 text-sm mt-0.5 line-clamp-2">{card.descricao}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white transition shrink-0" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
