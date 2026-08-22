-- Caminho: C:\valente_conecta\supabase\migrations\055_plano_geral.sql
--
-- Plano geral do usuario consumidor (nao confundir com assinaturas_planos,
-- que e' plano de FORNECEDOR pra destaque no catalogo — ver 028). Pedido do
-- dono do projeto: 3 niveis (gratis / basico ~R$5 / ilimitado ~R$10, precos
-- configuraveis pelo admin master), cada um com um limite de USOS POR MES
-- em cada servico (numero tambem configuravel por nivel+servico):
--   carona_desbloqueio, fila_hospital, mototaxi, agua_gas, academia
-- + busca_google, que e' limite POR DIA (nao por mes).
--
-- Decisao confirmada com o dono do projeto: o plano paga/substitui a taxa
-- de desbloqueio da Carona Solidaria (quem tem o plano ganha N desbloqueios
-- inclusos por mes, sem pagar a taxa avulsa ate estourar o limite) — ver
-- app/api/carona/desbloqueios/route.ts, que vai checar o plano antes de
-- cair no fluxo de cobranca avulsa existente.
--
-- O nivel "gratis" tambem tem limite agora (antes esses 5 servicos eram
-- liberados sem limite nenhum) — decisao confirmada, e' o que da sentido
-- comercial pros niveis pagos.

-- ============================================================
-- 1. Nivel do usuario + validade da assinatura paga
-- ============================================================
alter table usuarios add column if not exists plano_geral text not null default 'gratis'
  check (plano_geral in ('gratis', 'basico', 'ilimitado'));
alter table usuarios add column if not exists plano_geral_valido_ate timestamptz;

-- ============================================================
-- 2. Preco mensal de cada nivel pago (gratis fica com preco 0, so' pra
--    manter a mesma tabela e simplificar a leitura no admin master)
-- ============================================================
create table if not exists plano_geral_config (
  tier text primary key check (tier in ('gratis', 'basico', 'ilimitado')),
  preco numeric(12,2) not null default 0,
  nome text not null,
  updated_at timestamptz not null default now()
);

insert into plano_geral_config (tier, preco, nome) values
  ('gratis', 0, 'Grátis'),
  ('basico', 5.00, 'Básico'),
  ('ilimitado', 10.00, 'Ilimitado')
on conflict (tier) do nothing;

-- ============================================================
-- 3. Limite de uso por nivel+servico. limite null = sem limite (ilimitado
--    usa null em todos os servicos; os outros dois niveis tem numero).
-- ============================================================
create table if not exists plano_geral_limites (
  id uuid primary key default gen_random_uuid(),
  tier text not null check (tier in ('gratis', 'basico', 'ilimitado')),
  servico text not null check (servico in ('carona_desbloqueio', 'fila_hospital', 'mototaxi', 'agua_gas', 'academia', 'busca_google')),
  limite integer, -- null = sem limite
  periodo text not null default 'mensal' check (periodo in ('mensal', 'diario')),
  updated_at timestamptz not null default now(),
  unique (tier, servico)
);

insert into plano_geral_limites (tier, servico, limite, periodo) values
  ('gratis', 'carona_desbloqueio', 1, 'mensal'),
  ('gratis', 'fila_hospital', 1, 'mensal'),
  ('gratis', 'mototaxi', 2, 'mensal'),
  ('gratis', 'agua_gas', 2, 'mensal'),
  ('gratis', 'academia', 2, 'mensal'),
  ('gratis', 'busca_google', 0, 'diario'),
  ('basico', 'carona_desbloqueio', 5, 'mensal'),
  ('basico', 'fila_hospital', 5, 'mensal'),
  ('basico', 'mototaxi', 8, 'mensal'),
  ('basico', 'agua_gas', 8, 'mensal'),
  ('basico', 'academia', 8, 'mensal'),
  ('basico', 'busca_google', 3, 'diario'),
  ('ilimitado', 'carona_desbloqueio', null, 'mensal'),
  ('ilimitado', 'fila_hospital', null, 'mensal'),
  ('ilimitado', 'mototaxi', null, 'mensal'),
  ('ilimitado', 'agua_gas', null, 'mensal'),
  ('ilimitado', 'academia', null, 'mensal'),
  ('ilimitado', 'busca_google', null, 'diario')
on conflict (tier, servico) do nothing;

-- ============================================================
-- 4. Contador de uso — uma linha por usuario+servico+periodo (periodo_chave
--    e' 'YYYY-MM' pra servico mensal ou 'YYYY-MM-DD' pra diario).
-- ============================================================
create table if not exists plano_geral_uso (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  servico text not null,
  periodo_chave text not null,
  contagem integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (usuario_id, servico, periodo_chave)
);

create index if not exists idx_plano_geral_uso_usuario on plano_geral_uso(usuario_id);

-- ============================================================
-- 5. Assinaturas pagas (checkout Mercado Pago, mesmo padrao ja usado no
--    resto do projeto — ver app/api/planos/checkout/route.ts)
-- ============================================================
create table if not exists plano_geral_assinaturas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  tier text not null check (tier in ('basico', 'ilimitado')),
  valor numeric(12,2) not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'cancelado')),
  mp_preference_id text,
  mp_payment_id text,
  valido_ate timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_plano_geral_assinaturas_usuario on plano_geral_assinaturas(usuario_id);

