"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { 
  User, Dumbbell, Trophy, Target, Activity, 
  Heart, Bell, ChevronRight, ArrowLeft, Scale,
  BookOpen, TrendingUp, Brain, CheckCircle, Clock
} from "lucide-react";

// Adicionado para desabilitar renderização estática
export const dynamic = 'force-dynamic';

interface PerfilCompleto {
  nome: string;
  objetivo: string;
  peso: number;
  altura: number;
  idade: number;
}

export default function AcademiaPage() {
  const router = useRouter();
  const { user } = useApp();
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [academiaCadastrada, setAcademiaCadastrada] = useState(false);
  const [esportesCadastrados, setEsportesCadastrados] = useState(false);
  const [perfilData, setPerfilData] = useState<PerfilCompleto | null>(null);
  const [ultimoTreino, setUltimoTreino] = useState<string | null>(null);
  const [treinosSemana, setTreinosSemana] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const perfilIA = localStorage.getItem('academia_perfil_ia');
    const perfilInicial = localStorage.getItem('academia_perfil_inicial');
    const academia = localStorage.getItem('academia_local_dados');
    const esportes = localStorage.getItem('academia_esportes');
    const historicoCargas = localStorage.getItem('historico_carga_atividades');
    
    if (perfilIA) {
      const data = JSON.parse(perfilIA);
      setPerfilCompleto(true);
      let objetivoTexto = "Saúde";
      if (data.objetivo === 'emagrecer') objetivoTexto = "Emagrecimento";
      else if (data.objetivo === 'hipertrofia') objetivoTexto = "Hipertrofia";
      else if (data.objetivo === 'condicionamento') objetivoTexto = "Condicionamento Físico";
      else if (data.objetivo === 'saude') objetivoTexto = "Saúde";
      
      setPerfilData({
        nome: data.nome,
        objetivo: objetivoTexto,
        peso: data.peso_atual,
        altura: data.altura,
        idade: data.idade
      });
    } else if (perfilInicial) {
      const data = JSON.parse(perfilInicial);
      setPerfilCompleto(true);
      let objetivoTexto = "Saúde";
      if (data.objetivos?.includes('Emagrecimento')) objetivoTexto = "Emagrecimento";
      else if (data.objetivos?.includes('Ganho de massa muscular')) objetivoTexto = "Hipertrofia";
      else if (data.objetivos?.includes('Condicionamento físico')) objetivoTexto = "Condicionamento Físico";
      
      setPerfilData({
        nome: data.nome,
        objetivo: objetivoTexto,
        peso: parseFloat(data.peso),
        altura: parseFloat(data.altura),
        idade: parseInt(data.idade)
      });
    }
    
    setAcademiaCadastrada(!!academia);
    setEsportesCadastrados(!!(esportes && JSON.parse(esportes).length > 0));
    
    if (historicoCargas) {
      const cargas = JSON.parse(historicoCargas);
      setTreinosSemana(Math.min(cargas.length, 5));
    } else {
      setTreinosSemana(perfilCompleto ? 2 : 0);
    }
    
    setUltimoTreino(new Date().toLocaleDateString('pt-BR'));
  }, []);

  if (!mounted) {
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

  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  // CARDS - REMOVIDO O CARD "PERFIL E METAS"
  const cards = [
    {
      id: "cadastro",
      titulo: "?? Cadastro Inicial",
      descricao: perfilCompleto ? "? Perfil completo e IA configurada" : "Complete seu perfil físico e de saúde",
      status: perfilCompleto ? "? Completo" : "? Pendente",
      statusCor: perfilCompleto ? "text-green-400" : "text-yellow-400",
      href: perfilCompleto ? "/academia/perfil" : "/academia/cadastro-inicial",
      icon: <User className="w-6 h-6" />,
      bgGradient: "from-blue-500 to-cyan-500",
      complemento: perfilCompleto && perfilData ? `${perfilData.nome} • ${perfilData.idade} anos • ${perfilData.peso}kg` : "Configure suas características"
    },
    {
      id: "academia",
      titulo: "??? Academia Local",
      descricao: academiaCadastrada ? "? Academia cadastrada e configurada" : "Cadastre onde você treina e suas atividades",
      status: academiaCadastrada ? "? Cadastrada" : "? Pendente",
      statusCor: academiaCadastrada ? "text-green-400" : "text-yellow-400",
      href: "/academia/academia-local",
      icon: <Dumbbell className="w-6 h-6" />,
      bgGradient: "from-emerald-500 to-teal-500",
      complemento: academiaCadastrada ? "Seu local de treino já está registrado" : "Adicione sua academia e atividades"
    },
    {
      id: "esportes",
      titulo: "? Esportes",
      descricao: esportesCadastrados ? "? Atividades esportivas configuradas" : "Cadastre outras atividades físicas",
      status: esportesCadastrados ? "? Ativo" : "? Pendente",
      statusCor: esportesCadastrados ? "text-green-400" : "text-yellow-400",
      href: "/academia/esportes",
      icon: <Trophy className="w-6 h-6" />,
      bgGradient: "from-orange-500 to-red-500",
      complemento: esportesCadastrados ? "Receba alertas no horário agendado" : "Adicione esportes e receba alertas"
    },
    {
      id: "biblioteca",
      titulo: "?? Biblioteca de Exercícios",
      descricao: "Exercícios, técnicas e instruções completas",
      status: "?? Disponível",
      statusCor: "text-indigo-400",
      href: "/academia/biblioteca",
      icon: <BookOpen className="w-6 h-6" />,
      bgGradient: "from-indigo-500 to-violet-500",
      complemento: "+15 exercícios com vídeos e instruções"
    },
    {
      id: "historico",
      titulo: "?? Histórico de Cargas",
      descricao: "Acompanhe sua evolução de pesos",
      status: "?? Ativo",
      statusCor: "text-emerald-400",
      href: "/academia/historico-carga",
      icon: <TrendingUp className="w-6 h-6" />,
      bgGradient: "from-teal-500 to-green-500",
      complemento: "Registre e acompanhe seu progresso"
    },
    {
      id: "ia",
      titulo: "?? Inteligência Fitness",
      descricao: perfilCompleto ? "IA personalizada para seus treinos" : "Complete o cadastro para ativar a IA",
      status: perfilCompleto ? "?? Ativo" : "?? Pendente",
      statusCor: perfilCompleto ? "text-pink-400" : "text-gray-400",
      href: perfilCompleto ? "/academia/ia" : "/academia/cadastro-inicial",
      icon: <Brain className="w-6 h-6" />,
      bgGradient: "from-pink-500 to-rose-500",
      complemento: perfilCompleto ? "Recomendações personalizadas" : "Complete seu perfil primeiro"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <button onClick={() => router.push("/")} className="relative group">
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
            {getSaudacao()}, {perfilData?.nome || (user?.nome || "Atleta")}!
          </h1>
          <p className="text-zinc-400 text-sm">
            {perfilCompleto 
              ? `?? Foco em ${perfilData?.objetivo || "saúde"} • ${perfilData?.peso}kg • ${treinosSemana} treinos/semana`
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
                    <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                      <span className="text-[10px]">??</span> 
                      <span className="truncate">{card.complemento}</span>
                    </p>
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
            {!perfilCompleto && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <p className="text-sm text-white">?? Complete seu cadastro inicial para ativar a IA!</p>
              </div>
            )}
            {!academiaCadastrada && perfilCompleto && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <p className="text-sm text-white">??? Cadastre sua academia para começar a treinar!</p>
              </div>
            )}
            {perfilCompleto && academiaCadastrada && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-sm text-white">?? Você está a {5 - treinosSemana} treinos de bater sua meta semanal!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

