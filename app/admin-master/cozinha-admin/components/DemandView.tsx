"use client";
import { useState } from 'react';
import { useDemandCapture } from '../hooks/useDemandCapture';

interface Props { category: string; title?: string; }

export const DemandView = ({ category, title }: Props) => {
  const { handleCapture, loading } = useDemandCapture(category);
  const [formData, setFormData] = useState({ name: '', whatsapp: '', description: '' });

  return (
    <div className='p-8 bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl'>
      <h2 className='text-2xl font-black text-white mb-6'>{title || 'Nova Solicitação'}</h2>
      <input className='w-full p-4 mb-4 bg-gray-950 border border-gray-700 rounded-xl text-white' placeholder='Nome' onChange={(e) => setFormData({...formData, name: e.target.value})} />
      <input className='w-full p-4 mb-4 bg-gray-950 border border-gray-700 rounded-xl text-white' placeholder='WhatsApp' onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
      <textarea className='w-full p-4 mb-6 bg-gray-950 border border-gray-700 rounded-xl text-white h-32' placeholder='Detalhes...' onChange={(e) => setFormData({...formData, description: e.target.value})} />
      <button 
        disabled={loading} 
        onClick={() => handleCapture(formData)}
        className='w-full gradient-primary text-white py-4 rounded-xl font-bold hover:opacity-90 transition-opacity'
      >
        {loading ? 'Enviando...' : 'Confirmar Solicitação'}
      </button>
    </div>
  );
};
