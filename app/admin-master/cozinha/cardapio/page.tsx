"use client";

import { Plus, Save, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Prato {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  imagem: string;
  diasAtivos: string[];
  status: "ativo" | "inativo";
  ordem: number;
  destaque: boolean;
  estoque: number;
  categoria: "salgado" | "doce";
}

const diasDaSemana = [
  { id: "SEGUNDA", label: "Segunda" },
  { id: "TERÇA", label: "Terça" },
  { id: "QUARTA", label: "Quarta" },
  { id: "QUINTA", label: "Quinta" },
  { id: "SEXTA", label: "Sexta" },
  { id: "SABADO", label: "Sábado" },
  { id: "DOMINGO", label: "Domingo" }
];

const cardapioPadrao: Prato[] = [
  { id: 1, nome: "Frango com Quiabo", preco: 12, descricao: "Frango com quiabo, vinagrete, arroz e feijão", imagem: "", diasAtivos: ["SEGUNDA"], status: "ativo", ordem: 1, destaque: false, estoque: 10, categoria: "salgado" },
  { id: 2, nome: "Bife à Cavalo", preco: 14, descricao: "Bife acebolado, ovo frito, arroz, feijão e farofa", imagem: "", diasAtivos: ["SEGUNDA"], status: "ativo", ordem: 2, destaque: false, estoque: 8, categoria: "salgado" },
  { id: 3, nome: "Strogonoff", preco: 12, descricao: "Strogonoff de frango, arroz e batata palha", imagem: "", diasAtivos: ["TERÇA"], status: "ativo", ordem: 1, destaque: true, estoque: 12, categoria: "salgado" },
];

export default function AdminCardapioPage() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [expandido, setExpandido] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  useEffect(() => {
    async function carregarCardapio() {
      try {
        const res = await fetch('/api/cozinha/cardapio')
        if (res.ok) {
          const json = await res.json()
          if (Array.isArray(json.cardapio) && json.cardapio.length > 0) {
            setPratos(json.cardapio)
            return
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar cardápio do servidor:', error)
      }

      const stored = localStorage.getItem('cardapio_cozinha')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPratos(parsed)
            return
          }
        } catch (error) {
          console.warn('Erro ao parsear cardápio local:', error)
        }
      }

      setPratos(cardapioPadrao)
    }

    carregarCardapio()
  }, [])

  const salvarTudo = async () => {
    try {
      const res = await fetch('/api/cozinha/cardapio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pratos)
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Erro ao salvar no servidor')
      }

      localStorage.setItem('cardapio_cozinha', JSON.stringify(pratos))
      alert('✅ Salvo! Cliente verá as alterações.')
    } catch (error: any) {
      alert(`❌ Não foi possível salvar o cardápio: ${error.message}`)
    }
  };

  const atualizarPrato = (id: number, campo: keyof Prato, valor: any) => {
    setPratos(pratos.map(p => p.id === id ? { ...p, [campo]: valor } : p));
  };

  const toggleDia = (id: number, diaId: string) => {
    const prato = pratos.find(p => p.id === id);
    if (prato) {
      const novosDias = prato.diasAtivos.includes(diaId)
        ? prato.diasAtivos.filter(d => d !== diaId)
        : [...prato.diasAtivos, diaId];
      atualizarPrato(id, "diasAtivos", novosDias);
    }
  };

  const fazerUpload = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      atualizarPrato(id, "imagem", base64);
      setUploadingId(null);
      alert("✅ Imagem salva!");
    };
    reader.readAsDataURL(file);
  };

  const adicionarPrato = () => {
    const novoId = Math.max(...pratos.map(p => p.id), 0) + 1;
    const novo: Prato = {
      id: novoId,
      nome: "Novo Prato",
      preco: 0,
      descricao: "Descrição do prato",
      imagem: "",
      diasAtivos: ["SEGUNDA"],
      status: "ativo",
      ordem: pratos.length + 1,
      destaque: false,
      estoque: 10,
      categoria: "salgado"
    };
    setPratos([...pratos, novo]);
  };

  const excluirPrato = (id: number) => {
    if (confirm("Excluir este prato?")) {
      setPratos(pratos.filter(p => p.id !== id));
    }
  };

  const pratosPorDia = diasDaSemana.map(dia => ({
    ...dia,
    pratos: pratos.filter(p => p.diasAtivos.includes(dia.id)).sort((a, b) => a.ordem - b.ordem)
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">📋 Cardápio da Cozinha</h1>
          <p className="text-sm text-gray-500">Configure o que aparece para o cliente</p>
        </div>
        <div className="flex gap-2">
          <button onClick={adicionarPrato} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={16} /> Novo Prato
          </button>
          <button onClick={salvarTudo} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Save size={16} /> Salvar Tudo
          </button>
        </div>
      </div>

      {/* Modal de Upload */}
      {uploadingId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">📤 Upload da Imagem</h3>
              <button onClick={() => setUploadingId(null)}><X size={20} /></button>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  fazerUpload(uploadingId, e.target.files[0]);
                }
              }}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Lista por Dia da Semana */}
      <div className="space-y-6">
        {pratosPorDia.map(({ id: diaId, label, pratos: lista }) => (
          <div key={diaId} className="border rounded-xl overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 font-bold text-lg">{label}</div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lista.map(prato => {
                const isExpanded = expandido === prato.id;
                return (
                  <div key={prato.id} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                    {/* Card Fechado - Preview */}
                    <div className="relative cursor-pointer" onClick={() => setExpandido(isExpanded ? null : prato.id)}>
                      {prato.imagem ? (
                        <img src={prato.imagem} alt={prato.nome} className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400">
                          Sem imagem
                        </div>
                      )}
                      {prato.destaque && <span className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs">⭐ Destaque</span>}
                      {prato.status === "inativo" && <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">Inativo</span>}
                      <div className="p-3">
                        <h3 className="font-bold">{prato.nome}</h3>
                        <p className="text-blue-600 font-bold">R$ {prato.preco.toFixed(2)}</p>
                        <p className="text-xs text-gray-400 mt-1">Clique para configurar</p>
                      </div>
                    </div>

                    {/* Card Expandido - Configurações */}
                    {isExpanded && (
                      <div className="p-4 border-t bg-gray-50 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-sm">⚙️ Configurações</h4>
                          <button onClick={() => excluirPrato(prato.id)} className="text-red-500 text-xs flex items-center gap-1"><Trash2 size={14} /> Excluir</button>
                        </div>

                        {/* Nome */}
                        <div>
                          <label className="block text-xs font-semibold">🍽️ Nome</label>
                          <input type="text" value={prato.nome} onChange={e => atualizarPrato(prato.id, "nome", e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                        </div>

                        {/* Preço */}
                        <div>
                          <label className="block text-xs font-semibold">💰 Preço</label>
                          <input type="number" step="0.01" value={prato.preco} onChange={e => atualizarPrato(prato.id, "preco", parseFloat(e.target.value))} className="w-full p-2 border rounded-lg text-sm" />
                        </div>

                        {/* Descrição */}
                        <div>
                          <label className="block text-xs font-semibold">📝 Descrição</label>
                          <textarea value={prato.descricao} onChange={e => atualizarPrato(prato.id, "descricao", e.target.value)} rows={2} className="w-full p-2 border rounded-lg text-sm" />
                        </div>

                        {/* Estoque */}
                        <div>
                          <label className="block text-xs font-semibold">📦 Estoque</label>
                          <input type="number" value={prato.estoque} onChange={e => atualizarPrato(prato.id, "estoque", parseInt(e.target.value) || 0)} className="w-full p-2 border rounded-lg text-sm" />
                        </div>

                        {/* Categoria */}
                        <div>
                          <label className="block text-xs font-semibold">🏷️ Categoria</label>
                          <select value={prato.categoria} onChange={e => atualizarPrato(prato.id, "categoria", e.target.value as "salgado" | "doce")} className="w-full p-2 border rounded-lg text-sm">
                            <option value="salgado">Salgado</option>
                            <option value="doce">Doce</option>
                          </select>
                        </div>

                        {/* Upload da Imagem */}
                        <div>
                          <label className="block text-xs font-semibold">🖼️ Imagem</label>
                          {prato.imagem && (
                            <img src={prato.imagem} alt="Preview" className="w-20 h-20 object-cover rounded-lg mt-1 mb-2" />
                          )}
                          <button onClick={() => setUploadingId(prato.id)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                            <Upload size={14} /> Fazer Upload
                          </button>
                        </div>

                        {/* Dias da Semana */}
                        <div>
                          <label className="block text-xs font-semibold mb-1">📅 Dias que aparece</label>
                          <div className="flex flex-wrap gap-1">
                            {diasDaSemana.map(dia => (
                              <button
                                key={dia.id}
                                onClick={() => toggleDia(prato.id, dia.id)}
                                className={`px-2 py-1 rounded-full text-xs ${prato.diasAtivos.includes(dia.id) ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
                              >
                                {dia.label.substring(0, 3)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Ordem e Status */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold">🔢 Ordem</label>
                            <input type="number" value={prato.ordem} onChange={e => atualizarPrato(prato.id, "ordem", parseInt(e.target.value))} className="w-full p-2 border rounded-lg text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold">🔘 Status</label>
                            <div className="flex gap-2 mt-1">
                              <button onClick={() => atualizarPrato(prato.id, "status", "ativo")} className={`flex-1 py-1 rounded-lg text-xs ${prato.status === "ativo" ? "bg-green-600 text-white" : "bg-gray-200"}`}>Ativo</button>
                              <button onClick={() => atualizarPrato(prato.id, "status", "inativo")} className={`flex-1 py-1 rounded-lg text-xs ${prato.status === "inativo" ? "bg-red-600 text-white" : "bg-gray-200"}`}>Inativo</button>
                            </div>
                          </div>
                        </div>

                        {/* Destaque */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={prato.destaque} onChange={e => atualizarPrato(prato.id, "destaque", e.target.checked)} />
                            <span className="text-xs">⭐ Marcar como Destaque</span>
                          </label>
                        </div>

                        <button onClick={() => setExpandido(null)} className="w-full bg-gray-300 py-1 rounded-lg text-sm mt-2">Fechar</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}