"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CatalogStorage, DemandService, UserService } from '@/modules-scaffold/services/shared/storageServices';
import { Item, Demand } from '@/modules-scaffold/types/modules';
import AdminTable from '@/modules-scaffold/components/shared/AdminTable';
import toast from 'react-hot-toast';

const CATEGORIA = 'cozinha-chef-neide';

export default function CozinhaChefNeydeAdmin() {
  const router = useRouter();
  const [pratos, setPratos] = useState<Item[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [tab, setTab] = useState<'pratos' | 'pedidos'>('pratos');

  useEffect(() => {
    // Verificar se é admin
    const user = UserService.get();
    if (!user || user.role !== 'admin') {
      toast.error('Acesso restrito a administradores');
      router.push('/');
      return;
    }

    const load = () => {
      setPratos(CatalogStorage.getAll(CATEGORIA));
      setDemands(DemandService.getAll(CATEGORIA));
    };

    load();
    window.addEventListener('catalogo_itens_updated', load);
    window.addEventListener('demandas_updated', load);

    return () => {
      window.removeEventListener('catalogo_itens_updated', load);
      window.removeEventListener('demandas_updated', load);
    };
  }, [router]);

  const metrics = {
    total: pratos.length,
    publicados: pratos.filter((p) => p.status === 'publicado').length,
    pedidosPendentes: demands.filter((d) => d.status === 'pendente').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">👨‍⚖️ Admin Master - Cozinha Chef Neide</h1>
          <p className="text-gray-400 mt-2">Gestão centralizada de pratos e pedidos</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
            <p className="text-sm text-cyan-300">Total de Pratos</p>
            <p className="text-3xl font-bold text-cyan-400">{metrics.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-sm text-emerald-300">Publicados</p>
            <p className="text-3xl font-bold text-emerald-400">{metrics.publicados}</p>
          </div>
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30">
            <p className="text-sm text-orange-300">Pedidos Pendentes</p>
            <p className="text-3xl font-bold text-orange-400">{metrics.pedidosPendentes}</p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setTab('pratos')}
            className={`px-6 py-3 font-bold border-b-2 transition ${
              tab === 'pratos'
                ? 'text-emerald-400 border-emerald-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            📋 Pratos
          </button>
          <button
            onClick={() => setTab('pedidos')}
            className={`px-6 py-3 font-bold border-b-2 transition ${
              tab === 'pedidos'
                ? 'text-orange-400 border-orange-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            🛒 Pedidos ({demands.length})
          </button>
        </div>

        {/* Conteúdo */}
        {tab === 'pratos' && (
          <div>
            <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm">
              💡 Dica: Clique em "Gerenciar Catálogo" na página inicial para publicar/editar pratos
            </div>
            <AdminTable
              items={pratos}
              onEdit={(item) => console.log('Editar:', item)}
              onDelete={(id) => {
                CatalogStorage.remove(id);
                toast.success('Prato removido');
              }}
              onToggle={(item) => {
                const next = item.status === 'publicado' ? 'pendente' : 'publicado';
                CatalogStorage.update(item.id, { status: next });
              }}
            />
          </div>
        )}

        {tab === 'pedidos' && (
          <div className="space-y-3">
            {demands.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-slate-900 border border-white/10">
                <p className="text-gray-400">Nenhum pedido no momento</p>
              </div>
            ) : (
              demands.map((demand) => (
                <div
                  key={demand.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-white/10 hover:border-orange-500/30 transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">{demand.nomeCliente}</p>
                      <p className="text-gray-300 text-sm mt-1">{demand.descricao}</p>
                      {demand.contato && (
                        <p className="text-cyan-300 text-sm mt-2">📞 {demand.contato}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <select
                        value={demand.status || 'pendente'}
                        onChange={(e) => {
                          DemandService.update(demand.id, {
                            status: e.target.value as any,
                          });
                          toast.success('Status atualizado');
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border-0 cursor-pointer ${
                          demand.status === 'pendente'
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        <option value="pendente">⏳ Pendente</option>
                        <option value="em_andamento">🍳 Em Andamento</option>
                        <option value="resolvido">✅ Pronto</option>
                        <option value="cancelado">❌ Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
