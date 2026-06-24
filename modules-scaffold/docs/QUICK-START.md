# Guia Prático: Implementar Novo Módulo em 30 Minutos

Este guia lhe ajuda a criar um novo módulo (ex: Saúde, Transporte, Mercado, etc.) usando o scaffold compartilhado.

## Checklist de Implementação

### Fase 1: Estrutura Base (5 min)

- [ ] Criar pasta: `mkdir -p app/seu-modulo/public`
- [ ] Criar pasta: `mkdir -p app/seu-modulo/supplier`
- [ ] Criar pasta: `mkdir -p app/seu-modulo/supplier/catalog`
- [ ] Criar pasta: `mkdir -p app/admin-master/seu-modulo`

### Fase 2: Página Pública (8 min)

Criar `app/seu-modulo/public/page.tsx`:

```tsx
"use client";
import { useEffect, useState } from 'react';
import { CatalogStorage, DemandService } from '@/modules-scaffold/services/shared/storageServices';
import { Item, Demand } from '@/modules-scaffold/types/modules';
import ListView from '@/modules-scaffold/components/shared/ListView';
import DemandModal from '@/modules-scaffold/components/shared/DemandModal';
import toast from 'react-hot-toast';

const CATEGORIA = 'seu-modulo'; // Substituir com nome real

export default function SeuModuloPublic() {
  const [items, setItems] = useState<Item[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadItems = () => setItems(CatalogStorage.getAll(CATEGORIA));
    loadItems();
    window.addEventListener('catalogo_itens_updated', loadItems);
    return () => window.removeEventListener('catalogo_itens_updated', loadItems);
  }, []);

  const handleNewDemand = (demand: Partial<Demand>) => {
    DemandService.add({
      id: Date.now().toString(),
      ...demand,
      status: 'pendente',
      createdAt: new Date().toISOString(),
    } as Demand);
    toast.success('Solicitação enviada com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Seu Módulo</h1>
        
        <ListView items={items} />
        
        <div className="mt-8 text-center">
          <button
            onClick={() => setModalOpen(true)}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-bold"
          >
            Fazer Solicitação
          </button>
        </div>

        <DemandModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          categoria={CATEGORIA}
          onSubmit={handleNewDemand}
        />
      </div>
    </div>
  );
}
```

### Fase 3: Página de Fornecedor (10 min)

Criar `app/seu-modulo/supplier/catalog/page.tsx`:

```tsx
"use client";
import { useEffect, useState } from 'react';
import { CatalogStorage, UserService } from '@/modules-scaffold/services/shared/storageServices';
import { Item } from '@/modules-scaffold/types/modules';
import EditorForm from '@/modules-scaffold/components/shared/EditorForm';
import AdminTable from '@/modules-scaffold/components/shared/AdminTable';
import toast from 'react-hot-toast';

const CATEGORIA = 'seu-modulo';

export default function SeuModuloSupplier() {
  const [items, setItems] = useState<Item[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Item>>({ categoria: CATEGORIA });

  useEffect(() => {
    const user = UserService.get();
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    const loadItems = () => {
      const all = CatalogStorage.getAll(CATEGORIA);
      setItems(all.filter((i) => i.fornecedorId === user.id));
    };

    loadItems();
    window.addEventListener('catalogo_itens_updated', loadItems);
    return () => window.removeEventListener('catalogo_itens_updated', loadItems);
  }, []);

  const handleSave = () => {
    if (!form.nome || !form.descricao) {
      toast.error('Preencha nome e descrição');
      return;
    }

    const user = UserService.get();
    if (!user) return;

    const item: Item = {
      id: editId || Date.now().toString(),
      nome: form.nome,
      descricao: form.descricao,
      categoria: CATEGORIA,
      preco: form.preco || 0,
      telefone: form.telefone,
      status: 'publicado',
      fornecedorId: user.id,
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

    setForm({ categoria: CATEGORIA });
    setEditId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Meu Catálogo</h1>

        <EditorForm
          item={form}
          onChange={(patch) => setForm({ ...form, ...patch })}
          onSave={handleSave}
          onCancel={() => { setForm({ categoria: CATEGORIA }); setEditId(null); }}
          title={editId ? 'Editar Item' : 'Novo Item'}
        />

        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Meus Itens ({items.length})</h2>
          <AdminTable
            items={items}
            onEdit={(item) => { setEditId(item.id); setForm(item); }}
            onDelete={(id) => {
              CatalogStorage.remove(id);
              toast.success('Item removido');
            }}
            onToggle={(item) => {
              const next = item.status === 'publicado' ? 'pendente' : 'publicado';
              CatalogStorage.update(item.id, { status: next });
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

### Fase 4: Página Admin Master (7 min)

Criar `app/admin-master/seu-modulo/page.tsx`:

```tsx
"use client";
import { useEffect, useState } from 'react';
import { CatalogStorage, DemandService } from '@/modules-scaffold/services/shared/storageServices';
import { Item, Demand } from '@/modules-scaffold/types/modules';
import AdminTable from '@/modules-scaffold/components/shared/AdminTable';

