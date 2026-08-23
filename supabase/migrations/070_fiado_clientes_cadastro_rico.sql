-- Caminho: C:\valente_conecta\supabase\migrations\070_fiado_clientes_cadastro_rico.sql
--
-- Campos opcionais a mais no cadastro de cliente do fiado (item 4 do
-- backlog levantado contra o concorrente) -- decisao do dono do projeto
-- foi so' endereco + CPF + foto, sem RG/emissor/estado civil/filiacao
-- (burocracia demais pra fiado informal entre vizinho e comerciante).
-- Tudo nullable, metadata-only em tabela ja populada.

alter table fiado_clientes add column if not exists cpf text;
alter table fiado_clientes add column if not exists endereco text;
alter table fiado_clientes add column if not exists foto_url text;
