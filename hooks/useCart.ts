import { useState } from "react";
import toast from "react-hot-toast";
interface CartItem { id: number; nome: string; preco: number; quantidade: number; imagem?: string; }
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const addItem = (item: Omit<CartItem, "quantidade">) => { setItems(prev => { const exists = prev.find(i => i.id === item.id); if (exists) return prev.map(i => i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i); return [...prev, { ...item, quantidade: 1 }]; }); toast.success(`${item.nome} adicionado`); };
  const removeItem = (id: number) => { setItems(prev => prev.filter(i => i.id !== id)); toast.success("Item removido"); };
  const updateQuantity = (id: number, quantidade: number) => { if (quantidade <= 0) { removeItem(id); return; } setItems(prev => prev.map(i => i.id === id ? { ...i, quantidade } : i)); };
  const total = items.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  const clear = () => setItems([]);
  return { items, addItem, removeItem, updateQuantity, total, clear, count: items.length };
}
