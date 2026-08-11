-- Caminho: C:\valente_conecta\supabase\migrations\015_referrals_payout.sql
--
-- app/admin-master/configuracoes/bonus/page.tsx (config de bonus por lote,
-- ja' real e bem feita) e o fluxo de solicitacao de PIX em app/qr-code
-- (ja' real tambem) gravavam em arquivo JSON local
-- (data/referral_config.json, data/referral_payout_requests.json) — nao
-- sobrevive em runtime serverless. Migra os dois pra Supabase, mantendo o
-- MESMO formato de dados (rules/content/pixMinimo e os campos das
-- solicitacoes PIX) pra nenhuma tela precisar mudar.
--
-- campanhas_indicacao (de 013_indicacoes_rls_e_campanhas.sql) fica sem uso:
-- essa configuracao de bonus por lote ja' cobre exatamente "X indicacoes
-- validas = premio Y" com uma tela de admin melhor do que a que eu ia
-- construir do zero. Remove pra nao deixar duas fontes de verdade.

drop function if exists contar_indicacoes_validas(uuid);
drop table if exists campanhas_indicacao;

create table if not exists indicacao_payout_requests (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references usuarios(id) on delete set null,
  usuario_nome text,
  usuario_whatsapp text,
  pix_key text not null,
  valor numeric(10,2) not null default 0,
  status text not null default 'pendente' check (status in ('pendente','pago','recusado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payout_requests_usuario on indicacao_payout_requests(usuario_id);

alter table indicacao_payout_requests enable row level security;
create policy "payout_requests_leitura_publica" on indicacao_payout_requests
  for select using (true);
create policy "payout_requests_escrita_publica" on indicacao_payout_requests
  for all using (true) with check (true);

-- RPC de contagem de indicacoes validas continua util (progresso de lote na
-- tela do qr-code, por ex), so' recriando depois do drop acima.
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
