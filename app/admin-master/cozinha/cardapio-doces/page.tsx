"use client";

import { Save, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Doce {
  id: number;
  name: string;
  price: number;
  partnerPrice: number;
  description: string;
  popular: boolean;
  image: string;
}

const docesPadrao: Doce[] = [
  { id: 101, name: "Pudim de Leite", price: 8, partnerPrice: 6, description: "Pudim tradicional com calda de caramelo", popular: true, image: "/doces/pudim.jpg" },
  { id: 102, name: "Bolo de Chocolate", price: 12, partnerPrice: 9, description: "Bolo fofinho com cobertura de chocolate", popular: true, image: "/doces/bolo-chocolate.jpg" },
  { id: 103, name: "Torta de Limão", price: 10, partnerPrice: 7, description: "Torta cremosa com merengue", popular: false, image: "/doces/torta-limao.jpg" },
  { id: 104, name: "Brigadeiro", price: 5, partnerPrice: 3.50, description: "Brigadeiro gourmet", popular: false, image: "/doces/brigadeiro.jpg" }
];

export default function AdminCardapioDocesPage() {
  const [doces, setDoces] = useState<Doce[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "", price: 0, partnerPrice: 0, description: "", popular: false, image: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cozinha_cardapio_doces_imagens");
    if (stored) {
      const imagens = JSON.parse(stored);
      setDoces(docesPadrao.map(d => ({
        ...d,
        image: imagens[d.name] || d.image
      })));
    } else {
      setDoces(docesPadrao);
    }
  }, []);

  const salvarTodasImagens = () => {
    const imagens: Record<string, string> = {};
    doces.forEach(d => {
      imagens[d.name] = d.image;
    });
    localStorage.setItem("cozinha_cardapio_doces_imagens", JSON.stringify(imagens));
    alert("✅ Todas as imagens salvas! O cardápio dos usuários será atualizado.");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (doce: Doce) => {
    setEditingId(doce.id);
    setFormData({
      name: doce.name,
      price: doce.price,
      partnerPrice: doce.partnerPrice,
      description: doce.description,
      popular: doce.popular,
      image: doce.image
    });
    setPreviewImage(doce.image);
    setShowModal(true);
  };

  const salvarEdicao = () => {
    if (editingId) {
      let novaImagem = formData.image;
      if (selectedFile) {
        novaImagem = previewImage;
      }
      const novosDoces = doces.map(d => d.id === editingId ? { ...d, ...formData, image: novaImagem } : d);
      setDoces(novosDoces);
    }
    setShowModal(false);
    setEditingId(null);
    setSelectedFile(null);
    setPreviewImage("");
    alert("✅ Doce atualizado! Clique em 'Salvar Todas as Imagens' para aplicar.");
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-gray-800">✏️ Editar Doce</h3><button onClick={() => setShowModal(false)}>✕</button></div>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {previewImage ? (<img src={previewImage} alt="Preview" className="w-full h-32 object-cover rounded-lg" />) : (<><Upload size={32} className="mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">Clique para substituir a imagem</p></>)}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded-lg text-gray-800 bg-white" />
              <div className="grid grid-cols-2 gap-2"><input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} placeholder="Preço normal" className="w-full p-2 border rounded-lg" /><input type="number" step="0.01" value={formData.partnerPrice} onChange={(e) => setFormData({ ...formData, partnerPrice: parseFloat(e.target.value) })} placeholder="Preço parceiro" className="w-full p-2 border rounded-lg" /></div>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-lg h-20" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.popular} onChange={(e) => setFormData({ ...formData, popular: e.target.checked })} /> 🔥 Popular</label>
              <button onClick={salvarEdicao} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">Salvar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-800">🍰 Cardápio de Doces</h1><p className="text-sm text-gray-500">Clique no card para editar a imagem</p></div>
        <button onClick={salvarTodasImagens} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Save size={16} /> Salvar Todas as Imagens</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {doces.map(doce => (
          <div key={doce.id} className="border rounded-lg p-3 hover:shadow-md transition cursor-pointer" onClick={() => openEditModal(doce)}>
            <img src={doce.image} alt={doce.name} className="w-full h-40 object-cover rounded-lg mb-2" />
            <h4 className="font-bold text-gray-800">{doce.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{doce.description}</p>
            <div className="flex justify-between mt-2"><span className="text-sm font-bold text-green-600">R$ {doce.price.toFixed(2)}</span><span className="text-xs text-blue-600">👆 Clique para editar</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}