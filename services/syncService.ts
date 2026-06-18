// ============================================
// SERVIÇO DE SINCRONIZAÇÃO - OFFLINE → SUPABASE
// ============================================

interface SyncQueueItem {
  id: string;
  table: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

class SyncService {
  private syncQueue: SyncQueueItem[] = [];
  private isOnline: boolean = true;
  private supabase: any = null;

  constructor() {
    this.loadQueue();
    this.initNetworkListener();
  }

  // Inicializar ouvintes de rede
  private initNetworkListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Conexão restaurada! Sincronizando dados...');
        this.isOnline = true;
        this.syncAll();
      });
      
      window.addEventListener('offline', () => {
        console.log('📴 Sem conexão. Dados serão salvos localmente.');
        this.isOnline = false;
      });
      
      this.isOnline = navigator.onLine;
    }
  }

  // Carregar fila do localStorage
  private loadQueue() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sync_queue');
      if (saved) {
        try {
          this.syncQueue = JSON.parse(saved);
          console.log(`📋 Fila carregada: ${this.syncQueue.length} itens`);
        } catch (e) {
          console.error('Erro ao carregar fila:', e);
        }
      }
    }
  }

  // Salvar fila no localStorage
  private saveQueue() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    }
  }

  // Adicionar à fila de sincronização
  addToQueue(table: string, action: 'create' | 'update' | 'delete', data: any) {
    const item: SyncQueueItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      table,
      action,
      data,
      timestamp: Date.now(),
      synced: false
    };
    
    this.syncQueue.push(item);
    this.saveQueue();
    
    console.log(`📝 Adicionado à fila: ${table} - ${action}`);
    
    if (this.isOnline && this.supabase) {
      setTimeout(() => this.syncItem(item), 100);
    }
    
    return item.id;
  }

  // Sincronizar um item específico
  private async syncItem(item: SyncQueueItem) {
    if (!this.isOnline || !this.supabase) {
      return false;
    }

    try {
      console.log(`🔄 Sincronizando: ${item.table} - ${item.action}`);
      
      let success = false;
      
      switch (item.table) {
        case 'suppliers':
          success = await this.syncSupplier(item);
          break;
        case 'ingredients':
          success = await this.syncIngredient(item);
          break;
        case 'recipes':
          success = await this.syncRecipe(item);
          break;
        case 'purchases':
          success = await this.syncPurchase(item);
          break;
        case 'stock_movements':
          success = await this.syncStockMovement(item);
          break;
        case 'menu_items':
          success = await this.syncMenuItem(item);
          break;
        default:
          console.log(`⚠️ Tabela não implementada: ${item.table}`);
          return false;
      }
      
      if (success) {
        item.synced = true;
        console.log(`✅ Sincronizado: ${item.table} - ${item.action}`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ Erro ao sincronizar ${item.table}:`, error);
      return false;
    }
  }

  // Sincronizar fornecedor
  private async syncSupplier(item: SyncQueueItem) {
    const { data } = item;
    
    try {
      switch (item.action) {
        case 'create':
          const { error: createError } = await this.supabase
            .from('suppliers')
            .upsert({
              id: data.id,
              name: data.name,
              document: data.document,
              phone: data.phone,
              email: data.email,
              address: data.address,
              contact: data.contact,
              created_at: data.createdAt || new Date().toISOString()
            });
          return !createError;
          
        case 'update':
          const { error: updateError } = await this.supabase
            .from('suppliers')
            .update({
              name: data.name,
              document: data.document,
              phone: data.phone,
              email: data.email,
              address: data.address,
              contact: data.contact
            })
            .eq('id', data.id);
          return !updateError;
          
        case 'delete':
          const { error: deleteError } = await this.supabase
            .from('suppliers')
            .delete()
            .eq('id', data.id);
          return !deleteError;
          
        default:
          return false;
      }
    } catch (error) {
      console.error('Erro syncSupplier:', error);
      return false;
    }
  }

  // Sincronizar ingrediente
  private async syncIngredient(item: SyncQueueItem) {
    const { data } = item;
    
    try {
      switch (item.action) {
        case 'create':
          const { error: createError } = await this.supabase
            .from('ingredients')
            .upsert({
              id: data.id,
              name: data.name,
              category: data.category,
              unit: data.unit,
              stock: data.stock || 0,
              min_stock: data.minStock || 0,
              current_price: data.currentPrice,
              created_at: data.createdAt || new Date().toISOString()
            });
          return !createError;
          
        case 'update':
          const { error: updateError } = await this.supabase
            .from('ingredients')
            .update({
              name: data.name,
              category: data.category,
              unit: data.unit,
              stock: data.stock,
              min_stock: data.minStock,
              current_price: data.currentPrice
            })
            .eq('id', data.id);
          return !updateError;
          
        case 'delete':
          const { error: deleteError } = await this.supabase
            .from('ingredients')
            .delete()
            .eq('id', data.id);
          return !deleteError;
          
        default:
          return false;
      }
    } catch (error) {
      console.error('Erro syncIngredient:', error);
      return false;
    }
  }

  // Sincronizar receita
  private async syncRecipe(item: SyncQueueItem) {
    const { data } = item;
    
    try {
      switch (item.action) {
        case 'create':
          const { error: createError } = await this.supabase
            .from('recipes')
            .upsert({
              id: data.id,
              name: data.name,
              description: data.description,
              category: data.category,
              selling_price: data.sellingPrice,
              cost_price: data.costPrice,
              profit_margin: data.profitMargin,
              is_active: data.isActive,
              preparation_time: data.preparationTime,
              created_at: data.createdAt || new Date().toISOString()
            });
          return !createError;
          
        case 'update':
          const { error: updateError } = await this.supabase
            .from('recipes')
            .update({
              name: data.name,
              description: data.description,
              category: data.category,
              selling_price: data.sellingPrice,
              cost_price: data.costPrice,
              profit_margin: data.profitMargin,
              is_active: data.isActive,
              preparation_time: data.preparationTime
            })
            .eq('id', data.id);
          return !updateError;
          
        case 'delete':
          const { error: deleteError } = await this.supabase
            .from('recipes')
            .delete()
            .eq('id', data.id);
          return !deleteError;
          
        default:
          return false;
      }
    } catch (error) {
      console.error('Ergo syncRecipe:', error);
      return false;
    }
  }

  // Sincronizar compra
  private async syncPurchase(item: SyncQueueItem) {
    const { data } = item;
    
    try {
      switch (item.action) {
        case 'create':
          const { error: createError } = await this.supabase
            .from('purchases')
            .upsert({
              id: data.id,
              supplier_id: data.supplierId,
              date: data.date,
              status: data.status,
              total_amount: data.totalAmount,
              notes: data.notes,
              created_at: data.createdAt || new Date().toISOString()
            });
          return !createError;
          
        case 'update':
          const { error: updateError } = await this.supabase
            .from('purchases')
            .update({
              status: data.status,
              total_amount: data.totalAmount
            })
            .eq('id', data.id);
          return !updateError;
          
        case 'delete':
          const { error: deleteError } = await this.supabase
            .from('purchases')
            .delete()
            .eq('id', data.id);
          return !deleteError;
          
        default:
          return false;
      }
    } catch (error) {
      console.error('Erro syncPurchase:', error);
      return false;
    }
  }

  // Sincronizar movimentação de estoque
  private async syncStockMovement(item: SyncQueueItem) {
    const { data } = item;
    
    if (item.action !== 'create') return false;
    
    try {
      const { error } = await this.supabase
        .from('stock_movements')
        .upsert({
          id: data.id,
          ingredient_id: data.ingredientId,
          type: data.type,
          quantity: data.quantity,
          reason: data.reason,
          reference_id: data.referenceId,
          user_id: data.userId,
          created_at: data.createdAt || new Date().toISOString()
        });
      return !error;
    } catch (error) {
      console.error('Erro syncStockMovement:', error);
      return false;
    }
  }

  // Sincronizar item do cardápio
  private async syncMenuItem(item: SyncQueueItem) {
    const { data } = item;
    
    try {
      switch (item.action) {
        case 'create':
          const { error: createError } = await this.supabase
            .from('menu_items')
            .upsert({
              id: data.id,
              recipe_id: data.recipeId,
              day_of_week: data.dayOfWeek,
              period: data.period,
              custom_price: data.customPrice,
              is_available: data.isAvailable,
              created_at: data.createdAt || new Date().toISOString()
            });
          return !createError;
          
        case 'update':
          const { error: updateError } = await this.supabase
            .from('menu_items')
            .update({
              day_of_week: data.dayOfWeek,
              period: data.period,
              custom_price: data.customPrice,
              is_available: data.isAvailable
            })
            .eq('id', data.id);
          return !updateError;
          
        case 'delete':
          const { error: deleteError } = await this.supabase
            .from('menu_items')
            .delete()
            .eq('id', data.id);
          return !deleteError;
          
        default:
          return false;
      }
    } catch (error) {
      console.error('Erro syncMenuItem:', error);
      return false;
    }
  }

  // Sincronizar todos os itens pendentes
  async syncAll() {
    if (!this.isOnline || !this.supabase) {
      console.log('⚠️ Não é possível sincronizar: offline ou Supabase não configurado');
      return { synced: 0, pending: this.syncQueue.filter(i => !i.synced).length };
    }

    const pending = this.syncQueue.filter(i => !i.synced);
    console.log(`🔄 Sincronizando ${pending.length} itens pendentes...`);
    
    let syncedCount = 0;
    
    for (const item of pending) {
      const success = await this.syncItem(item);
      if (success) {
        syncedCount++;
      }
    }
    
    // Remover itens já sincronizados
    this.syncQueue = this.syncQueue.filter(item => !item.synced);
    this.saveQueue();
    
    console.log(`✅ Sincronização concluída: ${syncedCount} sincronizados, ${this.syncQueue.length} pendentes`);
    
    return { synced: syncedCount, pending: this.syncQueue.length };
  }

  // Obter status da sincronização (CORRIGIDO - com verificação localStorage)
  getSyncStatus() {
    const pending = this.syncQueue.filter(i => !i.synced);
    let lastSync = 'never';
    if (typeof window !== 'undefined') {
      lastSync = localStorage.getItem('last_sync') || 'never';
    }
    return {
      isOnline: this.isOnline,
      hasSupabase: !!this.supabase,
      pendingCount: pending.length,
      pendingItems: pending,
      lastSync: lastSync
    };
  }

  // Configurar Supabase
  setSupabase(supabaseClient: any) {
    this.supabase = supabaseClient;
    console.log('🔌 Supabase configurado no serviço de sincronização');
    if (this.isOnline && this.supabase) {
      this.syncAll();
    }
  }

  // Importar dados do SQLite para Supabase
  async importFromSQLite(data: {
    suppliers?: any[];
    ingredients?: any[];
    recipes?: any[];
    purchases?: any[];
    stockMovements?: any[];
    menuItems?: any[];
  }) {
    if (!this.isOnline || !this.supabase) {
      console.error('❌ Não é possível importar: offline ou Supabase não configurado');
      return { success: false, error: 'Offline ou Supabase não disponível' };
    }

    const results = {
      suppliers: 0,
      ingredients: 0,
      recipes: 0,
      purchases: 0,
      stockMovements: 0,
      menuItems: 0,
      errors: [] as string[]
    };

    // Importar fornecedores
    if (data.suppliers) {
      for (const supplier of data.suppliers) {
        const { error } = await this.supabase
          .from('suppliers')
          .upsert({
            id: supplier.id,
            name: supplier.name,
            document: supplier.document,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            contact: supplier.contact,
            created_at: supplier.createdAt
          });
        
        if (!error) results.suppliers++;
        else results.errors.push(`Supplier ${supplier.name}: ${error.message}`);
      }
    }

    // Importar ingredientes
    if (data.ingredients) {
      for (const ingredient of data.ingredients) {
        const { error } = await this.supabase
          .from('ingredients')
          .upsert({
            id: ingredient.id,
            name: ingredient.name,
            category: ingredient.category,
            unit: ingredient.unit,
            stock: ingredient.stock,
            min_stock: ingredient.minStock,
            current_price: ingredient.currentPrice,
            created_at: ingredient.createdAt
          });
        
        if (!error) results.ingredients++;
        else results.errors.push(`Ingredient ${ingredient.name}: ${error.message}`);
      }
    }

    // Importar receitas
    if (data.recipes) {
      for (const recipe of data.recipes) {
        const { error } = await this.supabase
          .from('recipes')
          .upsert({
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
            category: recipe.category,
            selling_price: recipe.sellingPrice,
            cost_price: recipe.costPrice,
            profit_margin: recipe.profitMargin,
            is_active: recipe.isActive,
            preparation_time: recipe.preparationTime,
            created_at: recipe.createdAt
          });
        
        if (!error) results.recipes++;
        else results.errors.push(`Recipe ${recipe.name}: ${error.message}`);
      }
    }

    // Importar compras
    if (data.purchases) {
      for (const purchase of data.purchases) {
        const { error } = await this.supabase
          .from('purchases')
          .upsert({
            id: purchase.id,
            supplier_id: purchase.supplierId,
            date: purchase.date,
            status: purchase.status,
            total_amount: purchase.totalAmount,
            notes: purchase.notes,
            created_at: purchase.createdAt
          });
        
        if (!error) results.purchases++;
        else results.errors.push(`Purchase ${purchase.id}: ${error.message}`);
      }
    }

    // Importar itens do cardápio
    if (data.menuItems) {
      for (const menuItem of data.menuItems) {
        const { error } = await this.supabase
          .from('menu_items')
          .upsert({
            id: menuItem.id,
            recipe_id: menuItem.recipeId,
            day_of_week: menuItem.dayOfWeek,
            period: menuItem.period,
            custom_price: menuItem.customPrice,
            is_available: menuItem.isAvailable,
            created_at: menuItem.createdAt
          });
        
        if (!error) results.menuItems++;
        else results.errors.push(`MenuItem ${menuItem.id}: ${error.message}`);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('last_sync', new Date().toISOString());
    }
    
    return { success: true, results };
  }

  // Limpar fila (útil para testes)
  clearQueue() {
    this.syncQueue = [];
    this.saveQueue();
    console.log('🗑️ Fila de sincronização limpa');
  }
}

export const syncService = new SyncService();