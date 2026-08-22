-- Caminho: C:\valente_conecta\supabase\migrations\057_agua_gas_google_place_id.sql
--
-- agua_gas_fornecedores (014_agua_gas_supabase.sql) nunca ganhou
-- google_place_id — só tinha 1 fornecedor real cadastrado (auto-registro)
-- desde o início do projeto. Adiciona a coluna pra permitir importar
-- distribuidoras de água/gás reais via Google Places sem duplicar em
-- reimportações futuras (mesmo padrao ja usado em saude_estabelecimentos
-- e comercios_diretorio).

alter table agua_gas_fornecedores add column if not exists google_place_id text;
alter table agua_gas_fornecedores add constraint agua_gas_fornecedores_google_place_id_key unique (google_place_id);
