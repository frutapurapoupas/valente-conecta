export const SupplierStorage = {
  key: 'fornecedores_servicos',

  getAll: (): any[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(SupplierStorage.key) || localStorage.getItem('fornecedores') || '[]';
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveAll: (suppliers: any[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SupplierStorage.key, JSON.stringify(suppliers));
    window.dispatchEvent(new CustomEvent('fornecedores_servicos_updated'));
  },

  add: (supplier: any) => {
    if (typeof window === 'undefined') return;
    const list = SupplierStorage.getAll();
    list.push(supplier);
    SupplierStorage.saveAll(list);
  }
};
