-- Caminho: C:\valente_conecta\supabase\migrations\076_vitrine_desbloqueio_contato.sql
--
-- Desbloqueio de contato de verdade na vitrine (catalogo_itens/interesses).
-- Ate aqui a regra "no plano gratis o contato fica borrado" era so texto em
-- /planos, sem nenhuma logica real (taxas_config toda desligada,
-- unlockContactPrice/blurContactOnFree nunca lidos em runtime).
--
-- Reaproveita o sistema de cota ja existente (055_plano_geral.sql) pra dar
-- ao COMPRADOR uma cota diaria de desbloqueios gratis, configuravel pelo
-- admin master em /admin-master/configuracoes/plano-geral -- so precisa de
-- um novo "servico". Fornecedor em plano pago (perfis_fornecedor.plano)
-- continua com contato sempre aberto, sem tocar em cota nenhuma.

-- 1. Novo servico na cota do Plano Geral (constraint nomeada automaticamente
-- pelo Postgres na migration 055 como plano_geral_limites_servico_check).
alter table plano_geral_limites drop constraint if exists plano_geral_limites_servico_check;
alter table plano_geral_limites add constraint plano_geral_limites_servico_check
  check (servico in ('carona_desbloqueio', 'fila_hospital', 'mototaxi', 'agua_gas', 'academia', 'busca_google', 'desbloqueio_contato'));

-- 2. Limites de partida (ajustaveis depois pelo admin master na mesma tela
-- que ja edita os outros servicos -- nao sao preco/regra definitiva).
insert into plano_geral_limites (tier, servico, limite, periodo) values
  ('gratis', 'desbloqueio_contato', 3, 'diario'),
  ('basico', 'desbloqueio_contato', 10, 'diario'),
  ('ilimitado', 'desbloqueio_contato', null, 'diario')
on conflict (tier, servico) do nothing;

-- 3. Rastro do pagamento Mercado Pago no interesse -- mesmo par de colunas
-- que carona_desbloqueios ja usa (app/api/carona/desbloqueios/route.ts).
alter table interesses add column if not exists mp_preference_id text;
alter table interesses add column if not exists mp_payment_id text;