const CATEGORIA = 'seu-modulo';

export default function SeuModuloAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [tab, setTab] = useState<'items' | 'demands'>('items');

  useEffect(() => {
    const load = () => {
      setItems(CatalogStorage.getAll(CATEGORIA));
      setDemands(DemandService.getAll(CATEGORIA));
    };
    load();
    window.addEventListener('catalogo_itens_updated', load);
    window.addEventListener('demandas_updated', load);
    return () => {
      window.removeEventListener('catalogo_itens_updated', load);
      window.removeEventListener('demandas_updated', load);
    };
  }, []);

  const metrics = {
    total: items.length,
    publicados: items.filter((i) => i.status === 'publicado').length,
    pendentes: items.filter((i) => i.status === 'pendente').length,
    demandasPendentes: demands.filter((d) => d.status === 'pendente').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Admin - Seu Módulo</h1>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Itens', value: metrics.total, color: 'cyan' },
            { label: 'Publicados', value: metrics.publicados, color: 'emerald' },
            { label: 'Pendentes', value: metrics.pendentes, color: 'orange' },
            { label: 'Demandas', value: metrics.demandasPendentes, color: 'rose' },
          ].map((m) => (
            <div key={m.label} className={`p-4 rounded-2xl bg-${m.color}-500/10 border border-${m.color}-500/30`}>
              <p className={`text-sm text-${m.color}-300`}>{m.label}</p>
              <p className={`text-2xl font-bold text-${m.color}-400`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Abas */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('items')}
            className={`px-4 py-2 rounded-lg ${
              tab === 'items'
                ? 'bg-emerald-500 text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Itens
          </button>
          <button
            onClick={() => setTab('demands')}
            className={`px-4 py-2 rounded-lg ${
              tab === 'demands'
                ? 'bg-emerald-500 text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Demandas
          </button>
        </div>

        {/* Conteúdo */}
        {tab === 'items' && (
          <AdminTable
            items={items}
            onEdit={(item) => console.log('Editar:', item)}
            onDelete={(id) => CatalogStorage.remove(id)}
            onToggle={(item) => {
              const next = item.status === 'publicado' ? 'pendente' : 'publicado';
              CatalogStorage.update(item.id, { status: next });
            }}
          />
        )}

        {tab === 'demands' && (
          <div className="space-y-3">
            {demands.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhuma demanda</p>
            ) : (
              demands.map((demand) => (
                <div
                  key={demand.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-white/10"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-bold">{demand.nomeCliente}</p>
                      <p className="text-gray-300 text-sm mt-1">{demand.descricao}</p>
                      {demand.contato && (
                        <p className="text-gray-400 text-xs mt-2">📞 {demand.contato}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        demand.status === 'pendente'
                          ? 'bg-orange-500/20 text-orange-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {demand.status}
                    </span>
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
```

## Integração na Home

Adicionar botão de navegação em `app/page.tsx`:

```tsx
<Link href="/seu-modulo/public">
  <button className="p-6 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold">
    Seu Módulo
  </button>
</Link>
```

## Próximas Etapas

- [ ] Adicionar campos específicos via `Item.metadadosModulo`
- [ ] Criar componentes customizados no `app/seu-modulo/components/`
- [ ] Implementar autenticação com `useAuth`
- [ ] Configurar Supabase para persistência permanente
- [ ] Testes automatizados
- [ ] Deploy para produção

## Dúvidas?

Consulte:
- [modules-scaffold/README.md](../README.md)
- [modules-scaffold/docs/TEMPLATE.ts](../docs/TEMPLATE.ts)
- [Tipos disponíveis](../types/modules.ts)
- [Serviços compartilhados](../services/shared/storageServices.ts)
