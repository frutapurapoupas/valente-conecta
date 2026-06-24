"use client";
import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Demand } from '@/modules-scaffold/types/modules';
import toast from 'react-hot-toast';

export default function DemandModal({
  isOpen,
  onClose,
  categoria,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  categoria: string;
  onSubmit: (demand: Partial<Demand>) => void;
}) {
  const [form, setForm] = useState({
    nomeCliente: '',
    contato: '',
    descricao: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomeCliente.trim() || !form.descricao.trim()) {
      toast.error('Preencha nome e descrição.');
      return;
    }
    onSubmit({
      categoria,
      nomeCliente: form.nomeCliente,
      contato: form.contato,
      descricao: form.descricao,
    });
    setForm({ nomeCliente: '', contato: '', descricao: '' });
    toast.success('Demanda enviada com sucesso!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl border border-white/10 max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Nova Demanda</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Seu nome"
            value={form.nomeCliente}
            onChange={(e) => setForm({ ...form, nomeCliente: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
          />
          <input
            type="tel"
            placeholder="WhatsApp ou telefone"
            value={form.contato}
            onChange={(e) => setForm({ ...form, contato: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
          />
          <textarea
            placeholder="Descreva sua demanda"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-bold flex items-center justify-center gap-2 hover:opacity-90"
          >
            <Send className="h-4 w-4" /> Enviar Demanda
          </button>
        </form>
      </div>
    </div>
  );
}
