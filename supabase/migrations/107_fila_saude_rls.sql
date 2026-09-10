-- Caminho: supabase/migrations/107_fila_saude_rls.sql
--
-- As tabelas da Fila Virtual de Saude (106_fila_saude.sql) nasceram com
-- RLS ativo e sem nenhuma politica -- toda escrita pela chave anon (que e'
-- o que as rotas de API usam, ver lib/supabase/server.ts) vinha caindo em
-- "new row violates row-level security policy". Mesmo padrao temporario
-- ja usado no resto do projeto ate' a autenticacao existir de verdade
-- (ver 084_profissionais_diretorio.sql): politica aberta "for all using
-- (true) with check (true)". A checagem de quem pode fazer o que (nivel
-- de acesso) continua sendo feita no codigo da API, nao no banco.

alter table unidades_saude enable row level security;
alter table unidade_saude_equipe enable row level security;
alter table unidade_saude_servicos enable row level security;
alter table fila_saude_profissionais enable row level security;
alter table fila_saude_senhas enable row level security;

create policy "unidades_saude_publica" on unidades_saude for all using (true) with check (true);
create policy "unidade_saude_equipe_publica" on unidade_saude_equipe for all using (true) with check (true);
create policy "unidade_saude_servicos_publica" on unidade_saude_servicos for all using (true) with check (true);
create policy "fila_saude_profissionais_publica" on fila_saude_profissionais for all using (true) with check (true);
create policy "fila_saude_senhas_publica" on fila_saude_senhas for all using (true) with check (true);
