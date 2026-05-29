// app/admin/configuracoes-recompensas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminRecompensasPage() {
  const { isAdmin } = useApp();
  const router = useRouter();
  const [config, setConfig] = useState({
    recompensa_estabelecimento: '10.00',
    recompensa_servico: '10.00',
    meta_usuarios_indicados: '50',
    popup_diario_frequencia: '2'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) router.push('/login');
    carregarConfig();
  }, [isAdmin]);

  async function carregarConfig() {
    const { data } = await supabase.from('admin_configuracoes').select('*');
    if (data) {
      const newConfig = { ...config };
      data.forEach((c: any) => {
        if (newConfig.hasOwnProperty(c.chave)) {
          newConfig[c.chave as keyof typeof config] = c.valor;
        }
      });
      setConfig(newConfig);
    }
  }

  async function salvarConfig() {
    setLoading(true);
    for (const [chave, valor] of Object.entries(config)) {
      await supabase
        .from('admin_configuracoes')
        .upsert({ chave, valor, updated_at: new Date().toISOString() });
    }
    toast.success('Configurações salvas!');
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin')} className="text-white text-xl">←</button>
          <h1 className="text-white font-bold text-xl">💰 Configurar Recompensas</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">Valores de Recompensa</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Valor por Estabelecimento (R$)</label>
              <input
                type="number"
                step="0.01"
                value={config.recompensa_estabelecimento}
                onChange={(e) => setConfig({ ...config, recompensa_estabelecimento: e.target.value })}
                className="w-full bg-gray-700 rounded-xl p-3 text-white"
              />
              <p className="text-gray-500 text-xs mt-1">Pago quando indicar 2 estabelecimentos com 10 produtos cada</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Valor por Serviço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={config.recompensa_servico}
                onChange={(e) => setConfig({ ...config, recompensa_servico: e.target.value })}
                className="w-full bg-gray-700 rounded-xl p-3 text-white"
              />
              <p className="text-gray-500 text-xs mt-1">Pago quando indicar 4 serviços com 5 itens cada</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Meta de Usuários Indicados</label>
              <input
                type="number"
                value={config.meta_usuarios_indicados}
                onChange={(e) => setConfig({ ...config, meta_usuarios_indicados: e.target.value })}
                className="w-full bg-gray-700 rounded-xl p-3 text-white"
              />
              <p className="text-gray-500 text-xs mt-1">Quantos usuários indicar para ganhar 30 dias grátis</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Popup Diário (vezes por dia)</label>
              <input
                type="number"
                value={config.popup_diario_frequencia}
                onChange={(e) => setConfig({ ...config, popup_diario_frequencia: e.target.value })}
                className="w-full bg-gray-700 rounded-xl p-3 text-white"
              />
              <p className="text-gray-500 text-xs mt-1">Quantas vezes por dia mostrar o popup de indicação</p>
            </div>
          </div>

          <button
            onClick={salvarConfig}
            disabled={loading}
            className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold mt-6"
          >
            {loading ? 'Salvando...' : '💾 Salvar Configurações'}
          </button>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">📊 Resumo do Sistema</h2>
          <div className="space-y-2 text-gray-400 text-sm">
            <p>• Usuários com teste expirado veem popup para indicar {config.meta_usuarios_indicados} amigos</p>
            <p>• Ao atingir a meta, ganham 30 dias grátis automaticamente</p>
            <p>• Durante os 30 dias, recebem {config.popup_diario_frequencia} popups por dia</p>
            <p>• Cada popup incentiva indicar estabelecimentos ou serviços</p>
            <p>• Aprovação paga R$ {config.recompensa_estabelecimento} por estabelecimento ou R$ {config.recompensa_servico} por serviço</p>
          </div>
        </div>
      </main>
    </div>
  );
}