"use client";
import { FormEvent, useState } from 'react';
import { useDemandCapture } from '@/src/modules/demand/hooks/useDemandCapture';

interface Props {
  category: string;
  title?: string;
}

export const DemandView = ({ category, title }: Props) => {
  const { captureDemand, loading } = useDemandCapture();
  const [formData, setFormData] = useState({ name: '', whatsapp: '', description: '' });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await captureDemand({ ...formData, category });
  };

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-2xl p-8 shadow-2xl shadow-slate-950/40">
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-700 px-6 py-5 text-white shadow-lg shadow-cyan-500/20">
        <h2 className="text-3xl font-extrabold tracking-tight">{title ?? 'Solicitação de Aluguel de Máquina'}</h2>
        <p className="mt-2 text-sm text-white/80">Informe os dados abaixo para capturar sua demanda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-white/80">
          Nome
          <input
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            placeholder="Nome"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>

        <label className="block text-sm font-medium text-white/80">
          WhatsApp
          <input
            value={formData.whatsapp}
            onChange={(event) => setFormData({ ...formData, whatsapp: event.target.value })}
            placeholder="(XX) XXXXX-XXXX"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>

        <label className="block text-sm font-medium text-white/80">
          Descrição
          <textarea
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            placeholder="Detalhes da demanda"
            rows={5}
            className="mt-2 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Enviar Solicitação'}
        </button>
      </form>
    </div>
  );
};

