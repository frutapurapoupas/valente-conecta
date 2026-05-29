import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Usuario = {
  id: number;
  nome: string;
  whatsapp: string;
  trial_started_at: string;
  trial_end_at: string;
  is_viral_active: boolean;
  viral_activated_at: string | null;
  viral_end_at: string | null;
  pix_key: string | null;
  total_earned: number;
  last_popup_shown: string | null;
};