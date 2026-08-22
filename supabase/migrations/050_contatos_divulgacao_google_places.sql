-- Caminho: C:\valente_conecta\supabase\migrations\050_contatos_divulgacao_google_places.sql
--
-- Estende contatos_divulgacao (migration 024) pra aceitar importacao vinda
-- da Places API do Google: guarda categoria/endereco pra dar mais contexto
-- ao admin na hora de convidar, e o place_id do Google pra nao duplicar o
-- mesmo estabelecimento se a importacao for rodada de novo depois.

alter table contatos_divulgacao
  add column if not exists google_place_id text,
  add column if not exists categoria text,
  add column if not exists endereco text;

create unique index if not exists idx_contatos_divulgacao_google_place_id
  on contatos_divulgacao(google_place_id)
  where google_place_id is not null;

alter table contatos_divulgacao drop constraint if exists contatos_divulgacao_origem_check;
alter table contatos_divulgacao
  add constraint contatos_divulgacao_origem_check
  check (origem in ('manual', 'planilha', 'google_places'));
