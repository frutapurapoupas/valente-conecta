-- ═══════════════════════════════════════════════════════════════════════════
-- ACADEMIA / GYM TABLES
-- Valente Conecta — módulo Academia
-- Execute este script no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Unidades de academia ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym_units (
  id          SERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  responsavel TEXT NOT NULL DEFAULT '',
  cidade      TEXT NOT NULL DEFAULT '',
  contato     TEXT NOT NULL DEFAULT '',
  endereco    TEXT NOT NULL DEFAULT '',
  localizador TEXT NOT NULL DEFAULT '',
  alunos      INTEGER NOT NULL DEFAULT 0,
  ativa       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 2. Alunos / membros das academias ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym_members (
  id              SERIAL PRIMARY KEY,
  nome            TEXT NOT NULL,
  foto            TEXT NOT NULL DEFAULT '',
  plano           TEXT NOT NULL DEFAULT 'gratuito' CHECK (plano IN ('gratuito', 'basico')),
  gym_unit_id     INTEGER REFERENCES gym_units(id) ON DELETE SET NULL,
  academia        TEXT NOT NULL DEFAULT '',    -- nome desnormalizado para leitura rápida
  whatsapp        TEXT NOT NULL DEFAULT '',
  ultimo_checkin  DATE,
  total_checkins  INTEGER NOT NULL DEFAULT 0,
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- índice para filtros por academia e plano
CREATE INDEX IF NOT EXISTS gym_members_gym_unit_id_idx ON gym_members(gym_unit_id);
CREATE INDEX IF NOT EXISTS gym_members_plano_idx       ON gym_members(plano);

-- ─── 3. Funcionalidades por plano ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym_funcionalidades (
  id             TEXT PRIMARY KEY,
  label          TEXT NOT NULL,
  plano_gratuito BOOLEAN NOT NULL DEFAULT false,
  plano_basico   BOOLEAN NOT NULL DEFAULT true,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 4. Carrossel de publicidade (admin configura) ───────────────────────────
CREATE TABLE IF NOT EXISTS gym_carrossel (
  slot       INTEGER PRIMARY KEY CHECK (slot BETWEEN 1 AND 3),
  url        TEXT NOT NULL DEFAULT '',
  titulo     TEXT NOT NULL DEFAULT '',
  destino    TEXT NOT NULL DEFAULT '/',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. Histórico de campanhas push ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym_campanhas (
  id            SERIAL PRIMARY KEY,
  titulo        TEXT NOT NULL,
  mensagem      TEXT NOT NULL,
  destinatarios INTEGER NOT NULL DEFAULT 0,
  tipo          TEXT NOT NULL DEFAULT 'campanha' CHECK (tipo IN ('incentivo', 'campanha')),
  enviado_em    TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════

-- Unidades
INSERT INTO gym_units (nome, responsavel, cidade, contato, endereco, localizador, alunos, ativa) VALUES
  ('Academia Valente Fit', 'Carlos Andrade', 'Valente-BA', '(75) 99999-1111', 'Rua das Flores, 120 – Centro, Valente-BA',        'https://maps.google.com/?q=Academia+Valente+Fit',   156, true),
  ('Studio Move',          'Daniela Souza',  'Valente-BA', '(75) 98888-2222', 'Av. João Pessoa, 45 – Novo Horizonte, Valente-BA', 'https://maps.google.com/?q=Studio+Move+Valente',    78,  true),
  ('CrossFit Sertão',      'Roberto Lima',   'Valente-BA', '(75) 97777-3333', 'Rua do Comércio, 88 – Industrial, Valente-BA',    'https://maps.google.com/?q=CrossFit+Sertao+Valente',34,  false)
ON CONFLICT DO NOTHING;

-- Alunos (vinculados pelo nome da academia — simplificado)
INSERT INTO gym_members (nome, plano, gym_unit_id, academia, whatsapp, ultimo_checkin, total_checkins, ativo) VALUES
  ('João Silva',     'basico',   1, 'Academia Valente Fit', '75999991001', '2026-04-10', 45, true),
  ('Maria Oliveira', 'basico',   1, 'Academia Valente Fit', '75999991002', '2026-04-08', 38, true),
  ('Pedro Costa',    'gratuito', 2, 'Studio Move',          '75999991003', '2026-04-10', 12, true),
  ('Ana Paula',      'gratuito', 1, 'Academia Valente Fit', '75999991004', '2026-03-27',  5, true),
  ('Carlos Eduardo', 'basico',   2, 'Studio Move',          '75999991005', '2026-03-20',  3, true),
  ('Fernanda Lima',  'gratuito', 3, 'CrossFit Sertão',      '75999991006', '2026-04-10', 60, true),
  ('Lucas Mendes',   'gratuito', 1, 'Academia Valente Fit', '75999991007', '2026-03-11',  2, true),
  ('Beatriz Santos', 'basico',   2, 'Studio Move',          '75999991008', '2026-04-09', 29, true),
  ('Rafael Pereira', 'gratuito', 1, 'Academia Valente Fit', '75999991009', '2026-04-03',  8, false),
  ('Juliana Ramos',  'basico',   3, 'CrossFit Sertão',      '75999991010', '2026-04-07', 22, true)
ON CONFLICT DO NOTHING;

-- Funcionalidades
INSERT INTO gym_funcionalidades (id, label, plano_gratuito, plano_basico) VALUES
  ('treinos_guiados',     'Treinos Guiados',         true,  true),
  ('chat_personal',       'Chat com Personal',        false, true),
  ('relatorio_progresso', 'Relatório de Progresso',   false, true),
  ('aulas_ao_vivo',       'Aulas ao Vivo',             false, true),
  ('plano_nutricional',   'Plano Nutricional',         false, true),
  ('avaliacao_fisica',    'Avaliação Física',          false, true),
  ('desconto_parceiros',  'Desconto em Parceiros',     false, true),
  ('carrossel_ads',       'Ver anúncios no app',       true,  false)
ON CONFLICT (id) DO NOTHING;

-- Carrossel (3 slots)
INSERT INTO gym_carrossel (slot, url, titulo, destino) VALUES
  (1, '', 'Oferta Especial — 3x na semana', '/'),
  (2, '', 'Parceiro: Nutrição Sertão',       '/'),
  (3, '', 'Upgrade para Plano Básico',       '/academia')
ON CONFLICT (slot) DO NOTHING;

-- Campanhas iniciais
INSERT INTO gym_campanhas (titulo, mensagem, destinatarios, tipo, enviado_em) VALUES
  ('Incentivo Automático', 'Saudades de você! Que tal retomar os treinos hoje?', 3,  'incentivo', '10/04/2026 09:15'),
  ('Campanha Semana Santa', 'Treine mais, sinta mais! Semana Santa especial.',   45, 'campanha',  '08/04/2026 14:00')
ON CONFLICT DO NOTHING;
