"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

// Tipos
interface Exercicio {
  id: number;
  nome: string;
  grupoMuscular: string;
  series: number;
  repeticoes: string;
  peso?: number;
  concluido: boolean;
}

interface EsporteEvento {
  id: number;
  nome: string;
  icone: string;
  local: string;
  horario: string;
  participantes: number;
  maxParticipantes: number;
  distancia?: number;
  data: string;
}

interface MetaAluno {
  tipo: string;
  meta: number;
  atual: number;
  progresso: number;
}

export default function AcademiaPage() {
  const router = useRouter();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"treino" | "esportes" | "metas" | "perfil">("treino");
  const [tempoAcademia, setTempoAcademia] = useState(0);
  const [estaNaAcademia, setEstaNaAcademia] = useState(false);
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null);
  const [esportes, setEsportes] = useState<EsporteEvento[]>([]);
  const [novoEsporte, setNovoEsporte] = useState({ nome: "", local: "", horario: "" });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dados do aluno
  const [aluno, setAluno] = useState({
    nome: user?.name || "Aluno",
    peso: 72,
    altura: 1.75,
    idade: 28,
    imc: 23.5,
    gordura: 18,
    nivel: "intermediario" as const,
    objetivo: "ganhar_massa" as const,
    diasSeguidos: 15
  });

  // Treino do dia
  const [treino, setTreino] = useState<Exercicio[]>([
    { id: 1, nome: "Supino Reto", grupoMuscular: "peito", series: 4, repeticoes: "12", peso: 40, concluido: false },
    { id: 2, nome: "Agachamento Livre", grupoMuscular: "pernas", series: 4, repeticoes: "10", peso: 60, concluido: false },
    { id: 3, nome: "Remada Curvada", grupoMuscular: "costas", series: 4, repeticoes: "12", peso: 35, concluido: false },
    { id: 4, nome: "Desenvolvimento", grupoMuscular: "ombros", series: 3, repeticoes: "10", peso: 25, concluido: false },
    { id: 5, nome: "Rosca Direta", grupoMuscular: "bracos", series: 3, repeticoes: "12", peso: 15, concluido: false },
    { id: 6, nome: "Prancha", grupoMuscular: "abdomen", series: 3, repeticoes: "45s", peso: 0, concluido: false }
  ]);

  // Metas do aluno
  const [metas, setMetas] = useState<MetaAluno[]>([
    { tipo: "Perder Peso", meta: 5, atual: 2, progresso: 40 },
    { tipo: "Treinos por Semana", meta: 5, atual: 3, progresso: 60 },
    { tipo: "Minutos por Treino", meta: 60, atual: 45, progresso: 75 }
  ]);

  // Esportes disponíveis
  const esportesDisponiveis = [
    { nome: "Futebol", icone: "⚽", cores: "from-green-600 to-green-800" },
    { nome: "Vôlei", icone: "🏐", cores: "from-yellow-600 to-yellow-800" },
    { nome: "Basquete", icone: "🏀", cores: "from-orange-600 to-orange-800" },
    { nome: "Natação", icone: "🏊", cores: "from-blue-600 to-blue-800" },
    { nome: "Corrida", icone: "🏃", cores: "from-red-600 to-red-800" },
    { nome: "Funcional", icone: "💪", cores: "from-purple-600 to-purple-800" },
    { nome: "Crossfit", icone: "🏋️", cores: "from-gray-600 to-gray-800" },
    { nome: "Muay Thai", icone: "🥊", cores: "from-red-700 to-red-900" }
  ];

  // Geolocalização para detectar presença na academia
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocalizacao({ lat: latitude, lng: longitude });
          
          // Simular detecção da academia (latitude/longitude da academia de Valente)
          const academiaLat = -11.4123;
          const academiaLng = -39.4625;
          const distancia = Math.sqrt(
            Math.pow(latitude - academiaLat, 2) + 
            Math.pow(longitude - academiaLng, 2)
          ) * 111; // Aproximação em km
          
          if (distancia < 0.5) { // Dentro de 500m
            if (!estaNaAcademia) {
              setEstaNaAcademia(true);
              toast.success("📍 Você chegou na academia! Vamos registrar seu treino?");
              
              // Iniciar contagem de tempo
              intervalRef.current = setInterval(() => {
                setTempoAcademia(prev => prev + 1);
              }, 60000); // a cada minuto
            }
          } else {
            if (estaNaAcademia) {
              setEstaNaAcademia(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
              if (tempoAcademia > 0) {
                toast.success(`🏋️ Treino finalizado! Você ficou ${tempoAcademia} minutos na academia.`);
              }
            }
          }
        },
        (error) => {
          console.log("Erro de geolocalização:", error);
        }
      );
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [estaNaAcademia, tempoAcademia]);

  // Carregar esportes salvos
  useEffect(() => {
    const saved = localStorage.getItem("academia_esportes");
    if (saved) {
      setEsportes(JSON.parse(saved));
    } else {
      // Dados de exemplo
      setEsportes([
        { id: 1, nome: "Futebol Society", icone: "⚽", local: "Campo Municipal", horario: "19:00", participantes: 8, maxParticipantes: 10, data: "15/06/2026" },
        { id: 2, nome: "Corrida Noturna", icone: "🏃", local: "Parque da Cidade", horario: "18:30", participantes: 12, maxParticipantes: 20, data: "16/06/2026" },
        { id: 3, nome: "Vôlei de Praia", icone: "🏐", local: "Quadra do Sesi", horario: "17:00", participantes: 4, maxParticipantes: 8, data: "17/06/2026" }
      ]);
    }
  }, []);

  const toggleExercicio = (id: number) => {
    setTreino(prev => prev.map(ex => 
      ex.id === id ? { ...ex, concluido: !ex.concluido } : ex
    ));
    toast.success("Exercício registrado!");
  };

  const registrarTreino = () => {
    const concluidos = treino.filter(e => e.concluido).length;
    const novoDiasSeguidos = concluidos > 0 ? aluno.diasSeguidos + 1 : aluno.diasSeguidos;
    
    setAluno(prev => ({ ...prev, diasSeguidos: novoDiasSeguidos }));
    
    // Atualizar progresso das metas
    setMetas(prev => prev.map(meta => {
      if (meta.tipo === "Treinos por Semana" && concluidos > 0) {
        const novoAtual = Math.min(meta.atual + 1, meta.meta);
        return { ...meta, atual: novoAtual, progresso: (novoAtual / meta.meta) * 100 };
      }
      if (meta.tipo === "Minutos por Treino") {
        const novoProgresso = Math.min((tempoAcademia / meta.meta) * 100, 100);
        return { ...meta, progresso: novoProgresso };
      }
      return meta;
    }));
    
    toast.success(`🏆 Treino finalizado! +${concluidos} exercícios concluídos. Dias seguidos: ${novoDiasSeguidos}`);
  };

  const participarEsporte = (id: number) => {
    setEsportes(prev => prev.map(e => 
      e.id === id ? { ...e, participantes: e.participantes + 1 } : e
    ));
    toast.success("✅ Participação confirmada!");
  };

  const criarEsporte = () => {
    if (novoEsporte.nome && novoEsporte.local && novoEsporte.horario) {
      const novoEvento: EsporteEvento = {
        id: Date.now(),
        nome: novoEsporte.nome,
        icone: "🏆",
        local: novoEsporte.local,
        horario: novoEsporte.horario,
        participantes: 1,
        maxParticipantes: 10,
        data: new Date().toLocaleDateString()
      };
      const novosEsportes = [...esportes, novoEvento];
      setEsportes(novosEsportes);
      localStorage.setItem("academia_esportes", JSON.stringify(novosEsportes));
      setNovoEsporte({ nome: "", local: "", horario: "" });
      toast.success("Evento esportivo criado!");
    }
  };

  const atualizarMeta = (index: number, valor: number) => {
    setMetas(prev => prev.map((meta, i) => 
      i === index ? { ...meta, meta: valor, progresso: (meta.atual / valor) * 100 } : meta
    ));
    toast.success("Meta atualizada!");
  };

  const atualizarCondicaoFisica = (campo: string, valor: number) => {
    const novoPeso = campo === "peso" ? valor : aluno.peso;
    const novoImc = novoPeso / (aluno.altura * aluno.altura);
    
    setAluno(prev => ({ 
      ...prev, 
      [campo]: valor,
      imc: novoImc
    }));
    toast.success("Dados físicos atualizados!");
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header com indicador de tempo na academia */}
      <header className="bg-gradient-to-r from-green-400 to-green-700 sticky top-0 z-40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}><i className="fas fa-arrow-left text-white text-xl"></i></button>
            <h1 className="text-white font-bold text-lg">💪 Academia Valente</h1>
          </div>
          {estaNaAcademia && (
            <div className="bg-yellow-400/20 px-3 py-1 rounded-full">
              <i className="fas fa-clock text-yellow-400 mr-1"></i>
              <span className="text-yellow-400 text-sm font-bold">{tempoAcademia} min</span>
            </div>
          )}
        </div>
      </header>

      {/* Cards de status do aluno */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-800 p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-sm">Olá, {aluno.nome}</p>
            <p className="text-2xl font-bold text-white">
              Nível {aluno.nivel === "iniciante" ? "Iniciante" : aluno.nivel === "intermediario" ? "Intermediário" : "Avançado"}
            </p>
            <p className="text-purple-200 text-sm">🔥 {aluno.diasSeguidos} dias seguidos</p>
          </div>
          <div className="text-right">
            <p className="text-white text-sm">IMC {aluno.imc.toFixed(1)}</p>
            <p className="text-white text-sm">⚡ {aluno.gordura}% gordura</p>
            <p className="text-white text-sm">🎯 {aluno.objetivo === "ganhar_massa" ? "Ganhar Massa" : "Emagrecer"}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-900">
        <button onClick={() => setActiveTab("treino")} className={`flex-1 py-3 text-center font-bold transition-all ${activeTab === "treino" ? "text-purple-400 border-b-2 border-purple-400 bg-gray-800" : "text-gray-400"}`}>
          📋 Treino
        </button>
        <button onClick={() => setActiveTab("esportes")} className={`flex-1 py-3 text-center font-bold transition-all ${activeTab === "esportes" ? "text-purple-400 border-b-2 border-purple-400 bg-gray-800" : "text-gray-400"}`}>
          ⚽ Esportes
        </button>
        <button onClick={() => setActiveTab("metas")} className={`flex-1 py-3 text-center font-bold transition-all ${activeTab === "metas" ? "text-purple-400 border-b-2 border-purple-400 bg-gray-800" : "text-gray-400"}`}>
          🎯 Metas
        </button>
        <button onClick={() => setActiveTab("perfil")} className={`flex-1 py-3 text-center font-bold transition-all ${activeTab === "perfil" ? "text-purple-400 border-b-2 border-purple-400 bg-gray-800" : "text-gray-400"}`}>
          👤 Perfil
        </button>
      </div>

      {/* Conteúdo - Treino */}
      {activeTab === "treino" && (
        <div className="p-4">
          <div className="bg-purple-500/20 rounded-2xl p-3 mb-4 text-center">
            <p className="text-purple-300 text-sm">📍 Geolocalização ativa</p>
            <p className="text-white text-xs">
              {estaNaAcademia ? "✅ Você está na academia! Tempo registrado." : "❌ Você está fora da academia. Aproxime-se para registrar seu treino."}
            </p>
          </div>

          <h2 className="text-white font-bold mb-3">🏋️ Treino de Hoje</h2>
          <div className="space-y-3 mb-6">
            {treino.map(ex => (
              <div key={ex.id} className={`bg-gray-800 rounded-2xl p-3 flex items-center justify-between ${ex.concluido ? "opacity-60" : ""}`}>
                <div>
                  <p className="font-bold text-white">{ex.nome}</p>
                  <p className="text-gray-400 text-sm">{ex.series}x {ex.repeticoes} {ex.peso ? `- ${ex.peso}kg` : ""}</p>
                  <p className="text-purple-400 text-xs">{ex.grupoMuscular}</p>
                </div>
                <button 
                  onClick={() => toggleExercicio(ex.id)} 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${ex.concluido ? "bg-green-500" : "bg-gray-700"}`}
                  disabled={!estaNaAcademia}
                >
                  <i className={`fas ${ex.concluido ? "fa-check text-white" : "fa-circle text-gray-500"}`}></i>
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={registrarTreino} 
            className="w-full bg-purple-600 text-white py-3 rounded-2xl font-bold hover:bg-purple-500 transition"
            disabled={!estaNaAcademia}
          >
            {estaNaAcademia ? "✅ REGISTRAR TREINO" : "📍 CHEGUE NA ACADEMIA PARA REGISTRAR"}
          </button>

          {tempoAcademia > 0 && (
            <div className="mt-4 bg-green-500/20 rounded-2xl p-3 text-center">
              <p className="text-green-400">⏱️ Tempo total na academia: {tempoAcademia} minutos</p>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo - Esportes com Geolocalização */}
      {activeTab === "esportes" && (
        <div className="p-4">
          {/* Criar novo evento esportivo */}
          <div className="bg-gray-800 rounded-2xl p-4 mb-6">
            <h3 className="text-white font-bold mb-3">🏆 Criar Evento Esportivo</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nome do evento"
                value={novoEsporte.nome}
                onChange={(e) => setNovoEsporte({ ...novoEsporte, nome: e.target.value })}
                className="w-full bg-gray-700 rounded-xl p-2 text-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Local (com geolocalização)"
                value={novoEsporte.local}
                onChange={(e) => setNovoEsporte({ ...novoEsporte, local: e.target.value })}
                className="w-full bg-gray-700 rounded-xl p-2 text-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Horário"
                value={novoEsporte.horario}
                onChange={(e) => setNovoEsporte({ ...novoEsporte, horario: e.target.value })}
                className="w-full bg-gray-700 rounded-xl p-2 text-white placeholder-gray-400"
              />
              <button onClick={criarEsporte} className="w-full bg-purple-600 text-white py-2 rounded-xl font-bold">
                Criar Evento +
              </button>
            </div>
          </div>

          {/* Esportes disponíveis */}
          <h3 className="text-white font-bold mb-3">⚽ Próximos Eventos</h3>
          <div className="space-y-3">
            {esportes.map(evento => (
              <div key={evento.id} className="bg-gray-800 rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{evento.icone}</div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{evento.nome}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <i className="fas fa-map-marker-alt text-red-400 text-xs"></i> {evento.local}
                    </p>
                    <p className="text-gray-400 text-sm">
                      <i className="far fa-clock text-blue-400 text-xs"></i> {evento.horario}
                    </p>
                    <p className="text-purple-400 text-xs">
                      {evento.participantes}/{evento.maxParticipantes} participantes
                    </p>
                  </div>
                  <button 
                    onClick={() => participarEsporte(evento.id)}
                    className="bg-green-500 text-black px-3 py-2 rounded-xl text-sm font-bold"
                    disabled={evento.participantes >= evento.maxParticipantes}
                  >
                    Participar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo - Metas */}
      {activeTab === "metas" && (
        <div className="p-4">
          <h2 className="text-white font-bold mb-3">🎯 Minhas Metas</h2>
          <div className="space-y-4">
            {metas.map((meta, idx) => (
              <div key={idx} className="bg-gray-800 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-bold">{meta.tipo}</span>
                  <span className="text-purple-400">{meta.atual}/{meta.meta}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${meta.progresso}%` }}></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400 text-xs">Progresso: {Math.round(meta.progresso)}%</span>
                  <input
                    type="range"
                    min="0"
                    max={meta.tipo === "Perder Peso" ? 20 : meta.tipo === "Treinos por Semana" ? 7 : 120}
                    value={meta.meta}
                    onChange={(e) => atualizarMeta(idx, parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo - Perfil e Condições Físicas */}
      {activeTab === "perfil" && (
        <div className="p-4">
          <div className="bg-gray-800 rounded-2xl p-4 mb-4 text-center">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto">
              {aluno.nome.charAt(0)}
            </div>
            <h2 className="text-white font-bold text-xl mt-2">{aluno.nome}</h2>
            <p className="text-gray-400">Membro desde 2025</p>
            <p className="text-purple-400 text-sm mt-1">Plano: Premium</p>
          </div>

          <h3 className="text-white font-bold mb-3">📊 Condições Físicas</h3>
          <div className="space-y-3">
            <div className="bg-gray-800 rounded-2xl p-3">
              <label className="text-gray-400 text-sm block mb-1">Peso (kg)</label>
              <input
                type="number"
                value={aluno.peso}
                onChange={(e) => atualizarCondicaoFisica("peso", parseFloat(e.target.value))}
                className="w-full bg-gray-700 rounded-xl p-2 text-white"
                step="0.5"
              />
            </div>
            <div className="bg-gray-800 rounded-2xl p-3">
              <label className="text-gray-400 text-sm block mb-1">Altura (m)</label>
              <input
                type="number"
                value={aluno.altura}
                onChange={(e) => atualizarCondicaoFisica("altura", parseFloat(e.target.value))}
                className="w-full bg-gray-700 rounded-xl p-2 text-white"
                step="0.01"
              />
            </div>
            <div className="bg-gray-800 rounded-2xl p-3">
              <label className="text-gray-400 text-sm block mb-1">% Gordura</label>
              <input
                type="number"
                value={aluno.gordura}
                onChange={(e) => atualizarCondicaoFisica("gordura", parseFloat(e.target.value))}
                className="w-full bg-gray-700 rounded-xl p-2 text-white"
                step="0.5"
              />
            </div>
            <div className="bg-gray-800 rounded-2xl p-3">
              <label className="text-gray-400 text-sm block mb-1">IMC Calculado</label>
              <input
                type="text"
                value={aluno.imc.toFixed(1)}
                disabled
                className="w-full bg-gray-700 rounded-xl p-2 text-white opacity-70"
              />
            </div>
            <div className="bg-gray-800 rounded-2xl p-3">
              <label className="text-gray-400 text-sm block mb-1">Objetivo Principal</label>
              <select
                value={aluno.objetivo}
                onChange={(e) => setAluno(prev => ({ ...prev, objetivo: e.target.value as any }))}
                className="w-full bg-gray-700 rounded-xl p-2 text-white"
              >
                <option value="emagrecer">Emagrecer</option>
                <option value="ganhar_massa">Ganhar Massa Muscular</option>
                <option value="definir">Definir o Corpo</option>
                <option value="condicionamento">Condicionamento Físico</option>
                <option value="saude">Saúde e Bem-estar</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Botão flutuante para registrar treino rápido */}
      {estaNaAcademia && (
        <button 
          onClick={registrarTreino}
          className="fixed bottom-20 right-4 bg-purple-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-50 animate-bounce"
        >
          <i className="fas fa-dumbbell text-xl"></i>
        </button>
      )}
    </div>
  );
}
