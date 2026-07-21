import { Item, Demand } from '@/modules-scaffold/types/modules';

/**
 * CatalogStorage: gerencia itens publicados no catÃ¡logo de um mÃ³dulo
 * Uso: localStorage para cliente, depois migra para Supabase
 */
export const CatalogStorage = {
  key: 'modulos_catalogo_itens',

  getAll: (categoria?: string): Item[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(CatalogStorage.key) || '[]';
    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [];
      return categoria ? items.filter((i) => i.categoria === categoria) : items;
    } catch {
      return [];
    }
  },

  saveAll: (items: Item[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CatalogStorage.key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('catalogo_itens_updated'));
  },

  add: (item: Item) => {
    if (typeof window === 'undefined') return;
    const all = CatalogStorage.getAll();
    CatalogStorage.saveAll([...all, item]);
  },

  update: (id: string, updates: Partial<Item>) => {
    if (typeof window === 'undefined') return;
    const all = CatalogStorage.getAll();
    const updated = all.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    CatalogStorage.saveAll(updated);
  },

  remove: (id: string) => {
    if (typeof window === 'undefined') return;
    const all = CatalogStorage.getAll();
    CatalogStorage.saveAll(all.filter((item) => item.id !== id));
  },
};

/**
 * DemandService: gerencia demandas/solicitaÃ§Ãµes de clientes
 */
export const DemandService = {
  key: 'modulos_demandas',

  getAll: (categoria?: string): Demand[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(DemandService.key) || '[]';
    try {
      const parsed = JSON.parse(raw);
      const demands = Array.isArray(parsed) ? parsed : [];
      return categoria ? demands.filter((d) => d.categoria === categoria) : demands;
    } catch {
      return [];
    }
  },

  save: (demands: Demand[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DemandService.key, JSON.stringify(demands));
    window.dispatchEvent(new CustomEvent('demandas_updated'));
  },

  add: (demand: Demand) => {
    if (typeof window === 'undefined') return;
    const all = DemandService.getAll();
    DemandService.save([...all, demand]);
  },

  update: (id: string, updates: Partial<Demand>) => {
    if (typeof window === 'undefined') return;
    const all = DemandService.getAll();
    const updated = all.map((d) =>
      d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
    );
    DemandService.save(updated);
  },
};

/**
 * SupplierStorage: gerencia fornecedores/provedores por mÃ³dulo
 */
export const SupplierStorage = {
  key: 'modulos_fornecedores',

  getAll: (categoria?: string): any[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(SupplierStorage.key) || '[]';
    try {
      const parsed = JSON.parse(raw);
      const suppliers = Array.isArray(parsed) ? parsed : [];
      return categoria ? suppliers.filter((s) => s.categorias?.includes(categoria)) : suppliers;
    } catch {
      return [];
    }
  },

  save: (suppliers: any[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SupplierStorage.key, JSON.stringify(suppliers));
    window.dispatchEvent(new CustomEvent('fornecedores_updated'));
  },

  add: (supplier: any) => {
    if (typeof window === 'undefined') return;
    const all = SupplierStorage.getAll();
    SupplierStorage.save([...all, supplier]);
  },
};

/**
 * UserService: gerencia dados do usuÃ¡rio logado
 */
export const UserService = {
  key: 'modulos_user',

  get: (): any => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(UserService.key);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  save: (user: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(UserService.key, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('user_updated'));
  },

  logout: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(UserService.key);
  },
};

