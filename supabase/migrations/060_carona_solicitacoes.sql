-- Caminho: C:\valente_conecta\supabase\migrations\060_carona_solicitacoes.sql
--
-- Fluxo novo na Carona Solidaria, complementar ao ja existente
-- (041_carona_solidaria.sql: motorista anuncia, passageiro desbloqueia).
-- Agora o CAMINHO CONTRARIO tambem existe: passageiro pede um destino que
-- ainda nao tem viagem anunciada, e qualquer motorista cadastrado pode
-- aceitar — o aceite vira uma viagem normal, pelo MESMO formulario/taxa ja
-- existente (decisao confirmada com o dono do projeto: nao inventa taxa
-- nova, so' reaproveita o fluxo de sempre).
--
-- Sem notificacao push pra isso (decisao confirmada) — o motorista ve a
-- lista de pedidos abertos no proprio painel, com um sinal sonoro quando
-- abre a tela e tem pedido novo.

create table if not exists carona_solicitacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid,
  nome_passageiro text not null,
  telefone_passageiro text not null,
  cidade_origem text not null,
  origem_local text, -- ponto de partida dentro da cidade base (bairro/referencia), opcional
  origem_lat double precision,
  origem_lng double precision,
  cidade_destino text not null,
  data_viagem date not null,
  horario_saida time,
  observacoes text,
  status text not null default 'aberta' check (status in ('aberta', 'atendida', 'cancelada')),
  viagem_id uuid references carona_viagens(id) on delete set null,
  created_at timestamptz not null default now(),
  atendida_em timestamptz
);

create index if not exists idx_carona_solicitacoes_status on carona_solicitacoes(status, data_viagem);
create index if not exists idx_carona_solicitacoes_usuario on carona_solicitacoes(usuario_id);

alter table carona_solicitacoes enable row level security;
create policy "carona_solicitacoes_publica" on carona_solicitacoes for all using (true) with check (true);

-- NOTA DE SEGURANCA: policy publica temporaria (sem login real), mesmo
-- padrao do resto do projeto ate a autenticacao existir.
