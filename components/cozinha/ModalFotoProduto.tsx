'use client';

import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface ModalFotoProdutoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  currentImage?: string;
  produtoNome?: string;
  // 🔥 ADICIONADO: suporte para id / produtoId
  id?: string;
  produtoId?: string;
  entityId?: string;
  tipo?: string;
}

export default function ModalFotoProduto({
  isOpen,
  onClose,
  onSave,
  currentImage,
  produtoNome = 'Produto',
  id,
  produtoId,
  entityId,
  tipo = 'receita'
}: ModalFotoProdutoProps) {
  const [imagemUrl, setImagemUrl] = useState(currentImage || '');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState(currentImage || '');
  const [uploading, setUploading] = useState(false);

  // Determinar o ID do produto (qualquer que seja o nome da prop)
  const produtoIdFinal = id || produtoId || entityId || '';

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivo(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!arquivo) {
      if (imagemUrl) {
        onSave(imagemUrl);
        onClose();
      }
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', arquivo);
      formData.append('type', tipo || 'recipes');
      if (produtoIdFinal) {
        formData.append('entityId', produtoIdFinal);
      }

      const response = await fetch('/api/cozinha/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onSave(data.url);
        onClose();
      } else {
        alert('Erro ao fazer upload da imagem');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">📸 Foto do Produto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {produtoNome || `ID: ${produtoIdFinal || 'Novo'}`}
        </p>

        <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-gray-400">
              <ImageIcon size={48} className="mx-auto mb-2" />
              <span className="text-sm">Nenhuma imagem</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar imagem</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP até 5MB</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ou coloque a URL da imagem</label>
          <input
            type="text"
            value={imagemUrl}
            onChange={(e) => setImagemUrl(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium">
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || (!arquivo && !imagemUrl)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <span className="animate-spin">⏳</span> Enviando...
              </>
            ) : (
              <>
                <Upload size={16} /> Salvar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}