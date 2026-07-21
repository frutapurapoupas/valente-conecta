// src/modules/cozinha/index.ts
// ============================================
// EXPORTAÇÕES DO MÓDULO COZINHA
// ============================================

// Types
export * from './types/cozinha.types'

// Hooks
export { useReceitas } from './hooks/useReceitas'

// Services
export { receitaService } from './services/receita.service'

// Utils
export * from './utils/calculos'
export * from './utils/formatadores'
export * from './utils/validadores'

// Components
export { CardMetric } from './components/CardMetric'
