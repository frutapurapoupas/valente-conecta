// components/ambulantes/UploadFotoProduto.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Camera } from 'lucide-react';

interface UploadFotoProdutoProps {
  produtoId: string;
  onUploadComplete: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  maxFotos?: number;
  fotosExistentes?: string[];
}

export function UploadFotoProduto({
  produtoId,
  onUploadComplete,
  onUploadError,
  maxFotos = 5,
  fotosExistentes = [],
}: UploadFotoProdutoProps) {
  const [fotos, setFotos] = useState<string[]>(fotosExistentes);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > 800) {
            height = (height * 800) / width;
            width = 800;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Erro ao comprimir imagem'));
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    });
  }, []);

  const uploadFotos = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    
    if (fotos.length + totalFiles > maxFotos) {
      onUploadError?.(`Máximo de ${maxFotos} fotos por produto`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    const uploadedUrls: string[] = [];

    for (let i = 0; i < totalFiles; i++) {
      try {
        const file = fileArray[i];
        
        // Validar tipo
        if (!file.type.startsWith('image/')) {
          onUploadError?.(`${file.name} não é uma imagem válida`);
          continue;
        }

        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          onUploadError?.(`${file.name} excede 5MB`);
          continue;
        }

        // Comprimir imagem
        const compressedFile = await compressImage(file);
        
        // Simular upload (substituir por chamada real ao Supabase Storage)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Gerar URL local para preview (mock)
        const url = URL.createObjectURL(compressedFile);
        uploadedUrls.push(url);
        
        setUploadProgress(((i + 1) / totalFiles) * 100);
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        onUploadError?.(`Erro ao processar ${fileArray[i].name}`);
      }
    }

    const novasFotos = [...fotos, ...uploadedUrls];
    setFotos(novasFotos);
    onUploadComplete(novasFotos);
    setUploading(false);
    setUploadProgress(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [fotos, maxFotos, onUploadComplete, onUploadError, compressImage]);

  const removerFoto = useCallback((index: number) => {
    const novasFotos = fotos.filter((_, i) => i !== index);
    setFotos(novasFotos);
    onUploadComplete(novasFotos);
  }, [fotos, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFotos(files);
    }
  }, [uploadFotos]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFotos(e.target.files);
    }
  }, [uploadFotos]);

  return (
    <div className="space-y-4">
      {/* Preview das fotos */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {fotos.map((foto, index) => (
            <div key={index} className="relative group">
              <img
                src={foto}
                alt={`Foto ${index + 1}`}
                className="w-full aspect-square object-cover rounded-lg border"
              />
              <button
                onClick={() => removerFoto(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Área de upload */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all hover:border-blue-500 hover:bg-blue-50
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-3">
            <Loader2 size={32} className="mx-auto text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">Enviando fotos...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{Math.round(uploadProgress)}%</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-center mb-2">
              {fotos.length === 0 ? (
                <Camera size={48} className="text-gray-400" />
              ) : (
                <Upload size={48} className="text-gray-400" />
              )}
            </div>
            <p className="text-gray-600">
              {fotos.length === 0 ? 'Clique ou arraste fotos aqui' : 'Adicionar mais fotos'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {fotos.length} de {maxFotos} fotos • Máx 5MB por foto
            </p>
            <div className="flex gap-2 justify-center mt-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                {fotos.length === 0 ? 'Selecionar Fotos' : 'Adicionar mais'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}