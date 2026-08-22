-- Caminho: C:\valente_conecta\supabase\migrations\058_agua_gas_endereco.sql
--
-- agua_gas_fornecedores (014_agua_gas_supabase.sql) só tinha bairro/cidade,
-- sem campo de endereço completo (rua, número) — diferente do padrão
-- adotado nos diretórios criados depois (saude_estabelecimentos,
-- comercios_diretorio). Necessário pra importação via Google Places
-- (057_agua_gas_google_place_id.sql) guardar o endereço formatado.

alter table agua_gas_fornecedores add column if not exists endereco text;
