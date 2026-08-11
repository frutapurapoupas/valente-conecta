-- Caminho: C:\valente_conecta\supabase\migrations\010_storage_catalogo.sql
--
-- Bucket do Supabase Storage para midia do catalogo (imagens comprimidas
-- pelo funil client-side, ver MODULO_MARKETPLACE_MONETIZACAO.md secao 3).
-- Local filesystem (padrao usado em app/api/upload/recipe) nao serve aqui:
-- nao persiste em runtime serverless (Vercel), diferente do Storage.

insert into storage.buckets (id, name, public)
values ('catalogo', 'catalogo', true)
on conflict (id) do nothing;

-- Leitura publica (e a vitrine), escrita liberada por ora (sem login).
-- Mesma nota de seguranca temporaria dos demais arquivos desta pasta.
create policy "catalogo_storage_leitura_publica" on storage.objects
  for select using (bucket_id = 'catalogo');

create policy "catalogo_storage_escrita_publica" on storage.objects
  for insert with check (bucket_id = 'catalogo');

create policy "catalogo_storage_atualizacao_publica" on storage.objects
  for update using (bucket_id = 'catalogo');
