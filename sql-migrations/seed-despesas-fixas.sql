-- =============================================================================
-- SEED: caixa_despesas_fixas (Templates FX01-FX18)
-- Templates mensais de despesas fixas DREX
-- Cole e execute no Supabase SQL Editor
-- =============================================================================

INSERT INTO public.caixa_despesas_fixas
  (id, categoria, descricao, valor, vencimento, ativo, visao)
VALUES
  ('FX01', 'EQUIPE',      'Folha Pagamento - Equipe Técnica e CS',           28000, 5,  true, 'DREX'),
  ('FX02', 'SERVIDOR',    'AWS - Servidores, RDS, S3, CloudFront',           3200,  5,  true, 'DREX'),
  ('FX03', 'SERVIDOR',    'CDN / Edge Network Global',                        890,  5,  true, 'DREX'),
  ('FX04', 'SERVIDOR',    'Supabase - Banco de Dados Cloud',                  450,  10, true, 'DREX'),
  ('FX05', 'SERVIDOR',    'Firebase - Push & Auth',                           320,  10, true, 'DREX'),
  ('FX06', 'SERVIDOR',    'Licenças de Software (Figma, Notion, Linear)',     890,  1,  true, 'DREX'),
  ('FX07', 'SERVIDOR',    'Domínios e Certificados SSL',                      180,  1,  true, 'DREX'),
  ('FX08', 'MARKETING',   'Marketing Digital - Tráfego Pago (Meta/Google)', 4800,  10, true, 'DREX'),
  ('FX09', 'MARKETING',   'Produção de Conteúdo e Design',                  1800,  10, true, 'DREX'),
  ('FX10', 'OPERACIONAL', 'Aluguel Escritório',                              3800,  5,  true, 'DREX'),
  ('FX11', 'OPERACIONAL', 'Internet Fibra Empresarial (1 Gb)',                450,  5,  true, 'DREX'),
  ('FX12', 'OPERACIONAL', 'Energia Elétrica',                                 680,  15, true, 'DREX'),
  ('FX13', 'OPERACIONAL', 'Telefonia e Plano Mobile',                         340,  15, true, 'DREX'),
  ('FX14', 'OPERACIONAL', 'Limpeza e Manutenção Predial',                     500,  5,  true, 'DREX'),
  ('FX15', 'JURIDICO',    'Assessoria Jurídica Mensal',                      2200,  15, true, 'DREX'),
  ('FX16', 'JURIDICO',    'Contabilidade e BPO Financeiro',                  1500,  10, true, 'DREX'),
  ('FX17', 'IMPOSTO',     'INSS / Obrigações Tributárias',                   3850,  20, true, 'DREX'),
  ('FX18', 'IMPOSTO',     'ISS / Simples Nacional',                          1240,  20, true, 'DREX')
ON CONFLICT (id) DO NOTHING;
