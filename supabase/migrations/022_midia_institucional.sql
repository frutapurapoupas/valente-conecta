-- Caminho: C:\valente_conecta\supabase\migrations\022_midia_institucional.sql
--
-- Bucket pra midia institucional do proprio app (video de lancamento na
-- home, e futuros materiais parecidos) — separado do bucket 'catalogo'
-- (010_storage_catalogo.sql), que e' so pra midia de item publicado por
-- fornecedor. Guardado como configuracao em admin_configuracoes (mesmo
-- padrao de referral_config em app/api/referrals/config/route.ts), pra o
-- admin master poder trocar sem precisar de deploy novo.

insert into storage.buckets (id, name, public, file_size_limit)
values ('institucional', 'institucional', true, 104857600) -- 100MB, cobre video de lancamento
on conflict (id) do nothing;

create policy "institucional_storage_leitura_publica" on storage.objects
  for select using (bucket_id = 'institucional');

create policy "institucional_storage_escrita_publica" on storage.objects
  for insert with check (bucket_id = 'institucional');

create policy "institucional_storage_atualizacao_publica" on storage.objects
  for update using (bucket_id = 'institucional');
-- NOTA DE SEGURANCA: politica temporaria (sem login), mesmo padrao do
-- resto do projeto ate a autenticacao real existir — trocar video e algo
-- que hoje qualquer um tecnicamente poderia chamar direto na API, nao so
-- o admin master pela tela. Aceitavel por ora pelo mesmo motivo que o
-- resto do app aceita.
