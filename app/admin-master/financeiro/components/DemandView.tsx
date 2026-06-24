"use client";

import { useState } from 'react';

interface Props {
  category: string;
  title?: string;
}

interface DemandFormData {
  name: string;
  whatsapp: string;
  description: string;
}

export const DemandView = ({ category, title }: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DemandFormData>({
    name: '',
    whatsapp: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Preencha nome e descrição.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/servicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria: category,
          nome: formData.name,
          whatsapp: formData.whatsapp,
          descricao: formData.description,
          origem: 'admin-master-financeiro'
        })
      });

      const result = await response.json().catch(() => ({ success: false }));
      if (response.ok && result?.success !== false) {
        alert('Solicitação enviada com sucesso!');
        setFormData({ name: '', whatsapp: '', description: '' });
      } else {
        alert('Não foi possível enviar sua solicitação agora.');
      }
    } catch {
      alert('Erro de conexão ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto bg-white p-6 rounded-3xl shadow-2xl border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        {title || `Solicitação: ${category}`}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300"
          placeholder="Seu nome"
        />

        <input
          value={formData.whatsapp}
          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300"
          placeholder="WhatsApp"
        />

        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300 h-24"
          placeholder="Escreva sua demanda..."
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-3 rounded-2xl disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

