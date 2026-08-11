// Caminho: C:\valente_conecta\app\academia\aluno\page.tsx
// Movido de app/academia/page.tsx — agora /academia é a tela de escolha
// (aluno vs empresa), e este é o dashboard do aluno propriamente dito.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Dumbbell, Trophy, Target, Activity,
  Bell, ChevronRight, ArrowLeft,
  BookOpen, TrendingUp, Brain, MapPin,
} from "lucide-react";
import PushOptIn from "./_lib/PushOptIn";

export const dynamic = 'force-dynamic';

const ALUNO_ID_STORAGE_KEY = 'academia_aluno_local_id';

interface PerfilResumo {
  nome: string;
  objetivo: string;
  peso: number | null;
  idade: number | null;
}

async function obterOuCriarAlunoId(): Promise<number | null> {
  if (typeof window === 'undefined') return null;

  const existente = localStorage.getItem(ALUNO_ID_STORAGE_KEY);
  if (existente) return Number(existente);

  try {
    const res = await fetch('/api/academia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recurso: 'alunos', nome: 'Atleta', status: 'ativo' }),
    });
    const data = await res.json();
    if (data?.success && data?.data?.id) {
      localStorage.setItem(ALUNO_ID_STORAGE_KEY, String(data.data.id));
      return data.data.id;
    }
  } catch {
    // segue sem aluno_id — telas tratam esse caso pedindo pra recarregar
  }
  return null;
}

function traduzObjetivo(objetivos: string[] | undefined): string {
  if (!objetivos || objetivos.length === 0) return "Saúde";
  if (objetivos.includes('Emagrecimento')) return "Emagrecimento";
  if (objetivos.includes('Ganho de massa muscular')) return "Hipertrofia";
  if (objetivos.includes('Condicionamento físico')) return "Condicionamento Físico";
  return "Saúde";
}

