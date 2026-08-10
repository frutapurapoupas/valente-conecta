import { useState, useRef } from "react";
import { Upload, X, Play } from "lucide-react";

interface WizardMidiaProps {
  imagens: File[];
  video?: File;
  onImagensChange: (files: File[]) => void;
  onVideoChange: (file?: File) => void;
}

export function WizardMidia({ imagens, video, onImagensChange, onVideoChange }: WizardMidiaProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImagensUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const novasImagens = [...imagens, ...files];
    onImagensChange(novasImagens);

    const novasPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...novasPreviews]);
  };

  const removeImagem = (index: number) => {
    const novasImagens = imagens.filter((_, i) => i !== index);
    onImagensChange(novasImagens);
    setPreviews(previews.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">📸 Fotos e Vídeo</h2>
        <p className="text-gray-500">Adicione mídias para mostrar seu produto</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fotos do Produto (máximo 10)</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImagem(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {imagens.length < 10 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition flex items-center justify-center flex-col gap-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">Adicionar</span>
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImagensUpload} className="hidden" />
      </div>
    </div>
  );
}

