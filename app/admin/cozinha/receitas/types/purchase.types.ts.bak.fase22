export interface ListaCompraItem {
  id: string;
  recipeName: string;
  ingredientId: string;
  ingredientName: string;
  quantidade: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  currentStock: number;
  status: 'pendente' | 'aprovado' | 'comprado';
  selected: boolean;
  createdAt: string;
}

export interface PurchaseList {
  id: string;
  name: string;
  recipeId: string;
  recipeName: string;
  quantidadeProducao: number;
  createdAt: string;
  status: 'rascunho' | 'aprovado' | 'enviado' | 'comprado';
  items: ListaCompraItem[];
  totalCost: number;
  approvedAt?: string;
  sentAt?: string;
  purchasedAt?: string;
}