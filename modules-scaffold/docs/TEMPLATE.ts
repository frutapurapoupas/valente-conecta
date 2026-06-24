/**
 * TEMPLATE: Como implementar um novo módulo
 * 
 * Este arquivo contém exemplos de código para criar um módulo novo
 * (substitua "MEUMODULO" pelo nome real: saude, transporte, etc.)
 */

// ============================================================================
// 1. TIPOS ESPECÍFICOS DO MÓDULO (em types/MEUMODULO.ts)
// ============================================================================

import { Item, Demand, Schedule, QueueEntry } from '@/modules-scaffold/types/modules';

export interface ItemSaude extends Item {
  metadadosModulo?: {
    especialidade?: string;
    tipoAtendimento?: 'consulta' | 'exame' | 'internacao';
    tempoEsperado?: number; // minutos
  };
}

export interface ScheduleSaude extends Schedule {
  tipoConsulta?: string;
  notas?: string;
  receitaMedicamentos?: string[];
}

// ============================================================================
// 2. PÁGINA PÚBLICA (app/MEUMODULO/public/page.tsx)
// ============================================================================

/*
"use client";
import { useEffect, useState } from 'react';
import { CatalogStorage, DemandService } from '@/modules-scaffold/services/shared/storageServices';
import { Item } from '@/modules-scaffold/types/modules';
import ItemCard from '@/modules-scaffold/components/shared/ItemCard';
import DemandModal from '@/modules-scaffold/components/shared/DemandModal';

export default function MeuModuloPublic() {
  const [items, setItems] = useState<Item[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const categoria = 'meumodulo'; // ex: 'saude', 'transporte'
    setItems(CatalogStorage.getAll(categoria));
    
    const handleUpdate = () => setItems(CatalogStorage.getAll(categoria));
    window.addEventListener('catalogo_itens_updated', handleUpdate);
    
    return () => window.removeEventListener('catalogo_itens_updated', handleUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Meu Módulo</h1>
      
      <div className="space-y-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      <button onClick={() => setModalOpen(true)} className="mt-6 px-6 py-3 bg-emerald-400 text-black rounded-full font-bold">
        Fazer Solicitação
      </button>

      <DemandModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categoria="meumodulo"
        onSubmit={(demand) => {
          DemandService.add({
            id: Date.now().toString(),
            ...demand,
            status: 'pendente',
            createdAt: new Date().toISOString(),
          });
        }}
      />
    </div>
  );
}
*/

// ============================================================================
// 3. PÁGINA DE FORNECEDOR (app/MEUMODULO/supplier/catalog/page.tsx)
// ============================================================================

/*
"use client";
import { useEffect, useState } from 'react';
import { CatalogStorage, UserService } from '@/modules-scaffold/services/shared/storageServices';
import { Item } from '@/modules-scaffold/types/modules';
import EditorForm from '@/modules-scaffold/components/shared/EditorForm';
import AdminTable from '@/modules-scaffold/components/shared/AdminTable';
import toast from 'react-hot-toast';

export default function MeuModuloSupplier() {
  const [items, setItems] = useState<Item[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Item>>({ categoria: 'meumodulo' });

  useEffect(() => {
    const user = UserService.get();
    if (!user) return;
    
    const userItems = CatalogStorage.getAll('meumodulo').filter(
      (i) => i.fornecedorId === user.id
    );
    setItems(userItems);
  }, []);

  const handleSave = () => {
    if (!form.nome || !form.descricao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const item: Item = {
      id: editId || Date.now().toString(),
      nome: form.nome,
      descricao: form.descricao,
      categoria: 'meumodulo',
      preco: form.preco || 0,
      status: 'publicado',
      createdAt: editId ? items.find((i) => i.id === editId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editId) {
      CatalogStorage.update(editId, item);
      toast.success('Item atualizado!');
    } else {
      CatalogStorage.add(item);
      toast.success('Item publicado!');
    }

    setForm({ categoria: 'meumodulo' });
    setEditId(null);
    setItems(CatalogStorage.getAll('meumodulo'));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <h1 className="text-2xl font-bold text-white">Gerenciar Meu Catálogo</h1>

      <EditorForm
        item={form}
        onChange={(patch) => setForm({ ...form, ...patch })}
        onSave={handleSave}
      />

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Meus Itens</h2>
        <AdminTable
          items={items}
          onEdit={(item) => {
            setEditId(item.id);
            setForm(item);
          }}
          onDelete={(id) => {
            CatalogStorage.remove(id);
            setItems(CatalogStorage.getAll('meumodulo'));
            toast.success('Item removido');
          }}
          onToggle={(item) => {
            const nextStatus = item.status === 'publicado' ? 'pendente' : 'publicado';
            CatalogStorage.update(item.id, { status: nextStatus });
            setItems(CatalogStorage.getAll('meumodulo'));
          }}
        />
      </div>
    </div>
  );
}
*/

