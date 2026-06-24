"use client";
import { useEffect, useState } from 'react';
import { CatalogStorage, UserService } from '@/modules-scaffold/services/shared/storageServices';
import { Item } from '@/modules-scaffold/types/modules';
import EditorForm from '@/modules-scaffold/components/shared/EditorForm';
import AdminTable from '@/modules-scaffold/components/shared/AdminTable';
import toast from 'react-hot-toast';

const CATEGORIA = 'cozinha-chef-neide';

interface PratoData extends Item {
  ingredientes?: string;
  porcoes?: string;
  tempoPreparo?: string;
}

export default function CozinhaAdmin() {
  const [pratos, setPratos] = useState<Item[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Item>>({
    categoria: CATEGORIA,
    status: 'publicado',
  });
  const [ingredientes, setIngredientes] = useState('');
  const [porcoes, setPorcoes] = useState('');
  const [tempoPreparo, setTempoPreparo] = useState('');

  useEffect(() => {
    const user = UserService.get();
    if (!user) {
      toast.error('Você precisa estar logado como Chef Neide');
      return;
    }

    const loadPratos = () => {
      const all = CatalogStorage.getAll(CATEGORIA);
      setPratos(all.filter((i) => i.fornecedorId === user.id));
    };

    loadPratos();
    window.addEventListener('catalogo_itens_updated', loadPratos);
    return () => window.removeEventListener('catalogo_itens_updated', loadPratos);
  }, []);

  const handleSave = () => {
    if (!form.nome || !form.descricao || !form.preco) {
      toast.error('Preencha nome, descrição e preço');
      return;
    }

    const user = UserService.get();
    if (!user) return;

    const prato: Item = {
      id: editId || Date.now().toString(),
      nome: form.nome,
      descricao: form.descricao,
      categoria: CATEGORIA,
      preco: form.preco,
      imagem: form.imagem,
      status: form.status || 'publicado',
      fornecedorId: user.id,
      fornecedorNome: user.nome || 'Chef Neide',
      createdAt: editId
        ? pratos.find((p) => p.id === editId)?.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editId) {
      CatalogStorage.update(editId, prato);
      toast.success('Prato atualizado!');
    } else {
      CatalogStorage.add(prato);
      toast.success('Prato publicado no catálogo!');
    }

    setForm({ categoria: CATEGORIA, status: 'publicado' });
    setIngredientes('');
    setPorcoes('');
    setTempoPreparo('');
    setEditId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">👩‍🍳 Admin - Chef Neide</h1>
          <p className="text-gray-400 mt-2">Publique seus pratos no catálogo</p>
        </div>

        {/* Form */}
        <div className="rounded-3xl p-6 bg-slate-900 border border-white/10 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">
            {editId ? '✏️ Editar Prato' : '➕ Novo Prato'}
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome do prato"
              value={form.nome || ''}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
            />

            <textarea
              placeholder="Descrição (ingredientes principais, modo de preparo)"
              value={form.descricao || ''}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Preço (R$)"
                value={form.preco || ''}
                onChange={(e) =>
                  setForm({ ...form, preco: parseFloat(e.target.value) || 0 })
                }
                className="px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="Porções (ex: 4 pessoas)"
                value={porcoes}
                onChange={(e) => setPorcoes(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <input
              type="text"
              placeholder="URL da imagem do prato"
              value={form.imagem || ''}
              onChange={(e) => setForm({ ...form, imagem: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
            />

            <select
              value={form.status || 'publicado'}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white"
            >
              <option value="publicado">✅ Publicado (Visível)</option>
              <option value="pendente">⏳ Pendente (Ocultado)</option>
            </select>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition"
              >
                {editId ? '💾 Atualizar' : '✔️ Publicar Prato'}
              </button>
              {editId && (
                <button
                  onClick={() => {
                    setForm({ categoria: CATEGORIA, status: 'publicado' });
                    setEditId(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition"
                >
                  ❌ Cancelar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pratos Publicados */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            📋 Meus Pratos ({pratos.length})
          </h2>

          {pratos.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-slate-900 border border-white/10">
              <p className="text-gray-400">Nenhum prato publicado ainda</p>
            </div>
          ) : (
            <AdminTable
              items={pratos}
              onEdit={(item) => {
                setEditId(item.id);
                setForm(item);
              }}
              onDelete={(id) => {
                CatalogStorage.remove(id);
                toast.success('Prato removido do catálogo');
              }}
              onToggle={(item) => {
                const next = item.status === 'publicado' ? 'pendente' : 'publicado';
                CatalogStorage.update(item.id, { status: next });
                toast.success(
                  `Prato ${next === 'publicado' ? 'publicado' : 'ocultado'}`
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
