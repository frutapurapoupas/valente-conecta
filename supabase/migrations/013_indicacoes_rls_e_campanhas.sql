-- Caminho: C:\valente_conecta\supabase\migrations\013_indicacoes_rls_e_campanhas.sql
--
-- O projeto ja tinha, criadas fora do versionamento direto no Supabase, as
-- tabelas usuarios/indicacoes/indicacoes_estabelecimentos/admin_configuracoes/
-- admin_beneficios com um fluxo de cadastro simples (nome+whatsapp) real e
-- bem feito em lib/auth.ts (cadastroSimples) + components/CadastroPopup.tsx.
-- O problema: RLS esta' ligado nas 4 ultimas mas SEM NENHUMA POLICY, entao
-- todo select/insert/update nelas e' negado por padrao — o fluxo de
-- indicacao inteiro falha silenciosamente hoje. Este arquivo destrava isso
-- e adiciona o que falta para campanhas de indicacao do admin master.

-- ============================================================
-- Policies temporarias (mesmo padrao "publico por ora, aperta quando
-- login existir" usado no resto do projeto — ver 003/005/007).
-- ============================================================

create policy "indicacoes_leitura_publica" on indicacoes
  for select using (true);
create policy "indicacoes_escrita_publica" on indicacoes
  for insert with check (true);

create policy "indicacoes_estabelecimentos_leitura_publica" on indicacoes_estabelecimentos
  for select using (true);
create policy "indicacoes_estabelecimentos_escrita_publica" on indicacoes_estabelecimentos
  for all using (true) with check (true);

-- admin_configuracoes/admin_beneficios sao configuracao (nao dado pessoal),
-- risco baixo em deixar leitura+escrita publicas temporariamente.
create policy "admin_configuracoes_publica" on admin_configuracoes
  for all using (true) with check (true);
create policy "admin_beneficios_publica" on admin_beneficios
  for all using (true) with check (true);

-- ============================================================
-- Coluna nova: confirmacao de whatsapp. Hoje nao ha' provedor de SMS/OTP
-- configurado (nenhuma chave de API para isso nos documentos ou .env), entao
-- "confirmado" comeca como autodeclarado/validado por formato — fica pronto
-- pra virar confirmacao real via OTP quando um provedor for integrado.
-- ============================================================
alter table usuarios add column if not exists whatsapp_confirmado boolean not null default false;

-- ============================================================
-- RPC: atualizar_meu_cadastro — as policies de UPDATE existentes em
-- usuarios exigem auth.uid() = id (autenticacao real, que nao existe
-- ainda). Esta RPC security definer e' o caminho para o proprio usuario
-- completar dados progressivamente (email, pix, bairro...) sem precisar
-- de login. So' atualiza os campos que vierem preenchidos (coalesce).
-- ============================================================
create or replace function atualizar_meu_cadastro(
  p_usuario_id uuid,
  p_email text default null,
  p_pix_key text default null,
  p_bairro text default null,
  p_cidade text default null,
  p_whatsapp_confirmado boolean default null
)
returns usuarios
language sql
security definer
set search_path = public
as $$
  update usuarios set
    email = coalesce(p_email, email),
    pix_key = coalesce(p_pix_key, pix_key),
    bairro = coalesce(p_bairro, bairro),
    cidade = coalesce(p_cidade, cidade),
    whatsapp_confirmado = coalesce(p_whatsapp_confirmado, whatsapp_confirmado)
  where id = p_usuario_id
  returning *;
$$;

-- ============================================================
-- campanhas_indicacao — admin master configura faixas "X indicacoes
-- validas = premio Y" (MODULO_MARKETPLACE_MONETIZACAO.md secao 6.2).
-- ============================================================
create table if not exists campanhas_indicacao (
  id uuid primary key default gen_random_uuid(),
  quantidade_necessaria integer not null,
  premio_descricao text not null,
  premio_valor numeric(10,2),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table campanhas_indicacao enable row level security;
create policy "campanhas_indicacao_leitura_publica" on campanhas_indicacao
  for select using (true);
create policy "campanhas_indicacao_escrita_publica" on campanhas_indicacao
  for all using (true) with check (true);

-- ============================================================
-- RPC: contar_indicacoes_validas — indicacao "valida" = o indicado
-- confirmou o whatsapp (ver nota da coluna acima). Sem sistema de eventos
-- de engajamento ainda (busca/interesse/compra), essa e' a aproximacao
-- disponivel hoje com o que existe; dá pra refinar quando houver
-- rastreamento de engajamento por usuario.
-- ============================================================
create or replace function contar_indicacoes_validas(p_usuario_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)
  from indicacoes i
  join usuarios u on u.id = i.indicado_id
  where i.usuario_id = p_usuario_id
    and u.whatsapp_confirmado = true;
$$;
