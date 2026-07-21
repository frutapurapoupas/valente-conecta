interface WizardResumoProps {
  produto: any;
  sku: string;
  imagens: File[];
  video?: File;
  onPublicar: () => void;
  onVoltar: () => void;
}

export function WizardResumo({ produto, sku, imagens, onPublicar, onVoltar }: WizardResumoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">âœ… Confirme os dados</h2>
        <p className="text-gray-500">Revise as informaÃ§Ãµes antes de publicar</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">SKU</span>
          <span className="font-mono font-bold text-blue-600">{sku}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Categoria</span>
          <span>{produto.categoria_nome || "NÃ£o definida"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Imagens</span>
          <span>{imagens.length} foto(s)</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onVoltar} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">
          Voltar
        </button>
        <button onClick={onPublicar} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
          Publicar Produto
        </button>
      </div>
    </div>
  );
}

