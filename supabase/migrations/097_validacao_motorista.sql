-- Caminho: C:\valente_conecta\supabase\migrations\097_validacao_motorista.sql
--
-- Selo "Validado pelo Valente Conecta" pra motoristas de Moto-Taxi e
-- Carona Solidaria -- mesmo desenho de perfis_fornecedor.validacao_status
-- (094_validacao_proprietario_loja.sql), so' que o default e' 'pendente'
-- em vez de 'nao_enviado': as 3 fotos (rosto, veiculo, CNH) ja chegam
-- completas no cadastro (MidiaUploader), sem etapa de envio separada -- o
-- motorista so' entra na fila de revisao do admin master automaticamente.

alter table mototaxi_motoristas add column if not exists validacao_status text not null default 'pendente'
  check (validacao_status in ('pendente', 'aprovado', 'recusado'));
alter table mototaxi_motoristas add column if not exists validacao_motivo_recusa text;
alter table mototaxi_motoristas add column if not exists validado_por uuid references usuarios(id);
alter table mototaxi_motoristas add column if not exists validado_em timestamptz;

alter table carona_motoristas add column if not exists validacao_status text not null default 'pendente'
  check (validacao_status in ('pendente', 'aprovado', 'recusado'));
alter table carona_motoristas add column if not exists validacao_motivo_recusa text;
alter table carona_motoristas add column if not exists validado_por uuid references usuarios(id);
alter table carona_motoristas add column if not exists validado_em timestamptz;

create index if not exists idx_mototaxi_motoristas_validacao on mototaxi_motoristas(validacao_status);
create index if not exists idx_carona_motoristas_validacao on carona_motoristas(validacao_status);
