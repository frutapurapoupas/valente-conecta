"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { 
  Users, Store, Briefcase, Target, Trophy, 
  Gift, CheckCircle, XCircle, Clock, TrendingUp,
  ChevronRight, UserPlus, Store as StoreIcon, Wrench
} from "lucide-react";

interface IndicacaoUsuario {
  id: string;
  nome: string;
  whatsapp: string;
  status: "pendente" | "ativo" | "invalido";
  dataCadastro: string;
}

interface IndicacaoEstabelecimento {
  id: string;
  nome: string;
  tipo: "comercio" | "servico";
  telefone: string;
  status: "pendente" | "aprovado" | "rejeitado" | "pago";
  itensCadastrados: number;
  itensNecessarios: number;
  created_at: string;
}

interface BonusBloqueado {
  tipo: "usuarios" | "estabelecimentos" | "servicos";
  meta: number;
  atual: number;
  valor: number;
  bloqueado: boolean;
}

export default function IndicacoesPage() {
  const router = useRouter();
  const { user } = useApp();
  const [loading, setLoading] = useState(true);
  const [indicados, setIndicados] = useState<IndicacaoUsuario[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<IndicacaoEstabelecimento[]>([]);
  const [servicos, setServicos] = useState<IndicacaoEstabelecimento[]>([]);
  const [bonus, setBonus] = useState({
    usuarios: { meta: 50, atual: 0, valor: 10, liberado: false },
    estabelecimentos: { meta: 2, atual: 0, valor: 30, liberado: false, itensPorEstabelecimento: 30 },
    servicos: { meta: 4, atual: 0, valor: 15, liberado: false, itensPorServico: 3 }
  });
  const [saldoTotal, setSaldoTotal] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    carregarDados();
  }, [user]);

  const carregarDados = async () => {
    setLoading(true);
    
    // Buscar usuários indicados (que se cadastraram com o código)
    const { data: indicadosData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('convidado_por_id', user?.id);
    
    if (indicadosData) {
      const indicadosFormatados = indicadosData.map(u => ({
        id: u.id,
        nome: u.nome,
        whatsapp: u.whatsapp,
        status: u.trial_end_at > new Date().toISOString() ? "ativo" : "pendente",
        dataCadastro: u.created_at
      }));
      setIndicados(indicadosFormatados);
      
      // Contar apenas usuários ativos (que ainda estão no período de teste)
      const ativos = indicadosFormatados.filter(i => i.status === "ativo").length;
      setBonus(prev => ({
        ...prev,
        usuarios: { ...prev.usuarios, atual: ativos }
      }));
    }

    // Buscar estabelecimentos indicados
    const { data: estabelecimentosData } = await supabase
      .from('indicacoes_estabelecimentos')
      .select('*')
      .eq('usuario_id', user?.id)
      .eq('tipo', 'comercio');
    
    if (estabelecimentosData) {
      setEstabelecimentos(estabelecimentosData);
      const aprovados = estabelecimentosData.filter(e => e.status === "aprovado").length;
      setBonus(prev => ({
        ...prev,
        estabelecimentos: { ...prev.estabelecimentos, atual: aprovados }
      }));
    }

    // Buscar serviços indicados
    const { data: servicosData } = await supabase
      .from('indicacoes_estabelecimentos')
      .select('*')
      .eq('usuario_id', user?.id)
      .eq('tipo', 'servico');
    
    if (servicosData) {
      setServicos(servicosData);
      const aprovados = servicosData.filter(s => s.status === "aprovado").length;
      setBonus(prev => ({
        ...prev,
        servicos: { ...prev.servicos, atual: aprovados }
      }));
    }

    // Calcular saldo total disponível
    let total = 0;
    if (bonus.usuarios.atual >= bonus.usuarios.meta) total += bonus.usuarios.valor;
    if (bonus.estabelecimentos.atual >= bonus.estabelecimentos.meta) total += bonus.estabelecimentos.valor;
    if (bonus.servicos.atual >= bonus.servicos.meta) total += bonus.servicos.valor;
    setSaldoTotal(total);
    
    setLoading(false);
  };

  const faltamUsuarios = bonus.usuarios.meta - bonus.usuarios.atual;
  const faltamEstabelecimentos = bonus.estabelecimentos.meta - bonus.estabelecimentos.atual;
  const faltamServicos = bonus.servicos.meta - bonus.servicos.atual;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pb-28">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-white font-bold text-lg">💰 Indicações e Ganhos</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Saldo Total */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-center">
          <Trophy className="w-12 h-12 text-white mx-auto mb-3" />
          <p className="text-white/80 text-sm">Saldo disponível para saque</p>
          <p className="text-4xl font-bold text-white">R$ {saldoTotal},00</p>
          <button 
            onClick={() => toast.success("Em breve você poderá sacar via PIX!")}
            className="mt-3 bg-white text-orange-600 px-6 py-2 rounded-xl font-bold text-sm"
          >
            Solicitar Saque
          </button>
        </div>

        {/* Cards de Metas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Meta Usuários */}
          <div className="bg-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-blue-400" />
              <h3 className="text-white font-bold">Indicar Usuários</h3>
            </div>
            <div className="text-center mb-3">
              <p className="text-3xl font-bold text-white">{bonus.usuarios.atual}</p>
              <p className="text-gray-400 text-sm">de {bonus.usuarios.meta} usuários</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(bonus.usuarios.atual / bonus.usuarios.meta) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-bold">R$ {bonus.usuarios.valor},00</span>
              {bonus.usuarios.atual >= bonus.usuarios.meta ? (
                <span className="text-green-400 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Liberado</span>
              ) : (
                <span className="text-gray-400 text-sm flex items-center gap-1"><Clock className="w-4 h-4" /> Faltam {faltamUsuarios}</span>
              )}
            </div>
          </div>

          {/* Meta Estabelecimentos */}
          <div className="bg-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Store className="w-6 h-6 text-purple-400" />
              <h3 className="text-white font-bold">Indicar Estabelecimentos</h3>
            </div>
            <div className="text-center mb-3">
              <p className="text-3xl font-bold text-white">{bonus.estabelecimentos.atual}</p>
              <p className="text-gray-400 text-sm">de {bonus.estabelecimentos.meta} lojas</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${(bonus.estabelecimentos.atual / bonus.estabelecimentos.meta) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-bold">R$ {bonus.estabelecimentos.valor},00</span>
              {bonus.estabelecimentos.atual >= bonus.estabelecimentos.meta ? (
                <span className="text-green-400 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Liberado</span>
              ) : (
                <span className="text-gray-400 text-sm flex items-center gap-1"><Clock className="w-4 h-4" /> Faltam {faltamEstabelecimentos}</span>
              )}
            </div>
          </div>

          {/* Meta Serviços */}
          <div className="bg-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Briefcase className="w-6 h-6 text-green-400" />
              <h3 className="text-white font-bold">Indicar Profissionais</h3>
            </div>
            <div className="text-center mb-3">
              <p className="text-3xl font-bold text-white">{bonus.servicos.atual}</p>
              <p className="text-gray-400 text-sm">de {bonus.servicos.meta} profissionais</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(bonus.servicos.atual / bonus.servicos.meta) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-bold">R$ {bonus.servicos.valor},00</span>
              {bonus.servicos.atual >= bonus.servicos.meta ? (
                <span className="text-green-400 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Liberado</span>
              ) : (
                <span className="text-gray-400 text-sm flex items-center gap-1"><Clock className="w-4 h-4" /> Faltam {faltamServicos}</span>
              )}
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-gray-800/50 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-400" />
            Como funciona?
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>📱 <strong>Indique 50 usuários REAIS</strong> (que nunca instalaram o app) - Ganhe R$10</p>
            <p>🏪 <strong>Indique 2 estabelecimentos</strong> que cadastrem 30 itens cada no catálogo - Ganhe R$30</p>
            <p>🔧 <strong>Indique 4 profissionais</strong> que publiquem 3 serviços com foto - Ganhe R$15</p>
            <p className="text-yellow-400 text-xs mt-2">⚠️ Cada usuário/estabelecimento só conta uma vez. Não é permitido auto-indicação.</p>
          </div>
        </div>

        {/* Lista de Indicados */}
        <div className="space-y-6">
          {/* Usuários Indicados */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden">
            <div className="bg-gray-700/50 px-5 py-3 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-400" /> Usuários Indicados</h3>
              <span className="text-gray-400 text-sm">{indicados.filter(i => i.status === "ativo").length}/{indicados.length}</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {indicados.length === 0 ? (
                <p className="text-gray-500 text-center py-6">Nenhum usuário indicado ainda</p>
              ) : (
                indicados.map(i => (
                  <div key={i.id} className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{i.nome}</p>
                      <p className="text-gray-400 text-xs">{i.whatsapp}</p>
                    </div>
                    <div>
                      {i.status === "ativo" ? (
                        <span className="text-green-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Válido</span>
                      ) : i.status === "pendente" ? (
                        <span className="text-yellow-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>
                      ) : (
                        <span className="text-red-400 text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> Inválido</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Estabelecimentos Indicados */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden">
            <div className="bg-gray-700/50 px-5 py-3 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2"><StoreIcon className="w-5 h-5 text-purple-400" /> Estabelecimentos Indicados</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {estabelecimentos.length === 0 ? (
                <p className="text-gray-500 text-center py-6">Nenhum estabelecimento indicado</p>
              ) : (
                estabelecimentos.map(e => (
                  <div key={e.id} className="p-4 border-b border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{e.nome}</p>
                        <p className="text-gray-400 text-xs">{e.telefone}</p>
                        <p className="text-gray-500 text-xs mt-1">Itens: {e.itensCadastrados}/{e.itensNecessarios}</p>
                      </div>
                      <div>
                        {e.status === "aprovado" ? (
                          <span className="text-green-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aprovado</span>
                        ) : e.status === "pendente" ? (
                          <span className="text-yellow-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Aguardando</span>
                        ) : e.status === "pago" ? (
                          <span className="text-blue-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Pago</span>
                        ) : (
                          <span className="text-red-400 text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeitado</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Serviços Indicados */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden">
            <div className="bg-gray-700/50 px-5 py-3 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2"><Wrench className="w-5 h-5 text-green-400" /> Profissionais Indicados</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {servicos.length === 0 ? (
                <p className="text-gray-500 text-center py-6">Nenhum profissional indicado</p>
              ) : (
                servicos.map(s => (
                  <div key={s.id} className="p-4 border-b border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{s.nome}</p>
                        <p className="text-gray-400 text-xs">{s.telefone}</p>
                        <p className="text-gray-500 text-xs mt-1">Serviços: {s.itensCadastrados}/{s.itensNecessarios}</p>
                      </div>
                      <div>
                        {s.status === "aprovado" ? (
                          <span className="text-green-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aprovado</span>
                        ) : s.status === "pendente" ? (
                          <span className="text-yellow-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Aguardando</span>
                        ) : s.status === "pago" ? (
                          <span className="text-blue-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Pago</span>
                        ) : (
                          <span className="text-red-400 text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeitado</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => router.push("/qr-code")}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            📱 Compartilhar Link de Indicação
          </button>
          <button 
            onClick={() => router.push("/indicar-estabelecimento")}
            className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            🏪 Indicar Estabelecimento
          </button>
        </div>
      </main>
    </div>
  );
}