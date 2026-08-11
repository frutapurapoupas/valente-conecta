-- Caminho: C:\valente_conecta\supabase\migrations\021_demandas_busca.sql
--
-- "Demanda nao atendida": quando a busca inteligente (catalogo_busca_vitrine_v2)
-- nao encontra NADA na plataforma inteira pra um termo (nao so' na regiao do
-- usuario — a funcao ja busca em qualquer distancia), capturamos o interesse
-- em vez de so mostrar "nenhum resultado". O admin master ve a lista e pode
-- avisar fornecedores do modulo (push + WhatsApp manual); quando alguem
-- publica o item, o usuario que buscou recebe push de volta.

create table if not exists demandas_busca (
  id uuid primary key default gen_random_uuid(),
  termo text not null,
  modulo text,
  usuario_id uuid not null, -- obterUsuarioLocalId(), mesmo id usado em push_subscriptions
  usuario_nome text,
  usuario_telefone text,
  latitude double precision,
  longitude double precision,
  status text not null default 'aguardando' check (status in ('aguardando','atendida','sem_interesse')),
  atendido_item_id uuid,
  created_at timestamptz not null default now(),
  atendido_em timestamptz
);

create index if not exists idx_demandas_busca_status on demandas_busca(status);
create index if not exists idx_demandas_busca_modulo on demandas_busca(modulo);

alter table demandas_busca enable row level security;
create policy "demandas_busca_publica" on demandas_busca for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login), mesmo padrao do
-- restante do projeto ate a autenticacao existir de verdade.
