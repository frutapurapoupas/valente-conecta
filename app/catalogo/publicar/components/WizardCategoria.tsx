interface Categoria {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  slug: string;
}

interface WizardCategoriaProps {
  categorias: Categoria[];
  selected: string;
  onSelect: (categoriaId: string) => void;
}

export function WizardCategoria({ categorias, selected, onSelect }: WizardCategoriaProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">ðŸ“¦ O que vocÃª quer publicar?</h2>
        <p className="text-gray-500">Escolha a categoria do seu produto ou serviÃ§o</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`p-4 rounded-2xl border-2 transition-all text-center
              ${selected === cat.id 
                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
          >
            <div className="text-4xl mb-2">{cat.icone}</div>
            <div className="font-medium">{cat.nome}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

