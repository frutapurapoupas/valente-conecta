// Exports do módulo Cozinha

// Hooks
export { useCompras } from './hooks/useCompras';
export { useComprasRequests } from './hooks/useComprasRequests';
export { useEstoque } from './hooks/useEstoque';
export { usePratos } from './hooks/usePratos';
export { useCardapio } from './hooks/useCardapio';
export { useProducao } from './hooks/useProducao';

// Components
export { DashboardUI } from './components/DashboardUI';
export { PratoList } from './components/PratoList';
export { CatalogoUI } from './components/CatalogoUI';
export { SelecaoPerfilUI } from './components/SelecaoPerfilUI';
export { ModalAssinatura } from './components/ModalAssinatura';
export { ModalRevendedor } from './components/ModalRevendedor';
export { DemandView } from './components/DemandView';

// Tipos dos componentes
export type { DashboardUIProps } from './components/DashboardUI';
export type { PratoListProps } from './components/PratoList';
export type { CatalogoUIProps } from './components/CatalogoUI';
export type { SelecaoPerfilUIProps } from './components/SelecaoPerfilUI';
export type { ModalAssinaturaProps } from './components/ModalAssinatura';
export type { ModalRevendedorProps } from './components/ModalRevendedor';
export type { DemandViewProps } from './components/DemandView';

// Tipos dos hooks
export type { 
  Compra, 
  CompraItem 
} from './hooks/useCompras';

export type { 
  CompraRequest 
} from './hooks/useComprasRequests';

export type { 
  EstoqueItem 
} from './hooks/useEstoque';

export type { 
  Prato 
} from './hooks/usePratos';

export type { 
  CardapioItem 
} from './hooks/useCardapio';

export type { 
  Producao 
} from './hooks/useProducao';

// Tipos do módulo (renomeados para evitar conflitos)
export type { 
  EstoqueType,
  StockMovement 
} from './types/estoque';

export type { 
  PratoType 
} from './types/pratos';

export type { 
  ProducaoType 
} from './types/producao';

export type { 
  CompraType,
  CompraItemType,
  CompraRequestType 
} from './types/compras';

export type { 
  CardapioType,
  CardapioItemType 
} from './types/cardapio';

