-- =============================================================================
-- SEED: caixa_lancamentos (BASE_LANCAMENTOS)
-- Dados de Abril/2026 migrados do hook useControleCaixa.ts
-- Cole e execute no Supabase SQL Editor
-- =============================================================================
-- NOTA: a coluna "visoes" deve ser do tipo jsonb.
-- Se o seu banco usa text[], troque '"["DREX","SISTEMA"]"'::jsonb
-- por ARRAY['DREX','SISTEMA']::text[]

DO $$
BEGIN

INSERT INTO public.caixa_lancamentos
  (visoes, tipo, categoria, numero_documento, descricao, valor, data, vencimento, status, recorrencia, cidade, plano, observacao)
VALUES

-- ============================================================
-- RECEITAS -- DREX + SISTEMA
-- ============================================================

-- Assinaturas Ouro
('["DREX","SISTEMA"]', 'RECEITA', 'ASSINATURA', NULL,
 'Assinaturas Ouro - Uberlândia (12 loj.)',
 3564, '2026-04-01', 1, 'PAGO', 0, 'Uberlândia', 'Ouro', NULL),

('["DREX","SISTEMA"]', 'RECEITA', 'ASSINATURA', NULL,
 'Assinaturas Ouro - Uberaba (8 loj.)',
 2376, '2026-04-01', 1, 'PAGO', 0, 'Uberaba', 'Ouro', NULL),

('["DREX","SISTEMA"]', 'RECEITA', 'ASSINATURA', NULL,
 'Assinaturas Ouro - Patos de Minas (5 loj.)',
 1485, '2026-04-10', 10, 'PENDENTE', 0, 'Patos de Minas', 'Ouro', NULL),

-- Assinaturas Prata
('["DREX","SISTEMA"]', 'RECEITA', 'ASSINATURA', NULL,
 'Assinaturas Prata - Uberlândia (23 loj.)',
 4531, '2026-04-05', 5, 'PAGO', 0, 'Uberlândia', 'Prata', NULL),

('["DREX","SISTEMA"]', 'RECEITA', 'ASSINATURA', NULL,
 'Assinaturas Prata - Uberaba (15 loj.)',
 2955, '2026-04-05', 5, 'PAGO', 0, 'Uberaba', 'Prata', NULL),

('["DREX","SISTEMA"]', 'RECEITA', 'ASSINATURA', NULL,
 'Assinaturas Prata - Patos de Minas (9 loj.)',
 1773, '2026-04-10', 10, 'PENDENTE', 0, 'Patos de Minas', 'Prata', NULL),

-- Assinaturas Bronze
('["DREX","SISTEMA"]', 'RECEITA', 'ASSINATURA', NULL,
 'Assinaturas Bronze - Uberlândia (41 loj.)',
 3977, '2026-04-05', 5, 'PAGO', 0, 'Uberlândia', 'Bronze', NULL),

('["DREX","SISTEMA"]', 'RECEITA', 'ASSINATURA', NULL,
 'Assinaturas Bronze - Uberaba (27 loj.)',
 2619, '2026-04-05', 5, 'PAGO', 0, 'Uberaba', 'Bronze', NULL),

('["DREX","SISTEMA"]', 'RECEITA', 'ASSINATURA', NULL,
 'Assinaturas Bronze - Patos de Minas (18)',
 1746, '2026-04-10', 10, 'PENDENTE', 0, 'Patos de Minas', 'Bronze', NULL),

('["DREX","SISTEMA"]', 'RECEITA', 'ASSINATURA', NULL,
 'Assinaturas Bronze - Araxá (11 loj.)',
 1067, '2026-04-15', 15, 'PENDENTE', 0, 'Araxá', 'Bronze', NULL),

('["DREX","SISTEMA"]', 'RECEITA', 'ASSINATURA', NULL,
 'Assinaturas Bronze - Ituiutaba (7 loj.)',
 679, '2026-04-15', 15, 'PENDENTE', 0, 'Ituiutaba', 'Bronze', NULL),

