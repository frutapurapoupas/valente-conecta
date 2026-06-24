"use client";
import React, { useState } from 'react';

export default function ScheduleModal({ product, onClose }: { product: any; onClose: () => void }) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [observacao, setObservacao] = useState('');

  const handleConfirm = () => {
    const agendamentosRaw = localStorage.getItem('agendamentos') || '[]';
    let agendamentos = [] as any[];
    try { agendamentos = JSON.parse(agendamentosRaw); } catch (e) { agendamentos = []; }

    const novo = {
      id: Date.now().toString(),
      produtoId: product?.id || product?.produtoId || null,
      produtoNome: product?.nome || product?.titulo || 'Produto',
      fornecedor: product?.fornecedorNome || product?.fornecedor || null,
      nomeCliente: nome,
      telefoneCliente: telefone,
      data,
      hora,
      observacao,
      criadoEm: new Date().toISOString()
    };

    agendamentos.unshift(novo);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    // Notificar admin (localStorage bootstrap)
    const notasRaw = localStorage.getItem('admin_notificacoes_agendamentos') || '[]';
    let notas = [] as any[];
    try { notas = JSON.parse(notasRaw); } catch (e) { notas = []; }
    notas.unshift({ id: novo.id, title: 'Novo agendamento', body: `Agendamento: ${novo.produtoNome} - ${novo.data} ${novo.hora}`, createdAt: novo.criadoEm });
    localStorage.setItem('admin_notificacoes_agendamentos', JSON.stringify(notas));

    window.alert('Agendamento salvo. O admin será notificado.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-w-lg w-full bg-slate-900/95 p-6 rounded-2xl border border-white/10 text-white">
        <h3 className="text-lg font-bold mb-2">Agendar retirada</h3>
        <p className="text-sm text-gray-300 mb-4">{product?.nome || product?.produtoNome || 'Produto'}</p>

        <div className="space-y-3">
          <input value={nome} onChange={(e)=>setNome(e.target.value)} placeholder="Seu nome" className="w-full p-2 rounded-lg bg-white/5" />
          <input value={telefone} onChange={(e)=>setTelefone(e.target.value)} placeholder="Telefone / WhatsApp" className="w-full p-2 rounded-lg bg-white/5" />
          <div className="flex gap-2">
            <input type="date" value={data} onChange={(e)=>setData(e.target.value)} className="flex-1 p-2 rounded-lg bg-white/5" />
            <input type="time" value={hora} onChange={(e)=>setHora(e.target.value)} className="w-32 p-2 rounded-lg bg-white/5" />
          </div>
          <textarea value={observacao} onChange={(e)=>setObservacao(e.target.value)} placeholder="Observações (opcional)" className="w-full p-2 rounded-lg bg-white/5 h-24" />
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-gray-700">Cancelar</button>
          <button onClick={handleConfirm} className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold">Confirmar agendamento</button>
        </div>
      </div>
    </div>
  );
}
