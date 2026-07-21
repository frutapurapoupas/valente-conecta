// app/admin-master/cozinha-chef/preview/page.tsx
// ðŸŽ¨ UI PURA - Preview CardÃ¡pio

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Eye, Utensils, Clock, RefreshCw, ArrowLeft,
  ExternalLink, Calendar
} from 'lucide-react';
import { usePratos } // from '@/hooks/cozinha/useCompras';
import { formatarMoeda } from '@/utils/financeiroUtils';

export default function PreviewPage() {
  const { pratos, loading, carregar } = usePratos();
  const [diaSelecionado, setDiaSelecionado] = useState<string>('todos');

  useEffect(() => {
    carregar();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando cardÃ¡pio...</p>
        </div>
      </div>
    );
  }

  const diasSemana = ['Segunda', 'TerÃ§a', 'Quarta', 'Quinta', 'Sexta', 'SÃ¡bado'];
  const pratosFiltrados = diaSelecionado === 'todos' 
    ? pratos 
    : pratos.filter(p => p.dia_semana === diaSelecionado);

  const pratosAtivos = pratosFiltrados.filter(p => p.ativo);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* CabeÃ§alho */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/admin-master/cozinha-chef" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft size={16} /> Voltar
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
              <Eye className="text-green-400" /> Preview CardÃ¡pio
            </h1>
            <p className="text-sm text-gray-400">{pratosAtivos.length} pratos disponÃ­veis</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm transition">
              <ExternalLink size={16} /> Ver PÃºblico
            </button>
            <button onClick={carregar} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm transition">
              <RefreshCw size={16} /> Atualizar
            </button>
          </div>
        </div>

        {/* Filtro por Dia */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setDiaSelecionado('todos')} className={`px-3 py-1 rounded-lg text-sm transition ${diaSelecionado === 'todos' ? 'bg-green-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600 text-gray-400'}`}>Todos</button>
          {diasSemana.map(dia => (
            <button key={dia} onClick={() => setDiaSelecionado(dia)} className={`px-3 py-1 rounded-lg text-sm transition ${diaSelecionado === dia ? 'bg-green-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600 text-gray-400'}`}>{dia}</button>
          ))}
        </div>

        {/* Preview */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Utensils className="text-green-400" /> CardÃ¡pio {diaSelecionado !== 'todos' ? `- ${diaSelecionado}` : 'da Semana'}
            </h2>
            <span className="text-xs text-gray-500">Atualizado em {new Date().toLocaleDateString('pt-BR')}</span>
          </div>

          <div className="space-y-6">
            {pratosAtivos.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Utensils size={48} className="mx-auto opacity-30 mb-3" />
                <p>Nenhum prato disponÃ­vel para este dia</p>
              </div>
            ) : (
              diasSemana.map(dia => {
                const pratosDoDia = pratosAtivos.filter(p => p.dia_semana === dia);
                if (pratosDoDia.length === 0 || (diaSelecionado !== 'todos' && diaSelecionado !== dia)) return null;
                return (
                  <div key={dia}>
                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <Calendar size={14} /> {dia}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pratosDoDia.map((prato) => (
                        <div key={prato.id} className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-green-500/30 transition">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{prato.nome}</h4>
                              <p className="text-sm text-gray-400">{prato.descricao}</p>
                            </div>
                            <span className="text-lg font-bold text-green-400">{formatarMoeda(prato.preco)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-4 bg-gray-800/20 rounded-lg border border-gray-700 text-xs text-gray-500">
          <p>ðŸ’¡ Este Ã© o cardÃ¡pio que os clientes veem. Para alterar, vÃ¡ em "Gerenciar Pratos".</p>
          <p className="mt-1">ðŸ“± Os clientes acessam em: /cozinha</p>
        </div>
      </div>
    </div>
  );
}


