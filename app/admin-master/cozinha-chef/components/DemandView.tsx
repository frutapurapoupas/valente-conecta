import { useState } from 'react';
import { useDemandCapture } from '../hooks/useDemandCapture';

export const DemandView = ({ category }: { category: string }) => {
  const { handleCapture, loading } = useDemandCapture(category);
  const [formData, setFormData] = useState({ name: '', whatsapp: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleCapture(formData);
    if (result.success) {
      alert("Solicitação enviada!");
      setFormData({ name: '', whatsapp: '', description: '' });
    }
  };

  return (
    <div className=\"max-w-[420px] mx-auto bg-white p-6 rounded-3xl shadow-2xl border border-gray-100\">
      <h2 className=\"text-xl font-bold mb-4 text-gray-800\">Solicitação: {category}</h2>
      <form onSubmit={handleSubmit} className=\"space-y-4\">
        <input className=\"w-full p-3 bg-gray-50 rounded-xl border\" placeholder=\"Seu Nome\" onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input className=\"w-full p-3 bg-gray-50 rounded-xl border\" placeholder=\"WhatsApp\" onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
        <textarea className=\"w-full p-3 bg-gray-50 rounded-xl border h-24\" placeholder=\"Descreva sua demanda...\" onChange={(e) => setFormData({...formData, description: e.target.value})} />
        <button disabled={loading} className=\"w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-3 rounded-2xl\">
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};
