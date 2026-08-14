-- Caminho: C:\valente_conecta\supabase\migrations\041_carona_solidaria.sql
--
-- Carona Solidaria — carona compartilhada entre cidades (estilo BlaBlaCar),
-- pedido explicito do dono do projeto. Regras de dinheiro confirmadas com
-- ele antes de construir:
--
--   - A DISPONIBILIDADE das viagens (rota, data, vagas) fica visivel pra
--     TODOS os usuarios, sem pagar nada — isso e' so' vitrine.
--   - O MOTORISTA paga uma taxa (configuravel pelo admin master) pra ter a
--     viagem dele exibida na vitrine. Sem pagar, a viagem fica registrada
--     mas NAO aparece pra ninguem (status 'aguardando_pagamento').
--   - O PASSAGEIRO (caronista) paga uma taxa PROPRIA e SEPARADA
--     (tambem configuravel pelo admin master) pra desbloquear o CONTATO
--     daquele motorista especifico naquela viagem — e' um desbloqueio por
--     viagem, nao uma assinatura.
--   - O valor da carona em si (quanto o passageiro paga ao motorista pelo
--     trajeto) NAO passa pela plataforma — e' combinado direto entre os
--     dois depois do contato desbloqueado, mesma logica de "preco a
--     combinar" que ja existe em outros modulos deste projeto.
--   - Todo motorista precisa de foto do rosto, foto do carro e foto da CNH
--     (mesmo padrao just aplicado ao Moto Taxi em 040_mototaxi_fotos_e_encomenda.sql)
--     — essas fotos sao mostradas pro caronista antes dele decidir pagar
--     pra desbloquear o contato.
--
-- Cobranca via Mercado Pago (mesma integracao ja usada em
-- app/api/planos/checkout/route.ts) — cada taxa gera uma preferencia
-- propria, confirmada pelo webhook existente
-- (app/api/webhooks/mercadopago/route.ts, prefixos novos "carona_listagem_"
-- e "carona_desbloqueio_" no external_reference).

create table if not exists carona_motoristas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  nome text not null,
  telefone text not null,
  foto_url text not null,
  veiculo_foto_url text not null,
  cnh_foto_url text not null,
  veiculo text not null,
  placa text not null,
  cnh_numero text not null,
  cnh_valida boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (usuario_id)
);

create table if not exists carona_viagens (
  id uuid primary key default gen_random_uuid(),
  motorista_id uuid not null references carona_motoristas(id),
  cidade_origem text not null,
  cidade_destino text not null,
  data_viagem date not null,
  horario_saida time,
  vagas_disponiveis integer not null check (vagas_disponiveis > 0),
  preco_sugerido_vaga numeric(12,2),
  observacoes text,
  status text not null default 'aguardando_pagamento'
    check (status in ('aguardando_pagamento', 'publicada', 'concluida', 'cancelada')),
  taxa_valor numeric(12,2) not null,
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_carona_viagens_status on carona_viagens(status, data_viagem);
create index if not exists idx_carona_viagens_rota on carona_viagens(cidade_origem, cidade_destino);
create index if not exists idx_carona_viagens_motorista on carona_viagens(motorista_id);

create table if not exists carona_desbloqueios (
  id uuid primary key default gen_random_uuid(),
  viagem_id uuid not null references carona_viagens(id),
  usuario_id uuid not null references usuarios(id),
  valor numeric(12,2) not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago')),
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (viagem_id, usuario_id)
);

create index if not exists idx_carona_desbloqueios_usuario on carona_desbloqueios(usuario_id);

alter table carona_motoristas enable row level security;
alter table carona_viagens enable row level security;
alter table carona_desbloqueios enable row level security;
create policy "carona_motoristas_publica" on carona_motoristas for all using (true) with check (true);
create policy "carona_viagens_publica" on carona_viagens for all using (true) with check (true);
create policy "carona_desbloqueios_publica" on carona_desbloqueios for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real completo), mesmo
-- padrao do resto do projeto.
