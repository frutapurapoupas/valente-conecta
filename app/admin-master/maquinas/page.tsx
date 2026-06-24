"use client";
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Edit3, EyeOff, MessageCircle, PlusCircle, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CatalogItem, CatalogStorage } from '@/services/catalogStorage';
import { DemandView } from './components/DemandView';

const categories = ['alimentacao', 'higiene', 'servicos', 'veiculos', 'comercio', 'eventos', 'imoveis', 'maquinas', 'outros'];
const statusOptions = ['todos', 'publicado', 'pendente'];

const emptyForm = {
  nome: '',
  descricao: '',
  categoria: '',
  preco: 0,
  imagem: '',
  telefone: '',
  fornecedorNome: '',
  status: 'pendente' as 'publicado' | 'pendente'
};

export default function Page() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'publicado' | 'pendente'>('todos');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadItems = () => {
      setItems(CatalogStorage.getAll());
    };

    loadItems();
    window.addEventListener('catalogo_itens_updated', loadItems as EventListener);
    return () => window.removeEventListener('catalogo_itens_updated', loadItems as EventListener);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = statusFilter === 'todos' ? true : item.status === statusFilter;
      const matchesCategory = categoryFilter ? item.categoria === categoryFilter : true;
      const searchLower = search.trim().toLowerCase();
      const matchesSearch = !searchLower
        || item.nome.toLowerCase().includes(searchLower)
        || item.descricao.toLowerCase().includes(searchLower)
        || item.fornecedorNome?.toLowerCase().includes(searchLower)
        || item.categoria.toLowerCase().includes(searchLower);
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [items, search, statusFilter, categoryFilter]);

  const summary = useMemo(() => ({
    total: items.length,
    published: items.filter((item) => item.status === 'publicado').length,
    pending: items.filter((item) => item.status === 'pendente').length,
    suppliers: new Set(items.map((item) => item.fornecedorNome || item.fornecedorId || 'Sem fornecedor')).size
  }), [items]);

  const resetForm = () => {
    setEditId(null);
    setForm({ ...emptyForm });
  };

  const handleSaveItem = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.nome.trim() || !form.descricao.trim() || !form.categoria.trim() || form.preco <= 0 || !form.imagem.trim()) {
      toast.error('Preencha nome, descrição, categoria, preço e imagem.');
      return;
    }

    const item: CatalogItem = {
      id: editId || Date.now().toString(),
      nome: form.nome,
      descricao: form.descricao,
      categoria: form.categoria,
      preco: Number(form.preco),
      imagem: form.imagem,
      telefone: form.telefone,
      fornecedorId: `admin-${Date.now()}`,
      fornecedorNome: form.fornecedorNome || 'Admin Master',
      status: form.status,
      createdAt: editId ? items.find((value) => value.id === editId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editId) {
      CatalogStorage.update(editId, item);
      toast.success('Item atualizado com sucesso.');
    } else {
      CatalogStorage.add(item);
      toast.success('Item criado no catálogo de máquinas.');
    }

    setItems(CatalogStorage.getAll());
    resetForm();
  };

  const handleEdit = (item: CatalogItem) => {
    setEditId(item.id);
    setForm({
      nome: item.nome,
      descricao: item.descricao,
      categoria: item.categoria,
      preco: item.preco,
      imagem: item.imagem || '',
      telefone: item.telefone || '',
      fornecedorNome: item.fornecedorNome || '',
      status: item.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = (id: string) => {
    CatalogStorage.remove(id);
    setItems(CatalogStorage.getAll());
    toast.success('Item removido do catálogo.');
  };

  const handleToggleStatus = (item: CatalogItem) => {
    const nextStatus = item.status === 'publicado' ? 'pendente' : 'publicado';
    CatalogStorage.update(item.id, { status: nextStatus });
    setItems(CatalogStorage.getAll());
    toast.success(`Item agora está ${nextStatus}.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Painel Admin Master</p>
              <h1 className="mt-3 text-4xl font-bold text-white">Catálogo de Máquinas</h1>
              <p className="mt-3 max-w-2xl text-sm text-gray-400">Gerencie equipamentos, publique e controle o catálogo que aparece no portal público de máquinas.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-center">
                <p className="text-sm text-gray-400">Total</p>
                <p className="mt-2 text-3xl font-bold text-white">{summary.total}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-center">
                <p className="text-sm text-gray-400">Publicados</p>
                <p className="mt-2 text-3xl font-bold text-emerald-400">{summary.published}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-center">
                <p className="text-sm text-gray-400">Pendentes</p>
                <p className="mt-2 text-3xl font-bold text-orange-400">{summary.pending}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-center">
                <p className="text-sm text-gray-400">Fornecedores</p>
                <p className="mt-2 text-3xl font-bold text-cyan-300">{summary.suppliers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Cadastro e edição</h2>
                <p className="text-sm text-gray-400">Crie ou atualize itens do catálogo administrativo de máquinas.</p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <PlusCircle className="h-4 w-4" /> Limpar formulário
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-6 grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-gray-300">
                <span>Nome do equipamento</span>
                <input
                  value={form.nome}
                  onChange={(event) => setForm({ ...form, nome: event.target.value })}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Ex: Betoneira 150L"
                />
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                <span>Categoria</span>
                <select
                  value={form.categoria}
                  onChange={(event) => setForm({ ...form, categoria: event.target.value })}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="">Selecione a categoria</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-gray-300 lg:col-span-2">
                <span>Descrição</span>
                <textarea
                  value={form.descricao}
                  onChange={(event) => setForm({ ...form, descricao: event.target.value })}
                  rows={4}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Detalhes sobre o equipamento, condições de entrega e aluguel"
                />
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                <span>Preço</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.preco}
                  onChange={(event) => setForm({ ...form, preco: Number(event.target.value) })}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="0.00"
                />
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                <span>Imagem (URL)</span>
                <input
                  value={form.imagem}
                  onChange={(event) => setForm({ ...form, imagem: event.target.value })}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="https://..."
                />
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                <span>WhatsApp/Telefone</span>
                <input
                  value={form.telefone}
                  onChange={(event) => setForm({ ...form, telefone: event.target.value })}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="(75) 99999-9999"
                />
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                <span>Fornecedor</span>
                <input
                  value={form.fornecedorNome}
                  onChange={(event) => setForm({ ...form, fornecedorNome: event.target.value })}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Nome do fornecedor ou admin"
                />
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as 'publicado' | 'pendente' })}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="publicado">Publicar agora</option>
                  <option value="pendente">Manter pendente</option>
                </select>
              </label>

              <button type="submit" className="lg:col-span-2 rounded-3xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-6 py-4 text-black font-bold transition hover:opacity-95">
                {editId ? 'Salvar alterações' : 'Adicionar ao catálogo'}
              </button>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/40">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Demandas rápidas</h2>
                  <p className="text-sm text-gray-400">Captura de pedidos e solicitações de aluguel.</p>
                </div>
                <MessageCircle className="h-6 w-6 text-cyan-300" />
              </div>
              <div className="mt-6">
                <DemandView category="MAQUINAS" title="Registrar demanda de máquina" />
              </div>
            </div>
          </aside>
        </div>

        <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/40">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Itens do catálogo</h2>
              <p className="text-sm text-gray-400">Use filtros para localizar rapidamente equipamentos e gerir seu estado de publicação.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white">
                <Search className="h-4 w-4 text-cyan-300" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as any)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-gray-400">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Fornecedor</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Nenhum item encontrado.</td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="border-y border-white/5 bg-slate-950/80">
                      <td className="px-4 py-4 align-top text-white max-w-[250px]">
                        <div className="font-semibold">{item.nome}</div>
                        <div className="text-xs text-gray-400 line-clamp-2">{item.descricao}</div>
                      </td>
                      <td className="px-4 py-4 align-top text-gray-300">{item.categoria}</td>
                      <td className="px-4 py-4 align-top text-gray-300">{item.fornecedorNome || 'Admin'}</td>
                      <td className="px-4 py-4 align-top text-emerald-300">R$ {item.preco.toFixed(2)}</td>
                      <td className="px-4 py-4 align-top">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'publicado' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-orange-500/15 text-orange-300'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                        >
                          {item.status === 'publicado' ? <EyeOff className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          {item.status === 'publicado' ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
                        >
                          <Edit3 className="h-4 w-4" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500"
                        >
                          <Trash2 className="h-4 w-4" /> Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
