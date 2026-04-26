/**
 * SUPABASE CLIENT COM SWITCH MOCK/REAL
 * Permite alternar entre dados fictícios e dados reais
 * Controlado pela variável de ambiente USE_MOCK
 */

import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey } from './supabase-config'
import { mockSupabase, shouldUseMock } from './mock/mock-supabase'

// Cliente real do Supabase
const realSupabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente que alterna entre mock e real
export const supabase = shouldUseMock() ? mockSupabase : realSupabase

// Exportar função para verificar modo atual
export const isMockMode = () => shouldUseMock()

// Exportar ambos os clientes para uso avançado
export { realSupabase, mockSupabase }
