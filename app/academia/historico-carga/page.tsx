"use client";

export const dynamic = 'force-dynamic';  // ← ÚNICA LINHA ADICIONADA

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Weight, Target, Calendar, CheckCircle, Circle } from 'lucide-react';

interface AtividadeCarga {
  id: string;
  nome: string;
  grupoMuscular: string;
  cargaAtual: number;
  metaCarga: number;
  dataUltimoTreino?: string;
  observacoes?: string;
  series?: number;
  repeticoes?: string;
}

export default function HistoricoCargaPage() {
  const router = useRouter();
  const [atividades, setAtividades] = useState<AtividadeCarga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    // FONTE ÚNICA: Buscar da Academia Local
    const academiaDados = localStorage.getItem('academia_local_dados');
    
    if (academiaDados) {
      const academia = JSON.parse(academiaDados);
      if (academia.exercicios && academia.exercicios.length > 0) {
        const cargas = academia.exercicios.map((ex: any) => ({
          id: ex.id,
          nome: ex.nome,
          grupoMuscular: ex.grupoMuscular,
          cargaAtual: ex.cargaAtual,
          metaCarga: ex.cargaMeta,
          dataUltimoTreino: ex.dataConclusao,
          series: ex.series,
          repeticoes: ex.repeticoes,
          observacoes: `${ex.series}x${ex.repeticoes}`
        }));
        setAtividades(cargas);
      }
    }
    setLoading(false);
  };

  const atualizarCarga = (id: string, delta: number) => {
    const novas = atividades.map(a => 
      a.id === id ? { ...a, cargaAtual: Math.max(0, a.cargaAtual + delta), dataUltimoTreino: new Date().toISOString() } : a
    );
    setAtividades(novas);
    
    // Atualizar também na Academia Local
    const academiaDados = localStorage.getItem('academia_local_dados');
    if (academiaDados) {
      const academia = JSON.parse(academiaDados);
      if (academia.exercicios) {
        const exerciciosAtualizados = academia.exercicios.map((ex: any) => 
          ex.id === id ? { ...ex, cargaAtual: Math.max(0, ex.cargaAtual + delta) } : ex
        );
        academia.exercicios = exerciciosAtualizados;
        localStorage.setItem('academia_local_dados', JSON.stringify(academia));
      }
    }
    
    // Atualizar cache do histórico
    localStorage.setItem('historico_carga_atividades', JSON.stringify(novas));
  };

  const progressoTotal = atividades.length > 0 
    ? (atividades.filter(a => a.cargaAtual >= a.metaCarga).length / atividades.length) * 100 
    : 0;

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><TrendingUp className="w-16 h-16 text-gray-300 animate-pulse" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/academia")} className="text-gray-600"><ArrowLeft className="w-5 h-5" /></button>
            <div><h1 className="text-2xl font-black text-gray-900">Histórico de Cargas</h1><p className="text-sm text-gray-500">Acompanhe sua evolução de pesos</p></div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2"><Target className="w-5 h-5" /><h2 className="font-bold">Progresso das Metas</h2></div>
          <div className="flex justify-between text-sm mb-1"><span>{atividades.filter(a => a.cargaAtual >= a.metaCarga).length} de {atividades.length} metas atingidas</span><span>{Math.round(progressoTotal)}%</span></div>
          <div className="w-full bg-white/20 rounded-full h-2"><div className="bg-white rounded-full h-2" style={{ width: `${progressoTotal}%` }} /></div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-black text-lg text-gray-900 mb-4 flex items-center gap-2"><Weight className="w-5 h-5 text-indigo-600" />Meus Exercícios</h3>
          <div className="space-y-3">
            {atividades.map(a => {
              const pct = Math.min(100, (a.cargaAtual / a.metaCarga) * 100);
              return (
                <div key={a.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{a.nome}</h4>
                      <p className="text-xs text-gray-500">{a.grupoMuscular}</p>
                      {a.observacoes && <p className="text-xs text-gray-400 mt-1">{a.observacoes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => atualizarCarga(a.id, -2.5)} className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><span className="text-gray-600 font-bold">-</span></button>
                      <div className="text-center min-w-[70px]"><p className="text-lg font-black text-indigo-600">{a.cargaAtual} kg</p><p className="text-[10px] text-gray-400">meta: {a.metaCarga}</p></div>
                      <button onClick={() => atualizarCarga(a.id, 2.5)} className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><span className="text-gray-600 font-bold">+</span></button>
                    </div>
                  </div>
                  <div className="mt-2"><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} /></div></div>
                  {a.dataUltimoTreino && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" />Último: {new Date(a.dataUltimoTreino).toLocaleDateString()}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {atividades.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhuma atividade cadastrada</p>
            <p className="text-sm text-gray-400 mt-1">Cadastre sua academia primeiro</p>
            <Link href="/academia/academia-local" className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-xl">Ir para Academia Local</Link>
          </div>
        )}
      </main>
    </div>
  );
}