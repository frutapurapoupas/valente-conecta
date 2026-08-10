-- Caminho: C:\valente_conecta\supabase\migrations\007_pontos_referencia.sql

create table if not exists pontos_referencia (
  id uuid primary key default gen_random_uuid(),
  cidade_id uuid not null references cidades(id) on delete cascade,
  nome text not null,               -- nome principal, ex: "APAEB"
  apelidos text[] default '{}',     -- variantes de escrita, ex: {'apaeb centro', 'associacao apaeb'}
  latitude double precision not null,
  longitude double precision not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_pontos_referencia_cidade on pontos_referencia(cidade_id);

alter table pontos_referencia enable row level security;

create policy "pontos_referencia_leitura_publica" on pontos_referencia
  for select using (ativo = true);

-- Politica de escrita liberada por ora (sem login ainda) — restringir ao
-- admin master quando o login for implementado.
create policy "pontos_referencia_escrita_publica" on pontos_referencia
  for all using (true) with check (true);

-- Semente: cadastra a APAEB de Valente, que foi o caso que motivou esta tabela.
-- Ajuste as coordenadas reais depois, se estas forem aproximadas.
insert into pontos_referencia (cidade_id, nome, apelidos, latitude, longitude)
select id, 'APAEB', array['apaeb centro', 'associacao apaeb', 'apaeb valente'], -11.406, -39.461
from cidades
where nome = 'Valente' and estado = 'BA'
on conflict do nothing;
