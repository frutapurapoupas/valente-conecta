"use client";

import { atualizarRoteiro, listarRoteiros, Roteiro, salvarRoteiro } from "@/services/roteiroService";
import { Edit, Loader2, Play, Plus, Sparkles, Video } from "lucide-react";
import { useEffect, useState } from "react";

// Tipo para o tom do vídeo
type TomType = "informativo" | "divertido" | "emocional" | "urgente";

export default function GerenciadorRoteirosPage() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [processando, setProcessando] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Roteiro | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    texto: "",
    imagemPrompt: "",
    tom: "divertido" as TomType
  });

  useEffect(() => {
    carregarRoteiros();
  }, []);

  const carregarRoteiros = () => {
    const lista = listarRoteiros();
    setRoteiros(lista);
  };

  const gerarVideo = async (id: string) => {
    setProcessando(id);
    try {
      const response = await fetch("/api/video/processar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roteiroId: id }),
      });
      const data = await response.json();
      if (data.success) {
        alert("✅ Vídeo gerado com sucesso!");
        carregarRoteiros();
      } else {
        alert("❌ Erro: " + data.error);
      }
    } catch (error) {
      alert("Erro ao gerar vídeo");
    } finally {
      setProcessando(null);
    }
  };

  const salvarRoteiroHandler = () => {
    if (!formData.titulo || !formData.texto) {
      alert("Preencha título e roteiro!");
      return;
    }

    const roteiroData = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      texto: formData.texto,
      imagemPrompt: formData.imagemPrompt,
      tom: formData.tom,
      status: "rascunho" as const
    };

    if (editando) {
      atualizarRoteiro(editando.id, roteiroData);
    } else {
      salvarRoteiro(roteiroData);
    }

    setShowModal(false);
    setEditando(null);
    setFormData({ titulo: "", descricao: "", texto: "", imagemPrompt: "", tom: "divertido" });
    carregarRoteiros();
  };

  const editarRoteiro = (roteiro: Roteiro) => {
    setEditando(roteiro);
    setFormData({
      titulo: roteiro.titulo,
      descricao: roteiro.descricao,
      texto: roteiro.texto,
      imagemPrompt: roteiro.imagemPrompt || "",
      tom: roteiro.tom as TomType
    });
    setShowModal(true);
  };

  const adicionarRoteiroValentinha = () => {
    const roteiroValentinha = {
      titulo: "🎬 Boas-vindas com a Valentinha",
      descricao: "Vídeo de boas-vindas animado com a Valentinha",
      texto: `Olá! Que alegria ter você aqui comigo! Seja muito bem-vindo, de coração, ao Valente Conecta. Eu sou a Valentinha, sua parceira nessa jornada, e já te digo: a partir de hoje, a sua forma de se relacionar e fazer negócios nunca mais será a mesma!

Nós não estamos aqui apenas para criar mais um aplicativo de contatos. Estamos iniciando um movimento! O Valente Conecta nasceu para transformar a convivência comercial em algo vivo, humano, colaborativo e altamente rentável. Aqui, cada conexão é uma oportunidade real de crescer junto.

E para você começar com o pé direito e não perder nenhum detalhe, eu preparei um tour rápido. Aqui embaixo, você vai encontrar vídeos curtinhos mostrando todas as nossas ferramentas mágicas.

Dê o play, explore sem moderação e prepare-se para viver essa nova era dos negócios. O futuro já começou, e nós estamos juntos nessa. Até logo!`,
      imagemPrompt: "Valentinha avatar animado, sorridente, escritório moderno, conexões brilhantes ao redor",
      tom: "divertido" as TomType,
      status: "rascunho" as const
    };

    const novo = salvarRoteiro(roteiroValentinha);
    carregarRoteiros();
    alert(`✅ Roteiro "${novo.titulo}" adicionado!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="text-purple-500" /> Gerenciador de Roteiros
          </h1>
          <p className="text-sm text-gray-500">Salve roteiros e gere vídeos automaticamente</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <Plus size={16} /> Novo Roteiro
          </button>
          <button
            onClick={adicionarRoteiroValentinha}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <Sparkles size={16} /> Adicionar Roteiro Valentinha
          </button>
        </div>
      </div>

      {roteiros.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Sparkles size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum roteiro cadastrado</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-purple-600 text-sm">
            Criar primeiro roteiro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {roteiros.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{r.titulo}</h3>
                  <p className="text-sm text-gray-500 mt-1">{r.descricao}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "pronto" ? "bg-green-100 text-green-700" :
                        r.status === "processando" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                      }`}>
                      {r.status === "pronto" ? "✅ Vídeo pronto" :
                        r.status === "processando" ? "⏳ Processando" :
                          "📝 Rascunho"}
                    </span>
                    {r.videoUrl && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">🎬 Vídeo disponível</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {r.videoUrl && (
                    <a href={r.videoUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition" title="Assistir vídeo">
                      <Video size={16} />
                    </a>
                  )}
                  <button onClick={() => editarRoteiro(r)} className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition" title="Editar roteiro">
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => gerarVideo(r.id)}
                    disabled={processando === r.id}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 hover:bg-green-700 transition"
                  >
                    {processando === r.id ? (
                      <><Loader2 size={16} className="animate-spin" /> Gerando...</>
                    ) : (
                      <><Play size={16} /> Gerar Vídeo</>
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 line-clamp-3">{r.texto.substring(0, 150)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de criação/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{editando ? "✏️ Editar Roteiro" : "➕ Novo Roteiro"}</h3>
              <button onClick={() => { setShowModal(false); setEditando(null); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Boas-vindas Valentinha"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição curta</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Breve descrição do vídeo"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roteiro completo *</label>
                <textarea
                  value={formData.texto}
                  onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                  placeholder="Digite o roteiro do vídeo..."
                  className="w-full p-2 border border-gray-300 rounded-lg h-48 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt para thumbnail (opcional)</label>
                <input
                  type="text"
                  value={formData.imagemPrompt}
                  onChange={(e) => setFormData({ ...formData, imagemPrompt: e.target.value })}
                  placeholder="Descrição da imagem de capa"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tom do vídeo</label>
                <select
                  value={formData.tom}
                  onChange={(e) => setFormData({ ...formData, tom: e.target.value as TomType })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="informativo">📘 Informativo</option>
                  <option value="divertido">😄 Divertido</option>
                  <option value="emocional">❤️ Emocional</option>
                  <option value="urgente">🔥 Urgente</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={salvarRoteiroHandler} className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
                  {editando ? "Salvar Alterações" : "Salvar Roteiro"}
                </button>
                <button onClick={() => { setShowModal(false); setEditando(null); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}