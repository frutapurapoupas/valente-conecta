-- ═══════════════════════════════════════════════════════════════════════════
-- CARROSSEL / LEILÃO DE PUBLICIDADE
-- Valente Conecta — anúncios no app (vitrine semanal)
-- Execute este script no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Leilões semanais ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auction_leiloes (
  id         TEXT PRIMARY KEY,
  semana     TEXT NOT NULL,            -- ex: "14/04 – 20/04/2026"
  status     TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'encerrado', 'publicado')),
  encerra_em TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 2. Slots de cada leilão (3 por semana) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS auction_slots (
  id          SERIAL PRIMARY KEY,
  leilao_id   TEXT NOT NULL REFERENCES auction_leiloes(id) ON DELETE CASCADE,
  slot        INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 3),
  disponivel  BOOLEAN NOT NULL DEFAULT true,
  lance_atual NUMERIC(10,2) NOT NULL DEFAULT 0,
  vencedor    TEXT,                    -- nome da empresa vencedora
  imagem_url  TEXT,
  UNIQUE (leilao_id, slot)
);

CREATE INDEX IF NOT EXISTS auction_slots_leilao_idx ON auction_slots(leilao_id);

-- ─── 3. Anúncios aprovados / histórico ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS auction_anuncios (
  id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  empresa            TEXT NOT NULL,
  imagem_url         TEXT NOT NULL DEFAULT '',
  semana             TEXT NOT NULL,
  slot_ganho         INTEGER NOT NULL CHECK (slot_ganho BETWEEN 1 AND 3),
  valor_pago         NUMERIC(10,2) NOT NULL DEFAULT 0,
  status_aprovacao   TEXT NOT NULL DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auction_anuncios_status_idx ON auction_anuncios(status_aprovacao);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA — leilão ativo + anúncios pendentes da semana anterior
-- ═══════════════════════════════════════════════════════════════════════════

-- Leilão ativo (semana atual)
INSERT INTO auction_leiloes (id, semana, status, encerra_em) VALUES
  ('leilao-2026-w16', '14/04 – 20/04/2026', 'aberto', now() + INTERVAL '22 hours')
ON CONFLICT (id) DO NOTHING;

-- Slots do leilão ativo
INSERT INTO auction_slots (leilao_id, slot, disponivel, lance_atual, vencedor, imagem_url) VALUES
  ('leilao-2026-w16', 1, true,  85.00, 'Mercadinho Bom Preço', null),
  ('leilao-2026-w16', 2, true,  60.00, 'Farmácia Saúde',       null),
  ('leilao-2026-w16', 3, true,  35.00, null,                   null)
ON CONFLICT (leilao_id, slot) DO NOTHING;

-- Anúncios da semana anterior (para histórico/aprovação)
INSERT INTO auction_anuncios (id, empresa, imagem_url, semana, slot_ganho, valor_pago, status_aprovacao) VALUES
  ('a1', 'Mercadinho Bom Preço', '', '07/04 – 13/04', 1, 85.00, 'aprovado'),
  ('a2', 'Farmácia Saúde',       '', '07/04 – 13/04', 2, 60.00, 'pendente'),
  ('a3', 'Açougue Leblon',       '', '07/04 – 13/04', 3, 35.00, 'pendente')
ON CONFLICT (id) DO NOTHING;