-- ============================================================
-- RPC: checa se o usuario ainda tem cota pro servico nesse periodo e, se
-- tiver, JA CONSOME (incrementa) na mesma chamada — evita corrida entre
-- "checar" e "usar" em dois passos separados. security definer pra poder
-- escrever em plano_geral_uso mesmo com RLS publica.
-- ============================================================
create or replace function plano_geral_verificar_e_consumir(p_usuario_id uuid, p_servico text)
returns table (permitido boolean, restantes integer, tier text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tier text;
  v_valido_ate timestamptz;
  v_limite integer;
  v_periodo text;
  v_chave text;
  v_contagem integer;
begin
  select plano_geral, plano_geral_valido_ate into v_tier, v_valido_ate
  from usuarios where id = p_usuario_id;

  if v_tier is null then
    v_tier := 'gratis';
  end if;
  -- Assinatura paga vencida sem renovar: volta pro gratis na hora, sem
  -- precisar de job agendado pra isso.
  if v_tier <> 'gratis' and v_valido_ate is not null and v_valido_ate < now() then
    v_tier := 'gratis';
  end if;

  select limite, periodo into v_limite, v_periodo
  from plano_geral_limites where plano_geral_limites.tier = v_tier and servico = p_servico;

  if v_periodo is null then
    v_periodo := 'mensal';
  end if;
  v_chave := case when v_periodo = 'diario' then to_char(now(), 'YYYY-MM-DD') else to_char(now(), 'YYYY-MM') end;

  -- Sem limite (ilimitado, ou limite nao configurado pra esse servico/tier)
  if v_limite is null then
    insert into plano_geral_uso (usuario_id, servico, periodo_chave, contagem)
      values (p_usuario_id, p_servico, v_chave, 1)
      on conflict (usuario_id, servico, periodo_chave) do update set contagem = plano_geral_uso.contagem + 1, updated_at = now();
    permitido := true; restantes := -1; tier := v_tier;
    return next;
    return;
  end if;

  select contagem into v_contagem from plano_geral_uso
    where usuario_id = p_usuario_id and servico = p_servico and periodo_chave = v_chave
    for update;

  if v_contagem is null then
    v_contagem := 0;
  end if;

  if v_contagem >= v_limite then
    permitido := false; restantes := 0; tier := v_tier;
    return next;
    return;
  end if;

  insert into plano_geral_uso (usuario_id, servico, periodo_chave, contagem)
    values (p_usuario_id, p_servico, v_chave, 1)
    on conflict (usuario_id, servico, periodo_chave) do update set contagem = plano_geral_uso.contagem + 1, updated_at = now();

  permitido := true; restantes := v_limite - (v_contagem + 1); tier := v_tier;
  return next;
end;
$$;

alter table plano_geral_config enable row level security;
alter table plano_geral_limites enable row level security;
alter table plano_geral_uso enable row level security;
alter table plano_geral_assinaturas enable row level security;
create policy "plano_geral_config_publica" on plano_geral_config for all using (true) with check (true);
create policy "plano_geral_limites_publica" on plano_geral_limites for all using (true) with check (true);
create policy "plano_geral_uso_publica" on plano_geral_uso for all using (true) with check (true);
create policy "plano_geral_assinaturas_publica" on plano_geral_assinaturas for all using (true) with check (true);

-- NOTA DE SEGURANCA: policies publicas temporarias (sem login real), mesmo
-- padrao do resto do projeto ate a autenticacao existir. A escrita de
-- contagem de uso passa sempre pela RPC acima (security definer), nunca
-- por update direto do client.
