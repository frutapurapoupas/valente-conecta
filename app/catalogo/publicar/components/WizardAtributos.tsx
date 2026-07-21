import { useState } from "react";

interface Pergunta {
  id: string;
  label: string;
  placeholder?: string;
  tipo: "texto" | "select" | "numero";
  opcoes?: string[];
  obrigatorio: boolean;
}

interface Categoria {
  id: string;
  nome: string;
  perguntas: Pergunta[];
}

interface WizardAtributosProps {
  categoria: Categoria;
  respostas: Record<string, any>;
  onUpdate: (respostas: Record<string, any>) => void;
}

export function WizardAtributos({ categoria, respostas, onUpdate }: WizardAtributosProps) {
  const [valores, setValores] = useState<Record<string, any>>(respostas);

  const handleChange = (perguntaId: string, valor: any) => {
    const novo = { ...valores, [perguntaId]: valor };
    setValores(novo);
    onUpdate(novo);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">ðŸ“ Preencha os dados do produto</h2>
        <p className="text-gray-500">Responda as perguntas para gerar o SKU automaticamente</p>
      </div>

      <div className="space-y-4">
        {categoria.perguntas.map((pergunta, index) => (
          <div key={pergunta.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-500">Passo {index + 1}</span>
              <span className="text-gray-300">|</span>
              <label className="font-medium">
                {pergunta.label}
                {pergunta.obrigatorio && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {pergunta.tipo === "select" ? (
              <select
                value={valores[pergunta.id] || ""}
                onChange={(e) => handleChange(pergunta.id, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required={pergunta.obrigatorio}
              >
                <option value="">Selecione...</option>
                {pergunta.opcoes?.map((opcao) => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
            ) : (
              <input
                type={pergunta.tipo === "numero" ? "number" : "text"}
                value={valores[pergunta.id] || ""}
                onChange={(e) => handleChange(pergunta.id, e.target.value)}
                placeholder={pergunta.placeholder || `Digite ${pergunta.label.toLowerCase()}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required={pergunta.obrigatorio}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

