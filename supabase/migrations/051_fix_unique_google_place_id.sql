-- Caminho: C:\valente_conecta\supabase\migrations\051_fix_unique_google_place_id.sql
--
-- O indice unico parcial (where google_place_id is not null) da migration
-- 050 nao pode ser usado como alvo de ON CONFLICT pelo upsert do
-- supabase-js. Troca por uma constraint unique "cheia" — em Postgres, NULL
-- nunca colide com NULL, entao continua permitindo varias linhas sem
-- google_place_id (origem manual/planilha) sem violar a unicidade.

drop index if exists idx_contatos_divulgacao_google_place_id;

alter table contatos_divulgacao
  add constraint contatos_divulgacao_google_place_id_key unique (google_place_id);
