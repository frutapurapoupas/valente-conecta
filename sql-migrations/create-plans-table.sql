-- ═══════════════════════════════════════════════════════════════════════════
-- PLANOS DE COMISSÃO
-- Valente Conecta — planos de parceria para lojistas
-- Execute este script no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS plans (
  id         SERIAL PRIMARY KEY,
  nome       TEXT NOT NULL,
  taxa       NUMERIC(5,2) NOT NULL DEFAULT 10,  -- taxa de comissão em %
  cor        TEXT NOT NULL DEFAULT 'text-zinc-400',
  border     TEXT NOT NULL DEFAULT 'border-zinc-700/30',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed: os 3 planos iniciais
INSERT INTO plans (id, nome, taxa, cor, border) VALUES
  (1, 'Premium Gold', 10, 'text-amber-500',  'border-amber-500/30'),
  (2, 'Master Black',  8, 'text-zinc-100',   'border-zinc-500/30'),
  (3, 'Basic Silver', 15, 'text-zinc-400',   'border-zinc-700/30')
ON CONFLICT (id) DO NOTHING;

-- Reinicia a sequência para não colidir com seeds
SELECT setval('plans_id_seq', (SELECT MAX(id) FROM plans));
