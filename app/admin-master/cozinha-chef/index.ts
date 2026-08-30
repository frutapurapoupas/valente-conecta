// Exports do módulo Cozinha
// Hooks
export { useCompras } from './hooks/useCompras';
export { useComprasRequests } from './hooks/useComprasRequests';
export { useEstoque } from './hooks/useEstoque';
export { useCardapio } from './hooks/useCardapio';
export { useProducao } from './hooks/useProducao';

// Components
export { DashboardUI } from './components/DashboardUI';

// Tipos dos hooks
export type { CompraItem } from './hooks/useCompras';
export type { CompraRequest } from './hooks/useComprasRequests';
export type { EstoqueItem } from './hooks/useEstoque';
export type { Producao } from './hooks/useProducao';

// Tipos do módulo
export type { EstoqueType, StockMovement } from './types/estoque';
export type { ProducaoType } from './types/producao';
export type { CompraType, CompraItemType, CompraRequestType } from './types/compras';