-- Desbloqueios (taxa 10% da DREX)
('["DREX","SISTEMA"]', 'RECEITA', 'DESBLOQUEIO', NULL,
 'Taxa Desbloqueios - Uberlândia (10%)',
 1840, '2026-04-07', 7, 'PAGO', 1, 'Uberlândia', NULL, NULL),

('["DREX","SISTEMA"]', 'RECEITA', 'DESBLOQUEIO', NULL,
 'Taxa Desbloqueios - Uberaba (10%)',
 920, '2026-04-07', 7, 'PAGO', 1, 'Uberaba', NULL, NULL),

('["DREX","SISTEMA"]', 'RECEITA', 'DESBLOQUEIO', NULL,
 'Taxa Desbloqueios - Patos de Minas (10%)',
 480, '2026-04-07', 7, 'PAGO', 1, 'Patos de Minas', NULL, NULL),

-- Publicidade
('["DREX","SISTEMA"]', 'RECEITA', 'PUBLICIDADE', NULL,
 'Slot Publicidade #1 - Uberlândia',
 1500, '2026-04-01', 1, 'PAGO', 0, 'Uberlândia', NULL, NULL),

('["DREX","SISTEMA"]', 'RECEITA', 'PUBLICIDADE', NULL,
 'Slot Publicidade #2 - Uberaba',
 800, '2026-04-01', 1, 'PAGO', 0, 'Uberaba', NULL, NULL),

('["DREX","SISTEMA"]', 'RECEITA', 'PUBLICIDADE', NULL,
 'Slot Publicidade #3 - Patos de Minas',
 500, '2026-04-15', 15, 'PENDENTE', 0, 'Patos de Minas', NULL, NULL),

-- Taxa plataforma
('["DREX","SISTEMA"]', 'RECEITA', 'TAXA_PLATAFORMA', NULL,
 'Taxa Plataforma PDV/Integrações',
 2200, '2026-04-02', 2, 'PAGO', 0, NULL, NULL, NULL),

-- ============================================================
-- DESPESAS -- DREX
-- ============================================================

('["DREX"]', 'DESPESA', 'EQUIPE', NULL,
 'Folha Pagamento - Equipe Técnica e CS (6 pess.)',
 28000, '2026-04-05', 5, 'PAGO', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'SERVIDOR', NULL,
 'AWS - Servidores, RDS, S3, CloudFront',
 3200, '2026-04-05', 5, 'PAGO', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'SERVIDOR', NULL,
 'CDN / Edge Network Global',
 890, '2026-04-05', 5, 'PAGO', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'SERVIDOR', NULL,
 'Supabase - Banco de Dados Cloud',
 450, '2026-04-10', 10, 'PENDENTE', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'SERVIDOR', NULL,
 'Firebase - Push & Auth',
 320, '2026-04-10', 10, 'PENDENTE', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'SERVIDOR', NULL,
 'Licenças de Software (Figma, Notion, Linear)',
 890, '2026-04-01', 1, 'PAGO', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'SERVIDOR', NULL,
 'Domínios e Certificados SSL (anual)',
 180, '2026-04-01', 1, 'PAGO', 12, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'MARKETING', NULL,
 'Marketing Digital - Tráfego Pago (Meta/Google)',
 4800, '2026-04-10', 10, 'PENDENTE', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'MARKETING', NULL,
 'Produção de Conteúdo e Design',
 1800, '2026-04-10', 10, 'PENDENTE', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'OPERACIONAL', NULL,
 'Aluguel Escritório - Centro',
 3800, '2026-04-05', 5, 'PAGO', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'OPERACIONAL', NULL,
 'Internet Fibra Empresarial (1 Gb)',
 450, '2026-04-05', 5, 'PAGO', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'OPERACIONAL', NULL,
 'Energia Elétrica',
 680, '2026-04-15', 15, 'PENDENTE', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'OPERACIONAL', NULL,
 'Telefonia e Plano Mobile',
 340, '2026-04-15', 15, 'PENDENTE', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'OPERACIONAL', NULL,
 'Limpeza e Manutenção Predial',
 500, '2026-04-05', 5, 'PAGO', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'JURIDICO', NULL,
 'Assessoria Jurídica Mensal',
 2200, '2026-04-15', 15, 'PENDENTE', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'JURIDICO', NULL,
 'Contabilidade e BPO Financeiro',
 1500, '2026-04-10', 10, 'PENDENTE', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'IMPOSTO', NULL,
 'INSS / Obrigações Tributárias',
 3850, '2026-04-20', 20, 'PENDENTE', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'IMPOSTO', NULL,
 'ISS / Simples Nacional',
 1240, '2026-04-20', 20, 'PENDENTE', 0, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'EVENTUAL', NULL,
 'Equipamentos - 2 Notebooks Dell XPS',
 4200, '2026-04-08', 8, 'PAGO', 1, NULL, NULL, NULL),

