-- Caminho: C:\valente_conecta\supabase\migrations\096_avaliacoes.sql
--
-- Sistema de avaliacao (ate 5 estrelas) em duas frentes:
-- A) Moto-Taxi e Carona Solidaria -- passageiro avalia motorista E veiculo
--    ao final da viagem, com ocorrencia opcional.
-- B) Demais servicos vendidos pela vitrine publica (catalogo_itens) --
--    gatilho e' o lojista marcar um "interesse" como concluido, o que
--    dispara push pro comprador avaliar (mesmo padrao de
--    087_cozinha_checkout_pedidos.sql::cozinha_avaliacoes, generalizado).

-- ============================================================
-- Moto-Taxi
-- ============================================================
create table if not exists mototaxi_avaliacoes (
  id uuid primary key default gen_random_uuid(),
  corrida_id uuid not null unique references mototaxi_corridas(id) on delete cascade,
  motorista_id uuid not null references mototaxi_motoristas(id) on delete cascade,
  passageiro_id uuid, -- sem FK: mesmo padrao de mototaxi_corridas.passageiro_id (id anonimo por dispositivo e' possivel, ver 005_mototaxi.sql)
  estrelas_motorista integer not null check (estrelas_motorista between 1 and 5),
  estrelas_veiculo integer not null check (estrelas_veiculo between 1 and 5),
  ocorrencia text,
  created_at timestamptz not null default now()
);

create index if not exists idx_mototaxi_avaliacoes_motorista on mototaxi_avaliacoes(motorista_id);

-- ============================================================
-- Carona Solidaria
-- ============================================================
create table if not exists carona_avaliacoes (
  id uuid primary key default gen_random_uuid(),
  viagem_id uuid not null references carona_viagens(id) on delete cascade,
  motorista_id uuid not null references carona_motoristas(id) on delete cascade,
  passageiro_id uuid not null references usuarios(id), -- carona ja exige identidade real (dinheiro de verdade envolvido)
  estrelas_motorista integer not null check (estrelas_motorista between 1 and 5),
  estrelas_veiculo integer not null check (estrelas_veiculo between 1 and 5),
  ocorrencia text,
  created_at timestamptz not null default now(),
  unique (viagem_id, passageiro_id) -- viagem pode ter varios passageiros, cada um avalia uma vez
);

create index if not exists idx_carona_avaliacoes_motorista on carona_avaliacoes(motorista_id);

-- ============================================================
-- Vitrine geral (interesses -> catalogo_avaliacoes)
-- ============================================================
alter table interesses add column if not exists concluido_em timestamptz;
alter table interesses add column if not exists concluido_por uuid references usuarios(id);

create table if not exists catalogo_avaliacoes (
  id uuid primary key default gen_random_uuid(),
  interesse_id uuid not null unique references interesses(id) on delete cascade,
  item_id uuid not null references catalogo_itens(id) on delete cascade,
  fornecedor_id uuid not null, -- nota e' da LOJA/servico, agregada por fornecedor -- mesmo padrao "sem FK" de catalogo_itens.dono_id
  comprador_id uuid not null,
  estrelas integer not null check (estrelas between 1 and 5),
  comentario text,
  created_at timestamptz not null default now()
);

create index if not exists idx_catalogo_avaliacoes_fornecedor on catalogo_avaliacoes(fornecedor_id);

alter table mototaxi_avaliacoes enable row level security;
alter table carona_avaliacoes enable row level security;
alter table catalogo_avaliacoes enable row level security;
create policy "mototaxi_avaliacoes_publica" on mototaxi_avaliacoes for all using (true) with check (true);
create policy "carona_avaliacoes_publica" on carona_avaliacoes for all using (true) with check (true);
create policy "catalogo_avaliacoes_publica" on catalogo_avaliacoes for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto -- escrita passa sempre por rota de API que valida as
-- regras de negocio (viagem concluida, sem avaliacao duplicada etc.).
