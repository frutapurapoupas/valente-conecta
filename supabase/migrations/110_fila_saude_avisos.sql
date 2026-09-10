-- Caminho: supabase/migrations/110_fila_saude_avisos.sql
--
-- Flag pra nao repetir o aviso "sua vez esta chegando" (push, ver
-- lib/saude/avisos.ts) toda vez que a fila avanca -- so' dispara uma vez,
-- quando a pessoa passa a ter 3 ou menos na frente dela.

alter table fila_saude_senhas add column if not exists aviso_deslocamento_enviado boolean not null default false;