// ============================================================================
// 4. PÁGINA ADMIN MASTER (app/admin-master/MEUMODULO/page.tsx)
// ============================================================================

/*
"use client";
import { useEffect, useState } from 'react';
import { CatalogStorage, DemandService } from '@/modules-scaffold/services/shared/storageServices';
import { Item, Demand } from '@/modules-scaffold/types/modules';
import AdminTable from '@/modules-scaffold/components/shared/AdminTable';
import toast from 'react-hot-toast';

export default function MeuModuloAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [tab, setTab] = useState<'items' | 'demands'>('items');

  useEffect(() => {
    setItems(CatalogStorage.getAll('meumodulo'));
    setDemands(DemandService.getAll('meumodulo'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Admin - Meu Módulo</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab('items')}
          className={`px-4 py-2 rounded-lg ${tab === 'items' ? 'bg-emerald-400 text-black' : 'bg-white/10 text-white'}`}
        >
          Itens
        </button>
        <button
          onClick={() => setTab('demands')}
          className={`px-4 py-2 rounded-lg ${tab === 'demands' ? 'bg-emerald-400 text-black' : 'bg-white/10 text-white'}`}
        >
          Demandas
        </button>
      </div>

      {tab === 'items' && (
        <AdminTable
          items={items}
          onEdit={(item) => console.log('Editar:', item)}
          onDelete={(id) => {
            CatalogStorage.remove(id);
            setItems(CatalogStorage.getAll('meumodulo'));
            toast.success('Item removido');
          }}
          onToggle={(item) => {
            const nextStatus = item.status === 'publicado' ? 'pendente' : 'publicado';
            CatalogStorage.update(item.id, { status: nextStatus });
            setItems(CatalogStorage.getAll('meumodulo'));
          }}
        />
      )}

      {tab === 'demands' && (
        <div className="space-y-3">
          {demands.map((demand) => (
            <div key={demand.id} className="p-4 rounded-lg bg-slate-900 border border-white/10">
              <p className="text-white font-bold">{demand.nomeCliente}</p>
              <p className="text-gray-300 text-sm">{demand.descricao}</p>
              <p className="text-gray-500 text-xs mt-2">{demand.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
*/

// ============================================================================
// 5. HOOK CUSTOMIZADO (hooks/useMeuModulo.ts)
// ============================================================================

/*
import { useEffect, useState } from 'react';
import { CatalogStorage, DemandService } from '@/modules-scaffold/services/shared/storageServices';
import { Item, Demand } from '@/modules-scaffold/types/modules';

export const useMeuModulo = (categoria: string = 'meumodulo') => {
  const [items, setItems] = useState<Item[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setItems(CatalogStorage.getAll(categoria));
    setDemands(DemandService.getAll(categoria));
    setLoading(false);

    const handleUpdate = () => {
      setItems(CatalogStorage.getAll(categoria));
      setDemands(DemandService.getAll(categoria));
    };

    window.addEventListener('catalogo_itens_updated', handleUpdate);
    window.addEventListener('demandas_updated', handleUpdate);

    return () => {
      window.removeEventListener('catalogo_itens_updated', handleUpdate);
      window.removeEventListener('demandas_updated', handleUpdate);
    };
  }, [categoria]);

  return { items, demands, loading };
};
*/

// ============================================================================
// 6. COMPONENTE CUSTOMIZADO (components/MEUMODULO/ItemCard.tsx)
// ============================================================================

/*
"use client";
import { ItemSaude } from '@/modules-scaffold/types/MEUMODULO';

export default function ItemSaudeCard({ item }: { item: ItemSaude }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-white/10">
      <h3 className="text-white font-bold">{item.nome}</h3>
      <p className="text-gray-300 text-sm">{item.metadadosModulo?.especialidade}</p>
      <p className="text-emerald-300 mt-2 font-bold">R$ {item.preco?.toFixed(2)}</p>
    </div>
  );
}
*/

export default function Template() {
  return null;
}
