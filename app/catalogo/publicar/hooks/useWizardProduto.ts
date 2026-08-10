import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export interface Categoria {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  slug: string;
  perguntas: Pergunta[];
}

export interface Pergunta {
  id: string;
  label: string;
  tipo: "texto" | "select" | "numero";
  opcoes?: string[];
  obrigatorio: boolean;
}

export function useWizardProduto() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardState, setWizardState] = useState({
    step: 0,
    categoria_id: "",
    respostas: {} as Record<string, any>,
    imagens: [] as File[],
    video: undefined as File | undefined,
    produto: {} as any,
  });

  useEffect(() => {
    setCategorias([
      {
        id: "1",
        nome: "Material Elétrico",
        icone: "âš¡",
        cor: "#f59e0b",
        slug: "material-eletrico",
        perguntas: [
          { id: "p1", label: "Fabricante", tipo: "select", opcoes: ["Tramontina", "Siemens"], obrigatorio: true },
          { id: "p2", label: "Linha", tipo: "select", opcoes: ["Profi", "Home"], obrigatorio: true },
          { id: "p3", label: "Tipo", tipo: "select", opcoes: ["Disjuntor", "Interruptor"], obrigatorio: true },
          { id: "p4", label: "Corrente (A)", tipo: "numero", obrigatorio: true },
        ],
      },
    ]);
    setLoading(false);
  }, []);

  const setCategoria = useCallback((categoriaId: string) => {
    setWizardState(prev => ({ ...prev, categoria_id: categoriaId, step: 1 }));
  }, []);

  const updateRespostas = useCallback((respostas: Record<string, any>) => {
    setWizardState(prev => ({ ...prev, respostas }));
  }, []);

  const updateImagens = useCallback((imagens: File[]) => {
    setWizardState(prev => ({ ...prev, imagens }));
  }, []);

  const updateVideo = useCallback((video?: File) => {
    setWizardState(prev => ({ ...prev, video }));
  }, []);

  const publicar = useCallback(async (sku: string) => {
    toast.success("âœ… Produto publicado com sucesso!");
    return { success: true };
  }, []);

  return {
    categorias,
    loading,
    wizardState,
    setCategoria,
    updateRespostas,
    updateImagens,
    updateVideo,
    publicar,
  };
}

