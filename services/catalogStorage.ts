export interface CatalogItem {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  preco: number;
  imagem?: string;
  telefone?: string;
  fornecedorId?: string;
  fornecedorNome?: string;
  status: 'pendente' | 'publicado';
  createdAt: string;
  updatedAt: string;
}

export const CatalogStorage = {
  key: 'catalogo_itens',

  getAll: (): CatalogItem[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(CatalogStorage.key) || '[]';
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveAll: (items: CatalogItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CatalogStorage.key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('catalogo_itens_updated'));
  },

  add: (item: CatalogItem) => {
    if (typeof window === 'undefined') return;
    const all = CatalogStorage.getAll();
    CatalogStorage.saveAll([...all, item]);
  },

  update: (id: string, updates: Partial<CatalogItem>) => {
    if (typeof window === 'undefined') return;
    const all = CatalogStorage.getAll();
    const updated = all.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item);
    CatalogStorage.saveAll(updated);
  },

  remove: (id: string) => {
    if (typeof window === 'undefined') return;
    const all = CatalogStorage.getAll();
    CatalogStorage.saveAll(all.filter(item => item.id !== id));
  }
};
