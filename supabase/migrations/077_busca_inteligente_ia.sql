-- Caminho: C:\valente_conecta\supabase\migrations\077_busca_inteligente_ia.sql
--
-- Cota diaria de uso da IA (DeepSeek) que interpreta a intencao da busca
-- (lib/busca/interpretarIntencao.ts) -- reaproveita o mesmo sistema ja
-- usado por carona/mototaxi/agua-gas/academia/busca_google/desbloqueio_contato
-- (055_plano_geral.sql). Estourando a cota, a busca nao trava: so' deixa
-- de chamar a IA e volta a busca literal pelo termo digitado.

alter table plano_geral_limites drop constraint if exists plano_geral_limites_servico_check;
alter table plano_geral_limites add constraint plano_geral_limites_servico_check
  check (servico in ('carona_desbloqueio', 'fila_hospital', 'mototaxi', 'agua_gas', 'academia', 'busca_google', 'desbloqueio_contato', 'busca_inteligente_ia'));

insert into plano_geral_limites (tier, servico, limite, periodo) values
  ('gratis', 'busca_inteligente_ia', 15, 'diario'),
  ('basico', 'busca_inteligente_ia', 50, 'diario'),
  ('ilimitado', 'busca_inteligente_ia', null, 'diario')
on conflict (tier, servico) do nothing;
