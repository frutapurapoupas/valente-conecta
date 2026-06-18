// app/admin-master/cozinha-admin/page.tsx
"use client";

import {
  ArrowLeft,
  Cake,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Edit2,
  Image as ImageIcon,
  Plus,
  Save,
  Star,
  Trash2,
  Utensils,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Prato {
  id: number;
  name: string;
  price: number;
  partnerPrice: number;
  description: string;
  time: string;
  popular: boolean;
  image: string;
  diaSemana: string;
  ordem: number;
}

const diasDaSemana = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];

export default function CozinhaAdminPage() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [doces, setDoces] = useState<Prato[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<"pratos" | "doces">("pratos");
  const [diaSelecionado, setDiaSelecionado] = useState<string>("SEGUNDA");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Prato | null>(null);
  const [formData, setFormData] = useState<Partial<Prato>>({});
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    // Carregar do localStorage ou usar dados padrão
    const pratosSalvos = localStorage.getItem("cozinha_pratos_admin");
    const docesSalvos = localStorage.getItem("cozinha_doces_admin");

    if (pratosSalvos) {
      setPratos(JSON.parse(pratosSalvos));
    } else {
      setPratos(getPratosPadrao());
    }

    if (docesSalvos) {
      setDoces(JSON.parse(docesSalvos));
    } else {
      setDoces(getDocesPadrao());
    }
  };

  const getPratosPadrao = (): Prato[] => {
    return [
      // SEGUNDA
      { id: 1, name: "Frango com Quiabo", price: 12, partnerPrice: 10, description: "Frango com quiabo, vinagrete, arroz e feijão", time: "20-30min", popular: true, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d", diaSemana: "SEGUNDA", ordem: 1 },
      { id: 2, name: "Bife à Cavalo", price: 14, partnerPrice: 11, description: "Bife acebolado, ovo frito, arroz, feijão e farofa", time: "20-25min", popular: false, image: "https://images.unsplash.com/photo-1544025162-d76694265947", diaSemana: "SEGUNDA", ordem: 2 },
      // TERÇA
      { id: 3, name: "Strogonoff", price: 12, partnerPrice: 10, description: "Strogonoff de frango, arroz e batata palha", time: "20-25min", popular: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950", diaSemana: "TERÇA", ordem: 1 },
      { id: 4, name: "Filé de Frango Grelhado", price: 11, partnerPrice: 9, description: "Filé de frango grelhado, legumes e arroz", time: "15-20min", popular: false, image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58", diaSemana: "TERÇA", ordem: 2 },
      // QUARTA
      { id: 5, name: "Feijoada Magra", price: 12, partnerPrice: 10, description: "Feijoada magra, arroz, couve e farofa", time: "25-30min", popular: true, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", diaSemana: "QUARTA", ordem: 1 },
      { id: 6, name: "Costela Assada", price: 15, partnerPrice: 12, description: "Costela assada com mandioca e arroz", time: "30-40min", popular: false, image: "https://images.unsplash.com/photo-1544025162-d76694265947", diaSemana: "QUARTA", ordem: 2 },
      // QUINTA
      { id: 7, name: "PF Completo", price: 24.90, partnerPrice: 18.90, description: "Arroz, feijão, bife acebolado, farofa, salada e ovo frito", time: "20-30min", popular: true, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", diaSemana: "QUINTA", ordem: 1 },
      { id: 8, name: "Peixe Frito", price: 16, partnerPrice: 13, description: "Peixe frito com pirão, arroz e salada", time: "20-25min", popular: false, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2", diaSemana: "QUINTA", ordem: 2 },
      // SEXTA
      { id: 9, name: "Peixe à Milanesa", price: 28.90, partnerPrice: 22.90, description: "Filé de peixe empanado, arroz, purê e salada", time: "25-30min", popular: true, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2", diaSemana: "SEXTA", ordem: 1 },
      { id: 10, name: "Bacalhau", price: 32, partnerPrice: 25, description: "Bacalhau desfiado com batatas e azeitonas", time: "30-35min", popular: false, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836", diaSemana: "SEXTA", ordem: 2 },
      // SABADO
      { id: 11, name: "Macarronada", price: 19.90, partnerPrice: 14.90, description: "Macarrão ao molho bolonhesa com queijo", time: "15-20min", popular: true, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9", diaSemana: "SABADO", ordem: 1 },
      { id: 12, name: "Lasanha", price: 22, partnerPrice: 17, description: "Lasanha de carne com queijo gratinado", time: "25-30min", popular: false, image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3", diaSemana: "SABADO", ordem: 2 },
      // DOMINGO
      { id: 13, name: "Galinhada", price: 15, partnerPrice: 12, description: "Galinhada com legumes e arroz", time: "25-30min", popular: true, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d", diaSemana: "DOMINGO", ordem: 1 },
      { id: 14, name: "Churrasco", price: 25, partnerPrice: 19, description: "Churrasco com farofa, vinagrete e arroz", time: "30-40min", popular: true, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1", diaSemana: "DOMINGO", ordem: 2 },
    ];
  };

  const getDocesPadrao = (): Prato[] => {
    return [
      { id: 101, name: "Pudim de Leite", price: 8, partnerPrice: 6, description: "Pudim tradicional com calda de caramelo", time: "10min", popular: true, image: "https://images.unsplash.com/photo-1551024506-0bccd828d307", diaSemana: "GERAL", ordem: 1 },
      { id: 102, name: "Bolo de Chocolate", price: 12, partnerPrice: 9, description: "Bolo fofinho com cobertura de chocolate", time: "15min", popular: true, image: "https://images.unsplash.com/photo-1578985545062-69928b1b958e", diaSemana: "GERAL", ordem: 2 },
      { id: 103, name: "Torta de Limão", price: 10, partnerPrice: 7, description: "Torta cremosa com merengue", time: "10min", popular: false, image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187", diaSemana: "GERAL", ordem: 3 },
      { id: 104, name: "Brigadeiro", price: 5, partnerPrice: 3.50, description: "Brigadeiro gourmet", time: "5min", popular: false, image: "https://images.unsplash.com/photo-1559613074-1c2c4fa2d4b6", diaSemana: "GERAL", ordem: 4 },
    ];
  };

  const salvarDados = () => {
    localStorage.setItem("cozinha_pratos_admin", JSON.stringify(pratos));
    localStorage.setItem("cozinha_doces_admin", JSON.stringify(doces));

    // Sincronizar com o cardápio principal
    localStorage.setItem("cozinha_cardapio_imagens", JSON.stringify(
      [...pratos, ...doces].reduce((acc, p) => ({ ...acc, [p.name]: p.image }), {})
    ));

    alert("✅ Cardápio salvo com sucesso!");
  };

  const adicionarPrato = () => {
    const novoId = Math.max(...[...pratos, ...doces].map(p => p.id), 0) + 1;
    const novoPrato: Prato = {
      id: novoId,
      name: "Novo Prato",
      price: 0,
      partnerPrice: 0,
      description: "Descrição do prato",
      time: "15min",
      popular: false,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      diaSemana: abaAtiva === "pratos" ? diaSelecionado : "GERAL",
      ordem: (abaAtiva === "pratos" ? pratos.filter(p => p.diaSemana === diaSelecionado).length : doces.length) + 1
    };

    if (abaAtiva === "pratos") {
      setPratos([...pratos, novoPrato]);
    } else {
      setDoces([...doces, novoPrato]);
    }
  };

  const editarPrato = (prato: Prato) => {
    setEditando(prato);
    setFormData(prato);
    setPreviewImage(prato.image);
    setShowModal(true);
  };

  const salvarEdicao = () => {
    if (editando) {
      if (abaAtiva === "pratos") {
        setPratos(pratos.map(p => p.id === editando.id ? { ...p, ...formData } as Prato : p));
      } else {
        setDoces(doces.map(d => d.id === editando.id ? { ...d, ...formData } as Prato : d));
      }
      setShowModal(false);
      setEditando(null);
      setFormData({});
    }
  };

  const excluirPrato = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este prato?")) {
      if (abaAtiva === "pratos") {
        setPratos(pratos.filter(p => p.id !== id));
      } else {
        setDoces(doces.filter(d => d.id !== id));
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const pratosFiltrados = abaAtiva === "pratos"
    ? pratos.filter(p => p.diaSemana === diaSelecionado).sort((a, b) => a.ordem - b.ordem)
    : doces.sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Link href="/admin-master/dashboard" className="flex items-center gap-2 text-purple-600 font-medium">
            <ArrowLeft size={20} /> Voltar ao Painel
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">🍳 Admin - Cozinha Chef Neide</h1>
          <button
            onClick={salvarDados}
            className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700"
          >
            <Save size={18} /> Salvar Alterações
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-purple-600">{pratos.length}</p>
            <p className="text-sm text-gray-500">Pratos Cadastrados</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-pink-600">{doces.length}</p>
            <p className="text-sm text-gray-500">Doces Cadastrados</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">7</p>
            <p className="text-sm text-gray-500">Dias da Semana</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-orange-600">2</p>
            <p className="text-sm text-gray-500">Pratos por Dia</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setAbaAtiva("pratos")}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${abaAtiva === "pratos"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <Utensils size={18} /> Pratos Salgados
          </button>
          <button
            onClick={() => setAbaAtiva("doces")}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${abaAtiva === "doces"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <Cake size={18} /> Pratos Doces
          </button>
        </div>

        {/* Seletor de Dia (apenas para pratos) */}
        {abaAtiva === "pratos" && (
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  const index = diasDaSemana.indexOf(diaSelecionado);
                  setDiaSelecionado(diasDaSemana[index === 0 ? 6 : index - 1]);
                }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <p className="text-sm text-gray-500">Editando cardápio de</p>
                <p className="text-xl font-bold text-purple-600">{diaSelecionado}</p>
              </div>
              <button
                onClick={() => {
                  const index = diasDaSemana.indexOf(diaSelecionado);
                  setDiaSelecionado(diasDaSemana[index === 6 ? 0 : index + 1]);
                }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Lista de Pratos */}
        <div className="grid grid-cols-1 gap-4">
          {pratosFiltrados.map((prato) => (
            <div key={prato.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex gap-4">
                {/* Imagem */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={prato.image} alt={prato.name} className="w-full h-full object-cover" />
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{prato.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{prato.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editarPrato(prato)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => excluirPrato(prato.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-gray-400" />
                      <span className="text-sm">Cliente: <strong>R$ {prato.price.toFixed(2)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-gray-400" />
                      <span className="text-sm">Parceiro: <strong>R$ {prato.partnerPrice.toFixed(2)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-sm">{prato.time}</span>
                    </div>
                    {prato.popular && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500" />
                        <span className="text-sm text-yellow-600">Popular</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botão Adicionar */}
        <button
          onClick={adicionarPrato}
          className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all"
        >
          <Plus size={24} />
        </button>

        {/* Modal de Edição */}
        {showModal && editando && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Editar Prato</h2>
                  <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Prato</label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                {/* Preços */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço Cliente (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || 0}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço Parceiro (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.partnerPrice || 0}
                      onChange={(e) => setFormData({ ...formData, partnerPrice: parseFloat(e.target.value) })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Tempo */}
                <div>
                  <label className="block text-sm font-medium mb-1">Tempo de preparo</label>
                  <input
                    type="text"
                    value={formData.time || ""}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="Ex: 20-30min"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                {/* Popular */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.popular || false}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    id="popular"
                  />
                  <label htmlFor="popular" className="text-sm">Marcar como Popular 🔥</label>
                </div>

                {/* Imagem */}
                <div>
                  <label className="block text-sm font-medium mb-1">Imagem</label>
                  <div className="flex gap-4 items-start">
                    {previewImage && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer">
                      <ImageIcon size={18} /> Escolher Imagem
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Dia da semana (apenas para pratos) */}
                {abaAtiva === "pratos" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Dia da Semana</label>
                    <select
                      value={formData.diaSemana || diaSelecionado}
                      onChange={(e) => setFormData({ ...formData, diaSemana: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      {diasDaSemana.map(dia => (
                        <option key={dia} value={dia}>{dia}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-6 border-t flex gap-3">
                <button
                  onClick={salvarEdicao}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-xl font-semibold"
                >
                  Salvar Alterações
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold"
                >
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