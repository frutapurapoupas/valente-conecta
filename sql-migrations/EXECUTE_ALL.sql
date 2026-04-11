-- =============================================================================
-- VALENTE CONECTA â€” MIGRAÃ‡ÃƒO COMPLETA
-- Execute este arquivo inteiro no Supabase Dashboard â†’ SQL Editor
-- Ordem correta de dependÃªncias jÃ¡ respeitada.
-- =============================================================================


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 1. PLANOS DE COMISSÃƒO
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS plans (
  id         SERIAL PRIMARY KEY,
  nome       TEXT NOT NULL,
  taxa       NUMERIC(5,2) NOT NULL DEFAULT 10,
  cor        TEXT NOT NULL DEFAULT 'text-zinc-400',
  border     TEXT NOT NULL DEFAULT 'border-zinc-700/30',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO plans (id, nome, taxa, cor, border) VALUES
  (1, 'Premium Gold', 10, 'text-amber-500',  'border-amber-500/30'),
  (2, 'Master Black',  8, 'text-zinc-100',   'border-zinc-500/30'),
  (3, 'Basic Silver', 15, 'text-zinc-400',   'border-zinc-700/30')
ON CONFLICT (id) DO NOTHING;

SELECT setval('plans_id_seq', (SELECT MAX(id) FROM plans));


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 2. ACADEMIA / GYM TABLES
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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

CREATE TABLE IF NOT EXISTS gym_members (
  id              SERIAL PRIMARY KEY,
  nome            TEXT NOT NULL,
  foto            TEXT NOT NULL DEFAULT '',
  plano           TEXT NOT NULL DEFAULT 'gratuito' CHECK (plano IN ('gratuito', 'basico')),
  gym_unit_id     INTEGER REFERENCES gym_units(id) ON DELETE SET NULL,
  academia        TEXT NOT NULL DEFAULT '',
  whatsapp        TEXT NOT NULL DEFAULT '',
  ultimo_checkin  DATE,
  total_checkins  INTEGER NOT NULL DEFAULT 0,
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gym_members_gym_unit_id_idx ON gym_members(gym_unit_id);
CREATE INDEX IF NOT EXISTS gym_members_plano_idx       ON gym_members(plano);

CREATE TABLE IF NOT EXISTS gym_funcionalidades (
  id             TEXT PRIMARY KEY,
  label          TEXT NOT NULL,
  plano_gratuito BOOLEAN NOT NULL DEFAULT false,
  plano_basico   BOOLEAN NOT NULL DEFAULT true,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gym_carrossel (
  slot       INTEGER PRIMARY KEY CHECK (slot BETWEEN 1 AND 3),
  url        TEXT NOT NULL DEFAULT '',
  titulo     TEXT NOT NULL DEFAULT '',
  destino    TEXT NOT NULL DEFAULT '/',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gym_campanhas (
  id            SERIAL PRIMARY KEY,
  titulo        TEXT NOT NULL,
  mensagem      TEXT NOT NULL,
  destinatarios INTEGER NOT NULL DEFAULT 0,
  tipo          TEXT NOT NULL DEFAULT 'campanha' CHECK (tipo IN ('incentivo', 'campanha')),
  enviado_em    TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed: Unidades
INSERT INTO gym_units (nome, responsavel, cidade, contato, endereco, localizador, alunos, ativa) VALUES
  ('Academia Valente Fit', 'Carlos Andrade', 'Valente-BA', '(75) 99999-1111', 'Rua das Flores, 120 â€“ Centro, Valente-BA',        'https://maps.google.com/?q=Academia+Valente+Fit',   156, true),
  ('Studio Move',          'Daniela Souza',  'Valente-BA', '(75) 98888-2222', 'Av. JoÃ£o Pessoa, 45 â€“ Novo Horizonte, Valente-BA', 'https://maps.google.com/?q=Studio+Move+Valente',    78,  true),
  ('CrossFit SertÃ£o',      'Roberto Lima',   'Valente-BA', '(75) 97777-3333', 'Rua do ComÃ©rcio, 88 â€“ Industrial, Valente-BA',    'https://maps.google.com/?q=CrossFit+Sertao+Valente',34,  false)
ON CONFLICT DO NOTHING;

-- Seed: Alunos
INSERT INTO gym_members (nome, plano, gym_unit_id, academia, whatsapp, ultimo_checkin, total_checkins, ativo) VALUES
  ('JoÃ£o Silva',     'basico',   1, 'Academia Valente Fit', '75999991001', '2026-04-10', 45, true),
  ('Maria Oliveira', 'basico',   1, 'Academia Valente Fit', '75999991002', '2026-04-08', 38, true),
  ('Pedro Costa',    'gratuito', 2, 'Studio Move',          '75999991003', '2026-04-10', 12, true),
  ('Ana Paula',      'gratuito', 1, 'Academia Valente Fit', '75999991004', '2026-03-27',  5, true),
  ('Carlos Eduardo', 'basico',   2, 'Studio Move',          '75999991005', '2026-03-20',  3, true),
  ('Fernanda Lima',  'gratuito', 3, 'CrossFit SertÃ£o',      '75999991006', '2026-04-10', 60, true),
  ('Lucas Mendes',   'gratuito', 1, 'Academia Valente Fit', '75999991007', '2026-03-11',  2, true),
  ('Beatriz Santos', 'basico',   2, 'Studio Move',          '75999991008', '2026-04-09', 29, true),
  ('Rafael Pereira', 'gratuito', 1, 'Academia Valente Fit', '75999991009', '2026-04-03',  8, false),
  ('Juliana Ramos',  'basico',   3, 'CrossFit SertÃ£o',      '75999991010', '2026-04-07', 22, true)
ON CONFLICT DO NOTHING;

-- Seed: Funcionalidades
INSERT INTO gym_funcionalidades (id, label, plano_gratuito, plano_basico) VALUES
  ('treinos_guiados',     'Treinos Guiados',       true,  true),
  ('chat_personal',       'Chat com Personal',      false, true),
  ('relatorio_progresso', 'RelatÃ³rio de Progresso', false, true),
  ('aulas_ao_vivo',       'Aulas ao Vivo',           false, true),
  ('plano_nutricional',   'Plano Nutricional',       false, true),
  ('avaliacao_fisica',    'AvaliaÃ§Ã£o FÃ­sica',        false, true),
  ('desconto_parceiros',  'Desconto em Parceiros',   false, true),
  ('carrossel_ads',       'Ver anÃºncios no app',     true,  false)
ON CONFLICT (id) DO NOTHING;

-- Seed: Carrossel
INSERT INTO gym_carrossel (slot, url, titulo, destino) VALUES
  (1, '', 'Oferta Especial â€” 3x na semana', '/'),
  (2, '', 'Parceiro: NutriÃ§Ã£o SertÃ£o',       '/'),
  (3, '', 'Upgrade para Plano BÃ¡sico',       '/academia')
ON CONFLICT (slot) DO NOTHING;

-- Seed: Campanhas
INSERT INTO gym_campanhas (titulo, mensagem, destinatarios, tipo, enviado_em) VALUES
  ('Incentivo AutomÃ¡tico',  'Saudades de vocÃª! Que tal retomar os treinos hoje?', 3,  'incentivo', '10/04/2026 09:15'),
  ('Campanha Semana Santa', 'Treine mais, sinta mais! Semana Santa especial.',   45, 'campanha',  '08/04/2026 14:00')
ON CONFLICT DO NOTHING;


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 3. CARROSSEL / LEILÃƒO DE PUBLICIDADE
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS auction_leiloes (
  id         TEXT PRIMARY KEY,
  semana     TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'encerrado', 'publicado')),
  encerra_em TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auction_slots (
  id          SERIAL PRIMARY KEY,
  leilao_id   TEXT NOT NULL REFERENCES auction_leiloes(id) ON DELETE CASCADE,
  slot        INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 3),
  disponivel  BOOLEAN NOT NULL DEFAULT true,
  lance_atual NUMERIC(10,2) NOT NULL DEFAULT 0,
  vencedor    TEXT,
  imagem_url  TEXT,
  UNIQUE (leilao_id, slot)
);

CREATE INDEX IF NOT EXISTS auction_slots_leilao_idx ON auction_slots(leilao_id);

CREATE TABLE IF NOT EXISTS auction_anuncios (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  empresa          TEXT NOT NULL,
  imagem_url       TEXT NOT NULL DEFAULT '',
  semana           TEXT NOT NULL,
  slot_ganho       INTEGER NOT NULL CHECK (slot_ganho BETWEEN 1 AND 3),
  valor_pago       NUMERIC(10,2) NOT NULL DEFAULT 0,
  status_aprovacao TEXT NOT NULL DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auction_anuncios_status_idx ON auction_anuncios(status_aprovacao);

-- Seed: LeilÃ£o ativo
INSERT INTO auction_leiloes (id, semana, status, encerra_em) VALUES
  ('leilao-2026-w16', '14/04 â€“ 20/04/2026', 'aberto', now() + INTERVAL '22 hours')
ON CONFLICT (id) DO NOTHING;

-- Seed: Slots
INSERT INTO auction_slots (leilao_id, slot, disponivel, lance_atual, vencedor, imagem_url) VALUES
  ('leilao-2026-w16', 1, true, 85.00, 'Mercadinho Bom PreÃ§o', null),
  ('leilao-2026-w16', 2, true, 60.00, 'FarmÃ¡cia SaÃºde',       null),
  ('leilao-2026-w16', 3, true, 35.00, null,                   null)
ON CONFLICT (leilao_id, slot) DO NOTHING;

-- Seed: AnÃºncios da semana anterior
INSERT INTO auction_anuncios (id, empresa, imagem_url, semana, slot_ganho, valor_pago, status_aprovacao) VALUES
  ('a1', 'Mercadinho Bom PreÃ§o', '', '07/04 â€“ 13/04', 1, 85.00, 'aprovado'),
  ('a2', 'FarmÃ¡cia SaÃºde',       '', '07/04 â€“ 13/04', 2, 60.00, 'pendente'),
  ('a3', 'AÃ§ougue Leblon',       '', '07/04 â€“ 13/04', 3, 35.00, 'pendente')
ON CONFLICT (id) DO NOTHING;


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 4. CAIXA â€” TABELAS ESTRUTURAIS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS caixa_lancamentos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visoes           JSONB NOT NULL DEFAULT '[]',
  tipo             TEXT NOT NULL CHECK (tipo IN ('RECEITA', 'DESPESA')),
  categoria        TEXT NOT NULL,
  numero_documento TEXT,
  descricao        TEXT NOT NULL,
  valor            NUMERIC(12,2) NOT NULL,
  data             DATE NOT NULL,
  vencimento       INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PAGO', 'PENDENTE', 'ATRASADO', 'CANCELADO')),
  recorrencia      INTEGER NOT NULL DEFAULT 0,
  cidade           TEXT,
  plano            TEXT,
  observacao       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS caixa_lancamentos_data_idx   ON caixa_lancamentos(data);
CREATE INDEX IF NOT EXISTS caixa_lancamentos_tipo_idx   ON caixa_lancamentos(tipo);
CREATE INDEX IF NOT EXISTS caixa_lancamentos_status_idx ON caixa_lancamentos(status);

CREATE TABLE IF NOT EXISTS caixa_despesas_fixas (
  id         TEXT PRIMARY KEY,
  categoria  TEXT NOT NULL,
  descricao  TEXT NOT NULL,
  valor      NUMERIC(12,2) NOT NULL,
  vencimento INTEGER NOT NULL,
  ativo      BOOLEAN NOT NULL DEFAULT true,
  visao      TEXT NOT NULL DEFAULT 'DREX',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS caixa_exclusoes_fixas (
  id          SERIAL PRIMARY KEY,
  template_id TEXT NOT NULL,
  mes         INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano         INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (template_id, mes, ano)
);


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 5. SEED: CAIXA â€” LANÃ‡AMENTOS BASE (ABRIL/2026)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

DO $$
BEGIN

INSERT INTO public.caixa_lancamentos
  (visoes, tipo, categoria, numero_documento, descricao, valor, data, vencimento, status, recorrencia, cidade, plano, observacao)
VALUES

-- RECEITAS â€” DREX + SISTEMA
('\'::jsonb, 'RECEITA', 'ASSINATURA', NULL, 'Assinaturas Ouro - UberlÃ¢ndia (12 loj.)',    3564, '2026-04-01', 1,  'PAGO',     0, 'UberlÃ¢ndia',    'Ouro',   NULL),
('\'::jsonb, 'RECEITA', 'ASSINATURA', NULL, 'Assinaturas Ouro - Uberaba (8 loj.)',        2376, '2026-04-01', 1,  'PAGO',     0, 'Uberaba',       'Ouro',   NULL),
('\'::jsonb, 'RECEITA', 'ASSINATURA', NULL, 'Assinaturas Ouro - Patos de Minas (5 loj.)',1485, '2026-04-10', 10, 'PENDENTE', 0, 'Patos de Minas','Ouro',   NULL),
('\'::jsonb, 'RECEITA', 'ASSINATURA', NULL, 'Assinaturas Prata - UberlÃ¢ndia (23 loj.)',  4531, '2026-04-05', 5,  'PAGO',     0, 'UberlÃ¢ndia',    'Prata',  NULL),
('\'::jsonb, 'RECEITA', 'ASSINATURA', NULL, 'Assinaturas Prata - Uberaba (15 loj.)',     2955, '2026-04-05', 5,  'PAGO',     0, 'Uberaba',       'Prata',  NULL),
('\'::jsonb, 'RECEITA', 'ASSINATURA', NULL, 'Assinaturas Prata - Patos de Minas (9 loj.)',1773,'2026-04-10',10, 'PENDENTE', 0, 'Patos de Minas','Prata',  NULL),
('\'::jsonb, 'RECEITA', 'ASSINATURA', NULL, 'Assinaturas Bronze - UberlÃ¢ndia (41 loj.)', 3977, '2026-04-05', 5,  'PAGO',     0, 'UberlÃ¢ndia',    'Bronze', NULL),
('\'::jsonb, 'RECEITA', 'ASSINATURA', NULL, 'Assinaturas Bronze - Uberaba (27 loj.)',    2619, '2026-04-05', 5,  'PAGO',     0, 'Uberaba',       'Bronze', NULL),
('\'::jsonb, 'RECEITA', 'ASSINATURA', NULL, 'Assinaturas Bronze - Patos de Minas (18)',  1746, '2026-04-10', 10, 'PENDENTE', 0, 'Patos de Minas','Bronze', NULL),
('\'::jsonb, 'RECEITA', 'ASSINATURA', NULL, 'Assinaturas Bronze - AraxÃ¡ (11 loj.)',      1067, '2026-04-15', 15, 'PENDENTE', 0, 'AraxÃ¡',         'Bronze', NULL),
('\'::jsonb, 'RECEITA', 'ASSINATURA', NULL, 'Assinaturas Bronze - Ituiutaba (7 loj.)',    679, '2026-04-15', 15, 'PENDENTE', 0, 'Ituiutaba',     'Bronze', NULL),
('\'::jsonb, 'RECEITA', 'DESBLOQUEIO',NULL, 'Taxa Desbloqueios - UberlÃ¢ndia (10%)',      1840, '2026-04-07', 7,  'PAGO',     1, 'UberlÃ¢ndia',    NULL,     NULL),
('\'::jsonb, 'RECEITA', 'DESBLOQUEIO',NULL, 'Taxa Desbloqueios - Uberaba (10%)',          920, '2026-04-07', 7,  'PAGO',     1, 'Uberaba',       NULL,     NULL),
('\'::jsonb, 'RECEITA', 'DESBLOQUEIO',NULL, 'Taxa Desbloqueios - Patos de Minas (10%)',   480, '2026-04-07', 7,  'PAGO',     1, 'Patos de Minas',NULL,     NULL),
('\'::jsonb, 'RECEITA', 'PUBLICIDADE',NULL, 'Slot Publicidade #1 - UberlÃ¢ndia',          1500, '2026-04-01', 1,  'PAGO',     0, 'UberlÃ¢ndia',    NULL,     NULL),
('\'::jsonb, 'RECEITA', 'PUBLICIDADE',NULL, 'Slot Publicidade #2 - Uberaba',              800, '2026-04-01', 1,  'PAGO',     0, 'Uberaba',       NULL,     NULL),
('\'::jsonb, 'RECEITA', 'PUBLICIDADE',NULL, 'Slot Publicidade #3 - Patos de Minas',       500, '2026-04-15', 15, 'PENDENTE', 0, 'Patos de Minas',NULL,     NULL),
('\'::jsonb, 'RECEITA', 'TAXA_PLATAFORMA',NULL,'Taxa Plataforma PDV/IntegraÃ§Ãµes',        2200, '2026-04-02', 2,  'PAGO',     0, NULL,            NULL,     NULL),

-- DESPESAS â€” DREX
('\'::jsonb, 'DESPESA', 'EQUIPE',      NULL, 'Folha Pagamento - Equipe TÃ©cnica e CS (6 pess.)', 28000, '2026-04-05', 5,  'PAGO',     0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'SERVIDOR',    NULL, 'AWS - Servidores, RDS, S3, CloudFront',            3200, '2026-04-05', 5,  'PAGO',     0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'SERVIDOR',    NULL, 'CDN / Edge Network Global',                         890, '2026-04-05', 5,  'PAGO',     0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'SERVIDOR',    NULL, 'Supabase - Banco de Dados Cloud',                   450, '2026-04-10', 10, 'PENDENTE', 0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'SERVIDOR',    NULL, 'Firebase - Push & Auth',                            320, '2026-04-10', 10, 'PENDENTE', 0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'SERVIDOR',    NULL, 'LicenÃ§as de Software (Figma, Notion, Linear)',      890, '2026-04-01', 1,  'PAGO',     0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'SERVIDOR',    NULL, 'DomÃ­nios e Certificados SSL (anual)',               180, '2026-04-01', 1,  'PAGO',     12,NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'MARKETING',   NULL, 'Marketing Digital - TrÃ¡fego Pago (Meta/Google)',  4800, '2026-04-10', 10, 'PENDENTE', 0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'MARKETING',   NULL, 'ProduÃ§Ã£o de ConteÃºdo e Design',                   1800, '2026-04-10', 10, 'PENDENTE', 0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'OPERACIONAL', NULL, 'Aluguel EscritÃ³rio - Centro',                     3800, '2026-04-05', 5,  'PAGO',     0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'OPERACIONAL', NULL, 'Internet Fibra Empresarial (1 Gb)',                 450, '2026-04-05', 5,  'PAGO',     0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'OPERACIONAL', NULL, 'Energia ElÃ©trica',                                  680, '2026-04-15', 15, 'PENDENTE', 0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'OPERACIONAL', NULL, 'Telefonia e Plano Mobile',                          340, '2026-04-15', 15, 'PENDENTE', 0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'OPERACIONAL', NULL, 'Limpeza e ManutenÃ§Ã£o Predial',                      500, '2026-04-05', 5,  'PAGO',     0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'JURIDICO',    NULL, 'Assessoria JurÃ­dica Mensal',                       2200, '2026-04-15', 15, 'PENDENTE', 0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'JURIDICO',    NULL, 'Contabilidade e BPO Financeiro',                  1500, '2026-04-10', 10, 'PENDENTE', 0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'IMPOSTO',     NULL, 'INSS / ObrigaÃ§Ãµes TributÃ¡rias',                   3850, '2026-04-20', 20, 'PENDENTE', 0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'IMPOSTO',     NULL, 'ISS / Simples Nacional',                          1240, '2026-04-20', 20, 'PENDENTE', 0, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'EVENTUAL',    NULL, 'Equipamentos - 2 Notebooks Dell XPS',             4200, '2026-04-08', 8,  'PAGO',     1, NULL, NULL, NULL),
('\'::jsonb, 'DESPESA', 'EVENTUAL',    NULL, 'Treinamento Equipe - Curso Cloud AWS',              980, '2026-04-08', 8,  'PAGO',     1, NULL, NULL, NULL),

-- SISTEMA EXCLUSIVO
('\'::jsonb, 'DESPESA', 'BONUS_INDICACAO', NULL, 'BÃ´nus IndicaÃ§Ã£o distribuÃ­dos - UberlÃ¢ndia',    8400, '2026-04-07', 7, 'PAGO', 0, 'UberlÃ¢ndia',    NULL, NULL),
('\'::jsonb, 'DESPESA', 'BONUS_INDICACAO', NULL, 'BÃ´nus IndicaÃ§Ã£o distribuÃ­dos - Uberaba',       4200, '2026-04-07', 7, 'PAGO', 0, 'Uberaba',       NULL, NULL),
('\'::jsonb, 'DESPESA', 'BONUS_INDICACAO', NULL, 'BÃ´nus IndicaÃ§Ã£o distribuÃ­dos - Patos de Minas',2100,'2026-04-07', 7, 'PAGO', 0, 'Patos de Minas',NULL, NULL),
('\'::jsonb, 'DESPESA', 'BONUS_INDICACAO', NULL, 'BÃ´nus IndicaÃ§Ã£o distribuÃ­dos - AraxÃ¡',          840, '2026-04-07', 7, 'PAGO', 0, 'AraxÃ¡',         NULL, NULL),
('\'::jsonb, 'DESPESA', 'COMPENSACAO',     NULL, 'CompensaÃ§Ã£o Moeda Conecta - UberlÃ¢ndia',       4800, '2026-04-05', 5, 'PAGO', 0, 'UberlÃ¢ndia',    NULL, NULL),
('\'::jsonb, 'DESPESA', 'COMPENSACAO',     NULL, 'CompensaÃ§Ã£o Moeda Conecta - Uberaba',          2400, '2026-04-05', 5, 'PAGO', 0, 'Uberaba',       NULL, NULL),
('\'::jsonb, 'DESPESA', 'COMPENSACAO',     NULL, 'CompensaÃ§Ã£o Moeda Conecta - Patos de Minas',  1200, '2026-04-05', 5, 'PAGO', 0, 'Patos de Minas',NULL, NULL),
('\'::jsonb, 'RECEITA', 'DESBLOQUEIO',     NULL, 'Volume Desbloqueios Consumidores - UberlÃ¢ndia',18400,'2026-04-07',7, 'PAGO', 1, 'UberlÃ¢ndia',    NULL, NULL),
('\'::jsonb, 'RECEITA', 'DESBLOQUEIO',     NULL, 'Volume Desbloqueios Consumidores - Uberaba',   9200, '2026-04-07', 7, 'PAGO', 1, 'Uberaba',       NULL, NULL),
('\'::jsonb, 'RECEITA', 'DESBLOQUEIO',     NULL, 'Volume Desbloqueios Consumidores - Patos de Minas',4800,'2026-04-07',7,'PAGO',1,'Patos de Minas', NULL, NULL);

END $$;


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 6. SEED: CAIXA â€” TEMPLATES DE DESPESAS FIXAS (FX01â€“FX18)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

INSERT INTO public.caixa_despesas_fixas
  (id, categoria, descricao, valor, vencimento, ativo, visao)
VALUES
  ('FX01', 'EQUIPE',      'Folha Pagamento - Equipe TÃ©cnica e CS',           28000, 5,  true, 'DREX'),
  ('FX02', 'SERVIDOR',    'AWS - Servidores, RDS, S3, CloudFront',            3200, 5,  true, 'DREX'),
  ('FX03', 'SERVIDOR',    'CDN / Edge Network Global',                         890, 5,  true, 'DREX'),
  ('FX04', 'SERVIDOR',    'Supabase - Banco de Dados Cloud',                   450, 10, true, 'DREX'),
  ('FX05', 'SERVIDOR',    'Firebase - Push & Auth',                            320, 10, true, 'DREX'),
  ('FX06', 'SERVIDOR',    'LicenÃ§as de Software (Figma, Notion, Linear)',      890, 1,  true, 'DREX'),
  ('FX07', 'SERVIDOR',    'DomÃ­nios e Certificados SSL',                       180, 1,  true, 'DREX'),
  ('FX08', 'MARKETING',   'Marketing Digital - TrÃ¡fego Pago (Meta/Google)', 4800,  10, true, 'DREX'),
  ('FX09', 'MARKETING',   'ProduÃ§Ã£o de ConteÃºdo e Design',                  1800,  10, true, 'DREX'),
  ('FX10', 'OPERACIONAL', 'Aluguel EscritÃ³rio',                              3800,  5,  true, 'DREX'),
  ('FX11', 'OPERACIONAL', 'Internet Fibra Empresarial (1 Gb)',                450,  5,  true, 'DREX'),
  ('FX12', 'OPERACIONAL', 'Energia ElÃ©trica',                                 680,  15, true, 'DREX'),
  ('FX13', 'OPERACIONAL', 'Telefonia e Plano Mobile',                         340,  15, true, 'DREX'),
  ('FX14', 'OPERACIONAL', 'Limpeza e ManutenÃ§Ã£o Predial',                     500,  5,  true, 'DREX'),
  ('FX15', 'JURIDICO',    'Assessoria JurÃ­dica Mensal',                      2200,  15, true, 'DREX'),
  ('FX16', 'JURIDICO',    'Contabilidade e BPO Financeiro',                  1500,  10, true, 'DREX'),
  ('FX17', 'IMPOSTO',     'INSS / ObrigaÃ§Ãµes TributÃ¡rias',                   3850,  20, true, 'DREX'),
  ('FX18', 'IMPOSTO',     'ISS / Simples Nacional',                          1240,  20, true, 'DREX')
ON CONFLICT (id) DO NOTHING;
