// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipo completo para a tabela usuarios (baseado na estrutura real)
export type Usuario = {
  id: string;                    // UUID
  nome: string;
  whatsapp: string;
  email?: string;
  telefone?: string;
  wallet: number;
  role: 'user' | 'admin';
  plano?: string;
  trial_started_at: string;
  trial_end_at: string;
  is_viral_active: boolean;
  viral_activated_at: string | null;
  viral_end_at: string | null;
  pix_key: string | null;
  total_earned: number;
  last_popup_shown: string | null;
  codigo_indicacao: string | null;
  convidado_por_id: string | null;
  created_at: string;
  updated_at?: string;
  cidade?: string;
  bairro?: string;
  nivel?: string;
  status_academia?: string;
};

// Tipo para transações
export type Transacao = {
  id: string;
  usuario_id: string;
  tipo: 'credito' | 'debito';
  valor: number;
  descricao: string;
  servico: string;
  saldo_antes: number;
  saldo_depois: number;
  created_at: string;
  status: 'pendente' | 'concluido' | 'cancelado';
};

// Tipo para serviços pagos
export type ServicoPago = {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  tipo: 'corrida' | 'desbloqueio_contato' | 'anuncio_produto' | 'foto_extra' | 'destaque';
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

// Tipo para anúncios
export type Anuncio = {
  id: string;
  usuario_id: string;
  titulo: string;
  descricao: string;
  preco: number;
  fotos: string[];
  localizador_lat: number;
  localizador_lng: number;
  endereco: string;
  contato_nome: string;
  contato_telefone: string;
  liberado: boolean;
  visualizacoes: number;
  created_at: string;
  updated_at: string;
};