// app/indicar-estabelecimento/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function IndicarEstabelecimentoPage() {
  const { user } = useApp();
  const router = useRouter();
  const [tipo, setTipo] = useState<'comercio' | 'servico'>('comercio');
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    contato: ''
  });
  const [loading, setLoading] = useState(false);
  const [enviados, setEnviados] = useState<any[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from('indicacoes_estabelecimentos')
      .insert({
        usuario_id: user?.id,
        nome_estabelecimento: formData.nome,
        tipo,
        telefone: formData.telefone,
        endereco: formData.endereco,
        itens_necessarios: tipo === 'comercio' ? 10 : 5
      })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao salvar indicação');
    } else {
      toast.success('Indicação enviada! Vamos contatar o estabelecimento.');
      setEnviados([data, ...enviados]);
      setFormData({ nome: '', telefone: '', endereco: '', contato: '' });
    }
    setLoading(false);
  }

  const meta = tipo === 'comercio' ? 2 : 4;
  const progresso = enviados.filter(e => e.status === 'aprovado').length;
  const totalGanho = progresso * 10;

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white text-xl">←</button>
          <h1 className="text-white font-bold text-lg">💰 Indicar e Ganhar</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Banner de metas */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">R$ {totalGanho}</p>
          <p className="text-sm text-white/80">Ganhos até agora</p>
          <div className="mt-2 bg-white/20 rounded-full h-2">
            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(progresso / meta) * 100}%` }} />
          </div>
          <p className="text-xs text-white/80 mt-1">{progresso} de {meta} {tipo === 'comercio' ? 'estabelecimentos' : 'serviços'} aprovados</p>
        </div>

        {/* Seletor de tipo */}
        <div className="flex gap-3">
          <button
            onClick={() => setTipo('comercio')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${tipo === 'comercio' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            🏪 Estabelecimento
          </button>
          <button
            onClick={() => setTipo('servico')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${tipo === 'servico' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            🔧 Serviço
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm mb-1">Nome do {tipo === 'comercio' ? 'Estabelecimento' : 'Serviço/Prestador'}</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-gray-800 rounded-xl p-3 text-white border border-gray-700 focus:border-green-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Telefone/WhatsApp</label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="w-full bg-gray-800 rounded-xl p-3 text-white border border-gray-700 focus:border-green-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Endereço (opcional)</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              className="w-full bg-gray-800 rounded-xl p-3 text-white border border-gray-700 focus:border-green-500 outline-none"
            />
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-yellow-400 text-sm mb-2">🎯 Requisitos para você ganhar:</p>
            <ul className="text-gray-400 text-xs space-y-1">
              {tipo === 'comercio' ? (
                <>
                  <li>✓ O estabelecimento precisa cadastrar 10 produtos</li>
                  <li>✓ Cada produto com preço, estoque e foto</li>
                  <li>✓ Não pode estar cadastrado no app ainda</li>
                </>
              ) : (
                <>
                  <li>✓ O prestador precisa cadastrar 5 serviços</li>
                  <li>✓ Cada serviço com preço e foto</li>
                  <li>✓ Não pode estar cadastrado no app ainda</li>
                </>
              )}
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'Enviando...' : '📤 Enviar Indicação'}
          </button>
        </form>

        {/* Lista de indicações enviadas */}
        {enviados.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3">📋 Suas indicações</h3>
            <div className="space-y-2">
              {enviados.map((ind) => (
                <div key={ind.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm">{ind.nome_estabelecimento}</p>
                    <p className="text-gray-500 text-xs">{ind.status === 'pendente' ? '⏳ Aguardando' : ind.status === 'aprovado' ? '✅ Aprovado' : '❌ Rejeitado'}</p>
                  </div>
                  {ind.status === 'aprovado' && <span className="text-green-400 text-sm font-bold">+ R$10</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}