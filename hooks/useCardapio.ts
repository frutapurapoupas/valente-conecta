import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export const useCardapio = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [menuRes, recipesRes] = await Promise.all([
        fetch('/api/cozinha/cardapio'),
        fetch('/api/cozinha/recipes')
      ]);
      const menuData = await menuRes.json();
      const recipesData = await recipesRes.json();
      const normalizedMenu = (menuData.success ? menuData.data : []).map((item: any) => ({
        ...item,
        id: String(item.id),
        receitaId: item.receitaId || item.receita_id || item.prato_id || item.recipe_id,
        diaSemana: Number(item.diaSemana ?? item.dia_semana ?? 0),
        periodo: item.periodo || 'almoco',
        isAvailable: item.isAvailable ?? item.is_available ?? item.disponivel ?? true,
      }));

      setMenuItems(Array.isArray(normalizedMenu) ? normalizedMenu : []);
      setRecipes(Array.isArray(recipesData.success ? recipesData.data : []) ? (recipesData.success ? recipesData.data : []) : []);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      setMenuItems([]);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: any) => {
    try {
      const response = await fetch('/api/cozinha/cardapio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        return { success: false, error: 'Endpoint de criação indisponível' };
      }

      const result = await response.json();
      if (result?.success) {
        await carregarDados();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Erro ao criar item do cardápio' };
    }
  };

  const remove = async (id: string) => {
    try {
      const response = await fetch(`/api/cozinha/cardapio?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        return { success: false, error: 'Endpoint de remoção indisponível' };
      }

      const result = await response.json();
      if (result?.success) {
        await carregarDados();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Erro ao remover item do cardápio' };
    }
  };

  const reload = async () => {
    await carregarDados();
    return { success: true };
  };

  useEffect(() => { carregarDados(); }, []);

  return {
    menuItems,
    cardapio: menuItems,
    recipes,
    loading,
    carregarDados,
    create,
    delete: remove,
    reload,
  };
};

