// app/admin/servicos-pagos/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface ServicoPago {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  tipo: string;
  ativo: boolean;
}

export default function AdminServicosPagosPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  const [servicos, setServicos] = useState<ServicoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', valor: 0, tipo: '' });

  useEffect(() => {
    if (!isAdmin) {
      router.push('/login');
      return;
    }
    carregarServicos();
  }, [isAdmin]);

  const carregarServicos = async () => {
    const { data, error } = await supabase
      .from('servicos_pagos')
      .select('*')
      .order('nome');
    
    if (error) {
      toast.error('Erro ao carregar serviços');
    } else {
      setServicos(data || []);
    }
    setLoading(false);
  };

  const salvarServico = async () => {
    if (!formData.nome || formData.valor <= 0) {
      toast.error('Preencha nome e valor');
      return;
    }

    if (editando) {
      const { error } = await supabase
        .from('servicos_pagos')
        .update({
          nome: formData.nome,
          descricao: formData.descricao,
          valor: formData.valor,
          tipo: formData.tipo
        })
        .eq('id', editando);
      
      if (error) {
        toast.error('Erro ao atualizar');
      } else {
        toast.success('Serviço atualizado!');
        setEditando(null);
        carregarServicos();
      }
    } else {
      const { error } = await supabase
        .from('servicos_pagos')
        .insert({
          nome: formData.nome,
          descricao: formData.descricao,
          valor: formData.valor,
          tipo: formData.tipo,
          ativo: true
        });
      
      if (error) {
        toast.error('Erro ao criar serviço');
      } else {
        toast.success('Serviço criado!');
        setFormData({ nome: '', descricao: '', valor: 0, tipo: '' });
        carregarServicos();
      }
    }
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    const { error } = await supabase
      .from('servicos_pagos')
      .update({ ativo: !ativo })
      .eq('id', id);
    
    if (error) {
      toast.error('Erro ao alterar status');
    } else {
      toast.success(`Serviço ${!ativo ? 'ativado' : 'desativado'}!`);
      carregarServicos();
    }
  };

  const deletarServico = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      const { error } = await supabase
        .from('servicos_pagos')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error('Erro ao excluir');
      } else {
        toast.success('Serviço excluído!');
        carregarServicos();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin')} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <DollarSign className="w-6 h-6 text-yellow-300" />
          <h1 className="text-white font-bold text-lg">Serviços Pagos</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Formulário de novo serviço */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">
            {editando ? '✏️ Editar Serviço' : '➕ Novo Serviço Pago'}
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome do serviço (ex: Desbloqueio de Contato)"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
            />
            <input
              type="text"
              placeholder="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
            />
            <input
              type="text"
              placeholder="Tipo (corrida/desbloqueio_contato/anuncio_produto/foto_extra/destaque)"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Valor (R$)"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
            />
            <button
              onClick={salvarServico}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-bold"
            >
              {editando ? 'Atualizar' : 'Criar Serviço'}
            </button>
          </div>
        </div>

        {/* Lista de serviços */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <div className="bg-gray-700/50 px-5 py-3">
            <h2 className="text-white font-bold">Serviços Configurados</h2>
          </div>
          <div className="divide-y divide-gray-700">
            {servicos.map((servico) => (
              <div key={servico.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-bold">{servico.nome}</h3>
                    <p className="text-gray-400 text-sm">{servico.descricao}</p>
                    <p className="text-yellow-400 text-sm mt-1">R$ {servico.valor.toFixed(2)}</p>
                    <p className="text-gray-500 text-xs mt-1">Tipo: {servico.tipo}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAtivo(servico.id, servico.ativo)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        servico.ativo
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-600 text-gray-400'
                      }`}
                    >
                      {servico.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                    <button
                      onClick={() => {
                        setEditando(servico.id);
                        setFormData({
                          nome: servico.nome,
                          descricao: servico.descricao,
                          valor: servico.valor,
                          tipo: servico.tipo
                        });
                      }}
                      className="p-2 bg-blue-500/20 rounded-lg text-blue-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletarServico(servico.id)}
                      className="p-2 bg-red-500/20 rounded-lg text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-bold mb-2">📋 Tipos de serviço disponíveis:</p>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• <strong>corrida</strong> - Taxa por corrida de moto táxi</li>
            <li>• <strong>desbloqueio_contato</strong> - Pagamento para ver contato de anúncio</li>
            <li>• <strong>anuncio_produto</strong> - Taxa para publicar anúncio</li>
            <li>• <strong>foto_extra</strong> - Taxa por foto adicional no anúncio</li>
            <li>• <strong>destaque</strong> - Taxa para destacar anúncio</li>
          </ul>
        </div>
      </main>
    </div>
  );
}