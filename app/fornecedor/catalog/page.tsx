"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { CatalogItem, CatalogStorage } from '@/services/catalogStorage';
import { SupplierStorage } from '@/services/supplierStorage';
import { ArrowLeft, Pencil, Save, ImageIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = [
  'alimentacao',
  'higiene',
  'servicos',
  'veiculos',
  'comercio',
  'eventos',
  'imoveis',
  'outros'
];

export default function FornecedorCatalogPage() {
  const router = useRouter();
  const { user } = useApp();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    preco: 0,
    imagem: '',
    telefone: user?.telefone || '',
    fornecedorNome: user?.nome || 'Fornecedor'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadItems = () => setItems(CatalogStorage.getAll());
    loadItems();
    window.addEventListener('catalogo_itens_updated', loadItems as EventListener);
    return () => window.removeEventListener('catalogo_itens_updated', loadItems as EventListener);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-slate-900/90 p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold mb-4">Log in to access your account</h1>
          <p className="text-gray-400 mb-6">Please log in to manage your catalog and publish immediately.</p>
          <button
            onClick={() => router.push('/login')}
            className="rounded-3xl bg-green-500 px-6 py-3 font-bold text-black hover:bg-green-400 transition"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setForm({
      nome: '',
      descricao: '',
      categoria: '',
      preco: 0,
      imagem: '',
      telefone: user.telefone || '',
      fornecedorNome: user.nome || 'Fornecedor'
    });
    setEditId(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.nome.trim() || !form.descricao.trim() || !form.categoria || form.preco <= 0 || !form.imagem.trim()) {
      toast.error('Fill in name, description, category, price and image.');
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
      fornecedorId: user.id,
      fornecedorNome: form.fornecedorNome,
      status: 'publicado',
      createdAt: editId ? items.find((value) => value.id === editId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editId) {
      CatalogStorage.update(editId, item);
      toast.success('Item updated and kept published.');
    } else {
      CatalogStorage.add(item);
      toast.success('Item published to the public catalog.');
    }

    setItems(CatalogStorage.getAll());
    resetForm();
  };

  const startEdit = (item: CatalogItem) => {
    setEditId(item.id);
    setForm({
      nome: item.nome,
      descricao: item.descricao,
      categoria: item.categoria,
      preco: item.preco,
      imagem: item.imagem || '',
      telefone: item.telefone || user.telefone || '',
      fornecedorNome: item.fornecedorNome || user.nome || 'Fornecedor'
    });
  };

  const handleDelete = (id: string) => {
    CatalogStorage.remove(id);
    setItems(CatalogStorage.getAll());
    toast.success('Item removed from catalog.');
  };

  const myItems = items.filter((item) => item.fornecedorId === user.id);
  const publishedCount = myItems.filter((item) => item.status === 'publicado').length;
  const suppliers = SupplierStorage.getAll().slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Supplier catalog</h1>
            <p className="mt-2 text-gray-400">Publish equipment and services to appear immediately in the public area.</p>
          </div>
          <button onClick={() => router.push('/profile')} className="rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-white hover:bg-white/10 transition">
            <ArrowLeft className="inline mr-2" /> Back to profile
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-gray-300">
                <span>Equipment or service name</span>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                  placeholder="Ex: Professional ice machine"
                />
              </label>

              <label className="space-y-2 text-sm text-gray-300">
                <span>Price</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="number"
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-10 py-3 text-white"
                    placeholder="0.00"
                  />
                </div>
              </label>
            </div>

            <label className="space-y-2 text-sm text-gray-300">
              <span>Category</span>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              >
                <option value="">Select category</option>
                {categories.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-gray-300">
              <span>Description</span>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white h-28"
                placeholder="Describe the equipment, benefits and delivery or installation conditions"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-300">
              <span>Image URL</span>
              <input
                value={form.imagem}
                onChange={(e) => setForm({ ...form, imagem: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                placeholder="https://..."
              />
            </label>

            <label className="space-y-2 text-sm text-gray-300">
              <span>WhatsApp or phone</span>
              <input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                placeholder="(75) 99999-9999"
              />
            </label>

            <button type="submit" className="w-full rounded-3xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-6 py-4 text-black font-bold hover:opacity-95 transition">
              <Save className="inline mr-2" /> {editId ? 'Update item' : 'Publish item'}
            </button>
          </form>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">My items</h2>
                  <p className="text-gray-400 text-sm">{publishedCount} published</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">{myItems.length} total</span>
              </div>
              <div className="space-y-4">
                {myItems.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-slate-900 p-4 text-gray-400">No items published yet.</div>
                ) : (
                  myItems.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-white/10 bg-slate-900 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{item.nome}</p>
                          <p className="text-gray-400 text-sm">{item.categoria}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400">R$ {item.preco.toFixed(2)}</p>
                          <span className="text-xs text-gray-500">{item.status}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => startEdit(item)} className="flex-1 rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold hover:bg-blue-500">
                          <Pencil className="inline mr-2" /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="flex-1 rounded-2xl bg-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-500">
                          <Trash2 className="inline mr-2" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold">Active suppliers</h2>
              </div>
              <div className="grid gap-3">
                {suppliers.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-slate-900 p-4 text-gray-400">No suppliers registered yet.</div>
                ) : (
                  suppliers.map((supplier, idx) => (
                    <div key={idx} className="rounded-3xl border border-white/10 bg-slate-900 p-4">
                      <p className="font-semibold">{supplier.nomeEmpresa || supplier.nome || 'Fornecedor'}</p>
                      <p className="text-gray-400 text-sm">{Array.isArray(supplier.servicos) ? supplier.servicos.slice(0, 3).join(', ') : supplier.servicos}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

