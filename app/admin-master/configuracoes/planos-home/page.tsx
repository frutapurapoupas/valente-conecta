"use client";

import { Crown, Edit, Plus, Sparkles, Star, Trash2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface PlanoHome {
  id: string;
  nome: string;
  preco: number;
  precoOriginal: number;
  descricao: string;
  recursos: string[];
  destaque: boolean;
  cor: string;
  icone: string;
  ordem: number;
  ativo: boolean;
}

export default function AdminPlanosHomePage() {
  const [planos, setPlanos] = useState<PlanoHome[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    preco: 0,
    precoOriginal: 0,
    descricao: "",
    recursos: [""],
    destaque: false,
    cor: "from-blue-500 to-blue-600",
    icone: "Crown",
    ordem: 0,
    ativo: true
  });

  useEffect(() => {
    carregarPlanos();
  }, []);

  const carregarPlanos = () => {
    const stored = localStorage.getItem("planos_home_config");
    if (stored) {
      setPlanos(JSON.parse(stored));
    } else {
      // Planos padrÃ£o (mesmos da Home atual)
      const planosPadrao: PlanoHome[] = [
        { id: "1", nome: "BÃ¡sico", preco: 15, precoOriginal: 0, descricao: "Para comeÃ§ar", recursos: ["50 produtos", "Contatos visÃ­veis"], destaque: false, cor: "from-blue-500 to-blue-600", icone: "Sparkles", ordem: 1, ativo: true },
        { id: "2", nome: "Premium", preco: 25, precoOriginal: 0, descricao: "Para crescer", recursos: ["CatÃ¡logo ilimitado", "PDV completo", "Suporte prioritÃ¡rio"], destaque: true, cor: "from-purple-500 to-pink-500", icone: "Crown", ordem: 2, ativo: true }
      ];
      setPlanos(planosPadrao);
      localStorage.setItem("planos_home_config", JSON.stringify(planosPadrao));
    }
  };

  const salvarPlanos = (novos: PlanoHome[]) => {
    setPlanos(novos);
    localStorage.setItem("planos_home_config", JSON.stringify(novos));
    // Disparar evento para atualizar a Home em tempo real
    window.dispatchEvent(new Event("planos-home-updated"));
  };

  const handleSave = () => {
    if (!formData.nome || formData.preco <= 0) {
      alert("Preencha nome e preÃ§o!");
      return;
    }

    const novoPlano: PlanoHome = {
      id: editingId || Date.now().toString(),
      nome: formData.nome,
      preco: formData.preco,
      precoOriginal: formData.precoOriginal,
      descricao: formData.descricao,
      recursos: formData.recursos.filter(r => r.trim() !== ""),
      destaque: formData.destaque,
      cor: formData.cor,
      icone: formData.icone,
      ordem: formData.ordem,
      ativo: formData.ativo
    };

    let novos: PlanoHome[];
    if (editingId) {
      novos = planos.map(p => p.id === editingId ? novoPlano : p);
    } else {
      novos = [...planos, novoPlano];
    }
    salvarPlanos(novos);
    closeModal();
    alert("âœ… Plano salvo! A Home serÃ¡ atualizada automaticamente.");
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir este plano?")) {
      salvarPlanos(planos.filter(p => p.id !== id));
    }
  };

  const handleToggleAtivo = (id: string) => {
    salvarPlanos(planos.map(p => p.id === id ? { ...p, ativo: !p.ativo } : p));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nome: "", preco: 0, precoOriginal: 0, descricao: "", recursos: [""], destaque: false,
      cor: "from-blue-500 to-blue-600", icone: "Crown", ordem: 0, ativo: true
    });
  };

  const openEditModal = (plano: PlanoHome) => {
    setEditingId(plano.id);
    setFormData({
      nome: plano.nome,
      preco: plano.preco,
      precoOriginal: plano.precoOriginal,
      descricao: plano.descricao,
      recursos: plano.recursos.length ? plano.recursos : [""],
      destaque: plano.destaque,
      cor: plano.cor,
      icone: plano.icone,
      ordem: plano.ordem,
      ativo: plano.ativo
    });
    setShowModal(true);
  };

  const adicionarRecurso = () => {
    setFormData({ ...formData, recursos: [...formData.recursos, ""] });
  };

  const removerRecurso = (index: number) => {
    const novos = formData.recursos.filter((_, i) => i !== index);
    setFormData({ ...formData, recursos: novos.length ? novos : [""] });
  };

  const atualizarRecurso = (index: number, valor: string) => {
    const novos = [...formData.recursos];
    novos[index] = valor;
    setFormData({ ...formData, recursos: novos });
  };

  const getIconeComponente = (icone: string) => {
    switch (icone) {
      case "Crown": return <Crown size={20} />;
      case "Star": return <Star size={20} />;
      case "Sparkles": return <Sparkles size={20} />;
      case "TrendingUp": return <TrendingUp size={20} />;
      default: return <Crown size={20} />;
    }
  };

  const planosAtivos = planos.filter(p => p.ativo).sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="space-y-6">
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{editingId ? "âœï¸ Editar Plano" : "âž• Novo Plano"}</h3>
              <button onClick={closeModal} className="text-gray-400">âœ•</button>
            </div>
            <div className="space-y-3">
              <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Nome do plano" className="w-full p-2 border rounded-lg text-gray-800 bg-white" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="0.01" value={formData.preco} onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) })} placeholder="PreÃ§o (R$)" className="w-full p-2 border rounded-lg text-gray-800 bg-white" />
                <input type="number" step="0.01" value={formData.precoOriginal} onChange={(e) => setFormData({ ...formData, precoOriginal: parseFloat(e.target.value) })} placeholder="PreÃ§o original" className="w-full p-2 border rounded-lg text-gray-800 bg-white" />
              </div>
              <input type="text" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} placeholder="DescriÃ§Ã£o curta" className="w-full p-2 border rounded-lg text-gray-800 bg-white" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recursos</label>
                {formData.recursos.map((r, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={r} onChange={(e) => atualizarRecurso(idx, e.target.value)} placeholder="Ex: 50 produtos" className="flex-1 p-2 border rounded-lg text-gray-800 bg-white" />
                    <button onClick={() => removerRecurso(idx)} className="text-red-500">âœ•</button>
                  </div>
                ))}
                <button onClick={adicionarRecurso} className="text-blue-600 text-sm">+ Adicionar recurso</button>
              </div>
              <select value={formData.cor} onChange={(e) => setFormData({ ...formData, cor: e.target.value })} className="w-full p-2 border rounded-lg text-gray-800 bg-white">
                <option value="from-blue-500 to-blue-600">Azul</option>
                <option value="from-purple-500 to-pink-500">Roxo/Rosa</option>
                <option value="from-green-500 to-emerald-500">Verde</option>
                <option value="from-orange-500 to-red-500">Laranja</option>
                <option value="from-indigo-500 to-purple-500">Ãndigo</option>
              </select>
              <select value={formData.icone} onChange={(e) => setFormData({ ...formData, icone: e.target.value })} className="w-full p-2 border rounded-lg text-gray-800 bg-white">
                <option value="Crown">ðŸ‘‘ Coroa</option>
                <option value="Star">â­ Estrela</option>
                <option value="Sparkles">âœ¨ Brilho</option>
                <option value="TrendingUp">ðŸ“ˆ TendÃªncia</option>
              </select>
              <label className="flex items-center gap-2 text-gray-700"><input type="checkbox" checked={formData.destaque} onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })} className="w-4 h-4" /> ðŸŒŸ Destaque (MAIS VENDIDO)</label>
              <label className="flex items-center gap-2 text-gray-700"><input type="checkbox" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} className="w-4 h-4" /> âœ… Ativo</label>
              <button onClick={handleSave} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold">Salvar</button>
              <button onClick={closeModal} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-800">ðŸŽ¯ Planos da Home</h1><p className="text-sm text-gray-500">Gerencie os planos exibidos na pÃ¡gina principal</p></div>
        <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Novo Plano</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {planosAtivos.map(plano => (
          <div key={plano.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border ${plano.destaque ? 'border-yellow-400 shadow-md' : 'border-gray-200'}`}>
            <div className={`bg-gradient-to-r ${plano.cor} p-4 text-white`}>
              <div className="flex justify-between items-start">
                <div><h3 className="text-xl font-bold">{plano.nome}</h3><p className="text-sm opacity-90">{plano.descricao}</p></div>
                {plano.destaque && <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">â­ MAIS VENDIDO</span>}
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold">R$ {plano.preco.toFixed(2)}</span>
                <span className="text-sm opacity-80">/mÃªs</span>
                {plano.precoOriginal > plano.preco && <span className="text-sm line-through opacity-60 ml-2">R$ {plano.precoOriginal.toFixed(2)}</span>}
              </div>
            </div>
            <div className="p-4">
              <ul className="space-y-2 mb-4">
                {plano.recursos.map((r, idx) => (<li key={idx} className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">âœ“</span> {r}</li>))}
              </ul>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Assinar</button>
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button onClick={() => openEditModal(plano)} className="flex-1 bg-blue-100 text-blue-700 py-1 rounded-lg text-sm flex items-center justify-center gap-1"><Edit size={14} /> Editar</button>
              <button onClick={() => handleDelete(plano.id)} className="flex-1 bg-red-100 text-red-700 py-1 rounded-lg text-sm flex items-center justify-center gap-1"><Trash2 size={14} /> Excluir</button>
              <button onClick={() => handleToggleAtivo(plano.id)} className={`flex-1 py-1 rounded-lg text-sm ${plano.ativo ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>{plano.ativo ? 'Desativar' : 'Ativar'}</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-800 text-sm mb-2">ðŸ“Œ Como funciona</h4>
        <p className="text-xs text-blue-700">Os planos configurados aqui aparecerÃ£o automaticamente na pÃ¡gina principal. Altere preÃ§os, recursos e destaques em tempo real.</p>
      </div>
    </div>
  );
}

