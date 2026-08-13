-- Caminho: C:\valente_conecta\supabase\migrations\030_usuarios_realtime.sql
--
-- Habilita Supabase Realtime na tabela usuarios, pra tela de admin master
-- atualizar sozinha quando alguem se cadastra ou muda de status (trial/
-- viral/plano), sem precisar de polling a cada segundo — evento real,
-- dispara so quando algo de fato muda, muito mais leve pro banco do que
-- reconsultar em intervalo fixo.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'usuarios'
  ) then
    alter publication supabase_realtime add table usuarios;
  end if;
end $$;
