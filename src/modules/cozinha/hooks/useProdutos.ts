import { useState, useEffect, useCallback } from "react";

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria?: string;
  imagem?: string;
  disponivel?: boolean;
}

const MOCK_PRODUTOS: Produto[] = [
  { id: "1", nome: "Pizza Margherita", descricao: "Molho de tomate, mussarela, manjericão", preco: 45.90, categoria: "Pizzas", disponivel: true },
  { id: "2", nome: "Hambúrguer Artesanal", descricao: "Pão brioche, carne 180g, queijo, bacon", preco: 32.90, categoria: "Hambúrgueres", disponivel: true },
  { id: "3", nome: "Salada Caesar", descricao: "Alface, frango, parmesão, croutons", preco: 28.90, categoria: "Saladas", disponivel: true },
];

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      setProdutos(MOCK_PRODUTOS);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, []);

  return { produtos, loading, error, carregarProdutos: carregar };
}
