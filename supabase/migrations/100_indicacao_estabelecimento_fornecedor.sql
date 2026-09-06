-- Caminho: C:\valente_conecta\supabase\migrations\100_indicacao_estabelecimento_fornecedor.sql
--
-- Indicação de estabelecimento/fornecedor pelo usuário comum: alguém sugere
-- um comércio ou fornecedor que ainda não está na plataforma, o admin
-- master avalia (aprova/recusa) e, batendo a meta configurada, quem indicou
-- recebe bônus em Moeda Conecta -- mesmo desenho de ciclo já usado em
-- 093_cadastro_consumidor_produto.sql (consumidor_cadastro_ciclo_config /
-- consumidor_cadastro_bonus_pagamentos), só que com uma meta única (sem
-- quebra por categoria de negócio).
--
-- Substitui em definitivo a tela app/indicar-estabelecimento, que antes
-- consultava uma tabela "estabelecimentos" que nunca existiu em nenhuma
-- migration (por isso nunca funcionou).

create table if not exists indicacoes_estabelecimento (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  nome text not null,
  categoria text not null,
  cidade text not null,
  telefone text,
  endereco text,
  observacoes text,
  status text not null default 'pendente' check (status in ('pendente','aprovado','recusado')),
  motivo_recusa text,
  avaliado_por uuid references usuarios(id),
  processado_em timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_indicacoes_estabelecimento_usuario on indicacoes_estabelecimento(usuario_id);
create index if not exists idx_indicacoes_estabelecimento_status on indicacoes_estabelecimento(status);

-- Config única (não por categoria/cidade) de meta + bônus -- admin master
-- decide quantas indicações aprovadas fecham um ciclo e quanto paga.
-- ativo=false até configurar de verdade, mesmo padrão de 093.
create table if not exists indicacao_estabelecimento_ciclo_config (
  id uuid primary key default gen_random_uuid(),
  meta integer not null default 1 check (meta > 0),
  bonus numeric(12,2) not null default 0 check (bonus >= 0),
  ativo boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into indicacao_estabelecimento_ciclo_config (meta, bonus, ativo)
  select 1, 0, false
  where not exists (select 1 from indicacao_estabelecimento_ciclo_config);

-- Idempotência do lote pago, mesmo padrão de consumidor_cadastro_bonus_pagamentos.
create table if not exists indicacao_estabelecimento_bonus_pagamentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  lote_numero integer not null,
  valor numeric(12,2) not null,
  moeda_conecta_transacao_id uuid references moeda_conecta_transacoes(id),
  created_at timestamptz not null default now(),
  unique (usuario_id, lote_numero)
);

alter table moeda_conecta_transacoes drop constraint if exists moeda_conecta_transacoes_tipo_check;
alter table moeda_conecta_transacoes add constraint moeda_conecta_transacoes_tipo_check
  check (tipo in (
    'transferencia', 'pagamento_comercio', 'recarga', 'ajuste_admin',
    'bonus_indicacao', 'compensacao_fornecedor',
    'bonus_catalogo_colaborativo', 'bonus_cadastro_consumidor',
    'bonus_indicacao_estabelecimento'
  ));

-- ============================================================
-- RPC: processa o bônus pra UM usuário -- mesmo esqueleto de
-- consumidor_cadastro_processar_bonus_v1, sem dimensão de categoria.
-- Idempotente: chamar de novo sem lote novo fechado não credita nada.
-- ============================================================
create or replace function indicacao_estabelecimento_processar_bonus_v1(p_usuario_id uuid)
returns table (lote_numero integer, valor numeric)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_cidade text;
  v_contagem integer;
  v_cfg record;
  v_lotes integer;
  v_lote integer;
  v_pagamento_id uuid;
  v_transacao moeda_conecta_transacoes;
begin
  select upper(trim(cidade_base)) into v_cidade from usuarios where id = p_usuario_id;
  if v_cidade is null or v_cidade = '' then
    return;
  end if;

  select count(*) into v_contagem
    from indicacoes_estabelecimento
    where usuario_id = p_usuario_id and status = 'aprovado';

  select * into v_cfg from indicacao_estabelecimento_ciclo_config
    where ativo = true and meta > 0 and bonus > 0
    limit 1;
  if not found then
    return;
  end if;

  v_lotes := floor(v_contagem::numeric / v_cfg.meta);
  if v_lotes < 1 then
    return;
  end if;

  for v_lote in 1..v_lotes loop
    v_pagamento_id := null;

    insert into indicacao_estabelecimento_bonus_pagamentos (usuario_id, lote_numero, valor)
    values (p_usuario_id, v_lote, v_cfg.bonus)
    on conflict (usuario_id, lote_numero) do nothing
    returning id into v_pagamento_id;

    if v_pagamento_id is not null then
      insert into moeda_conecta_contas (usuario_id, cidade_base)
        values (p_usuario_id, v_cidade) on conflict (usuario_id) do nothing;

      update moeda_conecta_contas set saldo = saldo + v_cfg.bonus, atualizado_em = now()
        where usuario_id = p_usuario_id;

      insert into moeda_conecta_transacoes
        (tipo, remetente_id, destinatario_id, cidade, cidade_destino, valor, descricao, status, moderado_em)
      values
        ('bonus_indicacao_estabelecimento', p_usuario_id, p_usuario_id, v_cidade, v_cidade, v_cfg.bonus,
         'Bônus por indicação de estabelecimento/fornecedor — lote ' || v_lote, 'concluida', now())
      returning * into v_transacao;

      update indicacao_estabelecimento_bonus_pagamentos set moeda_conecta_transacao_id = v_transacao.id where id = v_pagamento_id;

      lote_numero := v_lote;
      valor := v_cfg.bonus;
      return next;
    end if;
  end loop;
end;
$$;

-- ============================================================
-- RPC: aprovar/recusar -- feito num passo só (status + bônus), pra evitar
-- a API fazer duas chamadas separadas e correr risco de aprovar sem
-- processar o bônus se a segunda falhar. Mesmo espírito de
-- catalogo_colaborativo_aprovar_moderacao_v1 (086).
-- ============================================================
create or replace function indicacao_estabelecimento_aprovar_v1(p_id uuid, p_admin_id uuid)
returns indicacoes_estabelecimento
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row indicacoes_estabelecimento;
begin
  update indicacoes_estabelecimento
    set status = 'aprovado', avaliado_por = p_admin_id, processado_em = now()
    where id = p_id and status = 'pendente'
    returning * into v_row;

  if v_row.id is null then
    raise exception 'Indicação não encontrada ou já processada';
  end if;

  perform indicacao_estabelecimento_processar_bonus_v1(v_row.usuario_id);

  return v_row;
end;
$$;

create or replace function indicacao_estabelecimento_recusar_v1(p_id uuid, p_admin_id uuid, p_motivo text default null)
returns indicacoes_estabelecimento
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row indicacoes_estabelecimento;
begin
  update indicacoes_estabelecimento
    set status = 'recusado', motivo_recusa = p_motivo, avaliado_por = p_admin_id, processado_em = now()
    where id = p_id and status = 'pendente'
    returning * into v_row;

  if v_row.id is null then
    raise exception 'Indicação não encontrada ou já processada';
  end if;

  return v_row;
end;
$$;

alter table indicacoes_estabelecimento enable row level security;
alter table indicacao_estabelecimento_ciclo_config enable row level security;
alter table indicacao_estabelecimento_bonus_pagamentos enable row level security;
create policy "indicacoes_estabelecimento_publica" on indicacoes_estabelecimento for all using (true) with check (true);
create policy "indicacao_estabelecimento_ciclo_config_publica" on indicacao_estabelecimento_ciclo_config for all using (true) with check (true);
create policy "indicacao_estabelecimento_bonus_pagamentos_publica" on indicacao_estabelecimento_bonus_pagamentos for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto -- escrita de dinheiro so' acontece pelas RPCs security
-- definer acima, nunca por insert/update direto do client.