export default function AcademiaPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [alunoId, setAlunoId] = useState<number | null>(null);
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [perfilResumo, setPerfilResumo] = useState<PerfilResumo | null>(null);
  const [academiaCadastrada, setAcademiaCadastrada] = useState(false);
  const [esportesCadastrados, setEsportesCadastrados] = useState(false);
  const [treinosSemana, setTreinosSemana] = useState(0);

  useEffect(() => {
    (async () => {
      const id = await obterOuCriarAlunoId();
      setAlunoId(id);
      if (!id) {
        setCarregando(false);
        return;
      }

      try {
        const [alunoRes, perfilRes, esportesRes, execucoesRes] = await Promise.all([
          fetch(`/api/academia?recurso=alunos&aluno_id=${id}`),
          fetch(`/api/academia?recurso=perfil&aluno_id=${id}`),
          fetch(`/api/academia?recurso=atividades_esportivas&aluno_id=${id}`),
          fetch(`/api/academia?recurso=execucoes&aluno_id=${id}`),
        ]);

        const alunoData = await alunoRes.json();
        const perfilData = await perfilRes.json();
        const esportesData = await esportesRes.json();
        const execucoesData = await execucoesRes.json();

        const aluno = alunoData?.data?.[0] || null;
        const perfil = perfilData?.data || null;

        if (perfil) {
          setPerfilCompleto(true);
          setPerfilResumo({
            nome: aluno?.nome || 'Atleta',
            objetivo: traduzObjetivo(perfil.objetivos),
            peso: perfil.peso_atual,
            idade: perfil.idade,
          });
        }

        const temAcademiaVinculada = Boolean(aluno?.gym_unit_id || aluno?.academia_manual_nome);
        setAcademiaCadastrada(temAcademiaVinculada);

        setEsportesCadastrados(Array.isArray(esportesData?.data) && esportesData.data.length > 0);

        const seteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const diasComTreino = new Set(
          (execucoesData?.data || [])
            .filter((e: any) => new Date(e.concluido_em).getTime() >= seteDiasAtras)
            .map((e: any) => new Date(e.concluido_em).toISOString().slice(0, 10))
        );
        setTreinosSemana(Math.min(diasComTreino.size, 7));
      } catch {
        // silencioso — cards mostram estado "pendente" por padrão
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Dumbbell className="w-16 h-16 text-yellow-400 animate-pulse mx-auto" />
            <p className="text-white mt-4">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    {
      id: "cadastro",
      icon: <User className="w-6 h-6" />,
      titulo: "Cadastro Inicial",
      descricao: perfilCompleto ? "Perfil completo e IA configurada" : "Complete seu perfil físico e de saúde",
      status: perfilCompleto ? "Completo" : "Pendente",
      statusCor: perfilCompleto ? "text-green-400" : "text-yellow-400",
      href: "/academia/cadastro-inicial",
      bgGradient: "from-blue-500 to-cyan-500",
      complemento: perfilCompleto && perfilResumo
        ? `${perfilResumo.nome} • ${perfilResumo.idade ?? '--'} anos • ${perfilResumo.peso ?? '--'}kg`
        : "Configure suas características",
    },
    {
      id: "academia",
      icon: <Dumbbell className="w-6 h-6" />,
      titulo: "Academia Local",
      descricao: academiaCadastrada ? "Academia cadastrada e configurada" : "Cadastre onde você treina e suas atividades",
      status: academiaCadastrada ? "Cadastrada" : "Pendente",
      statusCor: academiaCadastrada ? "text-green-400" : "text-yellow-400",
      href: "/academia/academia-local",
      bgGradient: "from-emerald-500 to-teal-500",
      complemento: academiaCadastrada ? "Seu local de treino já está registrado" : "Adicione sua academia e atividades",
    },
    {
      id: "esportes",
      icon: <Trophy className="w-6 h-6" />,
      titulo: "Esportes",
      descricao: esportesCadastrados ? "Atividades esportivas configuradas" : "Cadastre outras atividades físicas",
      status: esportesCadastrados ? "Ativo" : "Pendente",
      statusCor: esportesCadastrados ? "text-green-400" : "text-yellow-400",
      href: "/academia/esportes",
      bgGradient: "from-orange-500 to-red-500",
      complemento: esportesCadastrados ? "Receba alertas no horário agendado" : "Adicione esportes e receba alertas",
    },
    {
      id: "biblioteca",
      icon: <BookOpen className="w-6 h-6" />,
      titulo: "Biblioteca de Exercícios",
      descricao: "Exercícios, técnicas e instruções completas",
      status: "Disponível",
      statusCor: "text-indigo-400",
      href: "/academia/biblioteca",
      bgGradient: "from-indigo-500 to-violet-500",
      complemento: "Catálogo com vídeos e instruções",
    },
    {
      id: "checkin",
      icon: <MapPin className="w-6 h-6" />,
      titulo: "Check-in por Proximidade",
      descricao: "Confirme sua presença quando estiver na academia",
      status: "Disponível",
      statusCor: "text-emerald-400",
      href: "/academia/aluno/checkin",
      bgGradient: "from-cyan-500 to-blue-500",
      complemento: "Usa sua localização para registrar presença",
    },
    {
      id: "historico",
      icon: <TrendingUp className="w-6 h-6" />,
      titulo: "Histórico de Cargas",
      descricao: "Acompanhe sua evolução de pesos",
      status: "Ativo",
      statusCor: "text-emerald-400",
      href: "/academia/historico-carga",
      bgGradient: "from-teal-500 to-green-500",
      complemento: "Registre e acompanhe seu progresso",
    },
    {
      id: "ia",
      icon: <Brain className="w-6 h-6" />,
      titulo: "Inteligência Fitness",
      descricao: perfilCompleto ? "IA personalizada para seus treinos" : "Complete o cadastro para ativar a IA",
      status: perfilCompleto ? "Ativo" : "Pendente",
      statusCor: perfilCompleto ? "text-pink-400" : "text-gray-400",
      href: perfilCompleto ? "/academia/ia" : "/academia/cadastro-inicial",
      bgGradient: "from-pink-500 to-rose-500",
      complemento: perfilCompleto ? "Recomendações personalizadas" : "Complete seu perfil primeiro",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <button onClick={() => router.push("/academia")} className="relative group">
            <ArrowLeft className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
          </button>
          <div className="font-black uppercase italic text-white text-sm tracking-widest">
            <span>MINHA ACADEMIA</span>
          </div>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mb-4">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">
            {getSaudacao()}, {perfilResumo?.nome || "Atleta"}!
          </h1>
          <p className="text-zinc-400 text-sm">
            {perfilCompleto
              ? `Foco em ${perfilResumo?.objetivo || "saúde"} • ${treinosSemana} treinos essa semana`
              : "Complete seu cadastro para começar"}
          </p>
        </div>

        <div className="space-y-4">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className={`group relative block ${!perfilCompleto && card.id === 'ia' ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <div className={`bg-gradient-to-r ${card.bgGradient} rounded-2xl p-5 backdrop-blur-xl border border-white/20 shadow-xl transition-all duration-300`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-lg break-words">{card.titulo}</h3>
                      <span className={`text-xs font-bold shrink-0 ${card.statusCor}`}>{card.status}</span>
                    </div>
                    <p className="text-white/70 text-sm mt-0.5 line-clamp-2">{card.descricao}</p>
                    <p className="text-white/40 text-xs mt-1 truncate">{card.complemento}</p>
                  </div>
                  <div className="shrink-0">
                    <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white transition" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-yellow-400" />
            Resumo da Semana
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-black text-yellow-400">{treinosSemana}</p><p className="text-xs text-zinc-400">Treinos</p></div>
            <div><p className="text-2xl font-black text-green-400">{treinosSemana * 45}</p><p className="text-xs text-zinc-400">Minutos</p></div>
            <div><p className="text-2xl font-black text-blue-400">{treinosSemana * 320}</p><p className="text-xs text-zinc-400">Calorias</p></div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><Bell className="w-5 h-5 text-yellow-400" /><h3 className="font-bold text-white">Alertas</h3></div>
          <div className="space-y-2">
            <PushOptIn alunoId={alunoId} />
            {!perfilCompleto && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <p className="text-sm text-white">Complete seu cadastro inicial para ativar a IA!</p>
              </div>
            )}
            {!academiaCadastrada && perfilCompleto && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <p className="text-sm text-white">Cadastre sua academia para começar a treinar!</p>
              </div>
            )}
            {perfilCompleto && academiaCadastrada && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-sm text-white">Você está a {Math.max(0, 5 - treinosSemana)} treinos de bater sua meta semanal!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