('["DREX"]', 'DESPESA', 'EVENTUAL', NULL,
 'Treinamento Equipe - Curso Cloud AWS',
 980, '2026-04-08', 8, 'PAGO', 1, NULL, NULL, NULL),

-- ============================================================
-- SISTEMA EXCLUSIVO
-- ============================================================

-- Bonus Indicacao distribuidos
('["SISTEMA"]', 'DESPESA', 'BONUS_INDICACAO', NULL,
 'Bônus Indicação distribuídos - Uberlândia',
 8400, '2026-04-07', 7, 'PAGO', 0, 'Uberlândia', NULL, NULL),

('["SISTEMA"]', 'DESPESA', 'BONUS_INDICACAO', NULL,
 'Bônus Indicação distribuídos - Uberaba',
 4200, '2026-04-07', 7, 'PAGO', 0, 'Uberaba', NULL, NULL),

('["SISTEMA"]', 'DESPESA', 'BONUS_INDICACAO', NULL,
 'Bônus Indicação distribuídos - Patos de Minas',
 2100, '2026-04-07', 7, 'PAGO', 0, 'Patos de Minas', NULL, NULL),

('["SISTEMA"]', 'DESPESA', 'BONUS_INDICACAO', NULL,
 'Bônus Indicação distribuídos - Araxá',
 840, '2026-04-07', 7, 'PAGO', 0, 'Araxá', NULL, NULL),

-- Compensacao Moeda Conecta
('["SISTEMA"]', 'DESPESA', 'COMPENSACAO', NULL,
 'Compensação Moeda Conecta - Uberlândia',
 4800, '2026-04-05', 5, 'PAGO', 0, 'Uberlândia', NULL, NULL),

('["SISTEMA"]', 'DESPESA', 'COMPENSACAO', NULL,
 'Compensação Moeda Conecta - Uberaba',
 2400, '2026-04-05', 5, 'PAGO', 0, 'Uberaba', NULL, NULL),

('["SISTEMA"]', 'DESPESA', 'COMPENSACAO', NULL,
 'Compensação Moeda Conecta - Patos de Minas',
 1200, '2026-04-05', 5, 'PAGO', 0, 'Patos de Minas', NULL, NULL),

-- Volume real desbloqueios (100% pago pelos consumidores)
('["SISTEMA"]', 'RECEITA', 'DESBLOQUEIO', NULL,
 'Volume Desbloqueios Consumidores - Uberlândia',
 18400, '2026-04-07', 7, 'PAGO', 1, 'Uberlândia', NULL, NULL),

('["SISTEMA"]', 'RECEITA', 'DESBLOQUEIO', NULL,
 'Volume Desbloqueios Consumidores - Uberaba',
 9200, '2026-04-07', 7, 'PAGO', 1, 'Uberaba', NULL, NULL),

('["SISTEMA"]', 'RECEITA', 'DESBLOQUEIO', NULL,
 'Volume Desbloqueios Consumidores - Patos de Minas',
 4800, '2026-04-07', 7, 'PAGO', 1, 'Patos de Minas', NULL, NULL);

END $$;
