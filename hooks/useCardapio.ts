import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export const useCardapio = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [menuRes, recipesRes] = await Promise.all([
        fetch('/api/admin/menu'),
        fetch('/api/admin/recipes')
      ]);
      const menuData = await menuRes.json();
      const recipesData = await recipesRes.json();
      setMenuItems(menuData.success ? menuData.data : []);
      setRecipes(recipesData.success ? recipesData.data : []);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  return { menuItems, recipes, loading, carregarDados };
};