-- Caminho: C:\valente_conecta\supabase\migrations\012_interesses_mensagem.sql
--
-- Campo opcional de mensagem livre do comprador (usado por telas como
-- app/imoveis/page.tsx, que já coletavam "nome/telefone/mensagem" antes
-- mesmo de existir persistência real).

alter table interesses
  add column if not exists mensagem text;
