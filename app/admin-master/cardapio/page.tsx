"use client";

import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Edit2,
  Image as ImageIcon,
  Save,
  Star,
  Upload,
  Utensils,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Produto {
  id: string;
  nome: string;
  foto: string;
  descricao: string;
  precoCliente: number;
  precoParceiro: number;
  tempoPreparo: string;
  popular: boolean;
  ingredientes: any[];
  categoria: "prato" | "doce";
  tamanhos?: { nome: string; peso: number; preco: number }[];
}

interface CardapioSemanal {
  [dia: string]: string[];
}

const diasDaSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
const diasExtenso: Record<string, string> = {
  SEGUNDA: "Segunda-feira", TERÇA: "Terça-feira", QUARTA: "Quarta-feira",
  QUINTA: "Quinta-feira", SEXTA: "Sexta-feira", SABADO: "Sábado", DOMINGO: "Domingo"
};

export default function CardapioAdminPage() {
  const [pratos, setPratos] = useState<Produto[]>([]);
  const [cardapio, setCardapio] = useState<CardapioSemanal>({});
  const [diaSelecionado, setDiaSelecionado] = useState<string>("SEGUNDA");
  const [editandoPrato, setEditandoPrato] = useState<Produto | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<string>("");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const pratosSalvos = localStorage.getItem("admin_produtos_pratos");
    if (pratosSalvos) {
      const pratosCompletos = JSON.parse(pratosSalvos);
      const pratosComPreco = pratosCompletos.map((p: any) => ({
        ...p,
        precoCliente: p.precoCliente || 12,
        precoParceiro: p.precoParceiro || 10,
        tempoPreparo: p.tempoPreparo || "20-30min",
        popular: p.popular || false
      }));
      setPratos(pratosComPreco);
    }

    const cardapioSalvo = localStorage.getItem("admin_cardapio_semanal");
    if (cardapioSalvo) {
      setCardapio(JSON.parse(cardapioSalvo));
    } else {
      const inicial: CardapioSemanal = {};
      diasDaSemana.forEach(dia => { inicial[dia] = []; });
      setCardapio(inicial);
    }
  };

  const salvarCardapio = () => {
    localStorage.setItem("admin_cardapio_semanal", JSON.stringify(cardapio));
    localStorage.setItem("admin_produtos_pratos", JSON.stringify(pratos));
    alert("Cardapio e produtos salvos com sucesso!");
  };

  const togglePratoNoDia = (pratoId: string) => {
    const pratosDoDia = cardapio[diaSelecionado] || [];
    if (pratosDoDia.includes(pratoId)) {
      setCardapio({
        ...cardapio,
        [diaSelecionado]: pratosDoDia.filter(id => id !== pratoId)
      });
    } else {
      if (pratosDoDia.length >= 2) {
        alert("Cada dia pode ter no maximo 2 pratos!");
        return;
      }
      setCardapio({
        ...cardapio,
        [diaSelecionado]: [...pratosDoDia, pratoId]
      });
    }
  };

  const editarPrato = (prato: Produto) => {
    setEditandoPrato({ ...prato });
    setPreviewFoto(prato.foto);
    setShowModal(true);
  };

  const salvarEdicaoPrato = () => {
    if (editandoPrato) {
      const novosPratos = pratos.map(p =>
        p.id === editandoPrato.id ? editandoPrato : p
      );
      setPratos(novosPratos);
      localStorage.setItem("admin_produtos_pratos", JSON.stringify(novosPratos));
      setShowModal(false);
      setEditandoPrato(null);
      alert("Prato atualizado com sucesso!");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imagemBase64 = reader.result as string;
        setPreviewFoto(imagemBase64);
        if (editandoPrato) {
          setEditandoPrato({ ...editandoPrato, foto: imagemBase64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sincronizarComCozinha = () => {
    const pratosParaCozinha = pratos.map(p => ({
      id: parseInt(p.id),
      name: p.nome,
      price: p.precoCliente,
      partnerPrice: p.precoParceiro,
      description: p.descricao,
      time: p.tempoPreparo,
      popular: p.popular,
      image: p.foto,
      diaSemana: undefined
    }));

    localStorage.setItem("cozinha_pratos_admin", JSON.stringify(pratosParaCozinha));
    alert("Cardapio sincronizado com a Cozinha Chef Neide!");
  };

  const pratosDoDiaSelecionado = cardapio[diaSelecionado] || [];
  const pratosDisponiveis = pratos.filter(p => !pratosDoDiaSelecionado.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Link href="/admin-master/dashboard" className="flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700">
            <ArrowLeft size={20} /> Voltar ao Painel
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Cardapio Semanal</h1>
          <div className="flex gap-2">
            <button onClick={salvarCardapio} className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700">
              <Save size={18} /> Salvar Cardapio
            </button>
            <button onClick={sincronizarComCozinha} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700">
              <Utensils size={18} /> Sincronizar
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-purple-600 text-white p-4">
                <h2 className="font-bold flex items-center gap-2">
                  <Calendar size={20} /> Dias da Semana
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {diasDaSemana.map(dia => (
                  <button
                    key={dia}
                    onClick={() => setDiaSelecionado(dia)}
                    className={`w-full p-4 text-left flex justify-between items-center transition-all ${diaSelecionado === dia ? "bg-purple-50" : "hover:bg-gray-50"
                      }`}
                  >
                    <div>
                      <p className={`font-semibold ${diaSelecionado === dia ? "text-purple-700" : "text-gray-700"}`}>
                        {diasExtenso[dia]}
                      </p>
                      <p className="text-xs text-gray-400">{cardapio[dia]?.length || 0} / 2 pratos</p>
                    </div>
                    {diaSelecionado === dia && <Check size={18} className="text-purple-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-purple-600 text-white p-4">
                <h2 className="font-bold flex items-center gap-2">
                  <Utensils size={20} /> Pratos de {diasExtenso[diaSelecionado]}
                </h2>
              </div>

              <div className="p-4">
                {pratosDoDiaSelecionado.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
                    Nenhum prato selecionado para {diasExtenso[diaSelecionado]}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pratosDoDiaSelecionado.map(pratoId => {
                      const prato = pratos.find(p => p.id === pratoId);
                      return prato ? (
                        <div key={pratoId} className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-purple-100 rounded-xl overflow-hidden flex-shrink-0">
                              {prato.foto ? (
                                <img src={prato.foto} alt={prato.nome} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Utensils size={24} className="text-purple-400" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-gray-800">{prato.nome}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{prato.descricao?.substring(0, 80)}...</p>
                                </div>
                                <button
                                  onClick={() => editarPrato(prato)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                  <Edit2 size={16} />
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-4 mt-3">
                                <div className="flex items-center gap-1">
                                  <DollarSign size={14} className="text-gray-400" />
                                  <span className="text-sm text-gray-600">Cliente: <strong className="text-gray-800">R$ {prato.precoCliente?.toFixed(2) || "0,00"}</strong></span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign size={14} className="text-gray-400" />
                                  <span className="text-sm text-gray-600">Parceiro: <strong className="text-gray-800">R$ {prato.precoParceiro?.toFixed(2) || "0,00"}</strong></span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={14} className="text-gray-400" />
                                  <span className="text-sm text-gray-600">{prato.tempoPreparo || "20-30min"}</span>
                                </div>
                                {prato.popular && (
                                  <div className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-500" />
                                    <span className="text-sm text-yellow-600">Popular</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => togglePratoNoDia(pratoId)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg self-center"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 p-4 border-b border-gray-200">
                <h2 className="font-bold text-gray-700">Catalogo de Pratos</h2>
                <p className="text-xs text-gray-400">Clique em um prato para editar seus detalhes</p>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {pratosDisponiveis.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    Todos os pratos ja estao selecionados para este dia
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pratosDisponiveis.map(prato => (
                      <div key={prato.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-200 hover:bg-gray-100 transition">
                        <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => editarPrato(prato)}>
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                            {prato.foto ? (
                              <img src={prato.foto} alt={prato.nome} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon size={20} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{prato.nome}</p>
                            <p className="text-xs text-gray-500">{prato.descricao?.substring(0, 50)}...</p>
                            <div className="flex gap-3 mt-1">
                              <span className="text-xs text-purple-600 font-semibold">R$ {prato.precoCliente?.toFixed(2)}</span>
                              <span className="text-xs text-green-600">Parceiro: R$ {prato.precoParceiro?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => togglePratoNoDia(prato.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg ml-2"
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showModal && editandoPrato && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Editar Prato</h2>
                  <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Prato</label>
                  <input
                    type="text"
                    value={editandoPrato.nome}
                    onChange={(e) => setEditandoPrato({ ...editandoPrato, nome: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                  <textarea
                    value={editandoPrato.descricao}
                    onChange={(e) => setEditandoPrato({ ...editandoPrato, descricao: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preco Cliente (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editandoPrato.precoCliente || 0}
                      onChange={(e) => setEditandoPrato({ ...editandoPrato, precoCliente: parseFloat(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preco Parceiro (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editandoPrato.precoParceiro || 0}
                      onChange={(e) => setEditandoPrato({ ...editandoPrato, precoParceiro: parseFloat(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de preparo</label>
                  <input
                    type="text"
                    value={editandoPrato.tempoPreparo || ""}
                    onChange={(e) => setEditandoPrato({ ...editandoPrato, tempoPreparo: e.target.value })}
                    placeholder="Ex: 20-30min"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editandoPrato.popular || false}
                    onChange={(e) => setEditandoPrato({ ...editandoPrato, popular: e.target.checked })}
                    id="popular"
                    className="w-4 h-4 text-purple-600"
                  />
                  <label htmlFor="popular" className="text-sm text-gray-700">Marcar como Popular</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Prato</label>
                  <div className="flex gap-4 items-start">
                    <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                      {previewFoto ? (
                        <img src={previewFoto} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                      <Upload size={18} />
                      <span className="text-sm text-gray-700">Escolher imagem</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t flex gap-3 bg-gray-50">
                <button onClick={salvarEdicaoPrato} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition">
                  Salvar Alteracoes
                </button>
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}