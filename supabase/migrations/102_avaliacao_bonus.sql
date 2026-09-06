-- Caminho: C:\valente_conecta\supabase\migrations\102_avaliacao_bonus.sql
--
-- Gamificação leve: bônus em Moeda Conecta pra quem deixa avaliação (nota)
-- depois de uma viagem de Carona Solidária ou de um atendimento da vitrine
-- geral do catálogo (interesse concluído). Mesmo desenho de ciclo já usado
-- em 093/100 (meta + bônus configurável pelo admin master, pago em lote,
-- idempotente).
--
-- Moto-Táxi fica de fora de propósito: mototaxi_avaliacoes.passageiro_id
-- pode ser um id anônimo por dispositivo (sem cadastro real), e bônus em
-- dinheiro exige um usuarios.id de verdade -- ver 096_avaliacoes.sql.

create table if not exists avaliacao_ciclo_config (
  id uuid primary key default gen_random_uuid(),
  meta integer not null default 1 check (meta > 0),
  bonus numeric(12,2) not null default 0 check (bonus >= 0),
  ativo boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into avaliacao_ciclo_config (meta, bonus, ativo)
  select 1, 0, false
  where not exists (select 1 from avaliacao_ciclo_config);

create table if not exists avaliacao_bonus_pagamentos (
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
    'bonus_indicacao_estabelecimento', 'bonus_avaliacao'
  ));

-- ============================================================
-- RPC: conta avaliações feitas pelo usuário (carona + vitrine geral,
-- somadas) e paga o bônus por lote fechado. Chamada depois de CADA
-- avaliação nova (POST /api/carona/avaliacoes e
-- POST /api/catalogo/interesses/[id]/avaliar) -- se falhar, não deve
-- derrubar o salvamento da avaliação em si (chamada dentro de try/catch
-- nas rotas).
-- ============================================================
create or replace function avaliacao_processar_bonus_v1(p_usuario_id uuid)
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

  select
    (select count(*) from carona_avaliacoes where passageiro_id = p_usuario_id) +
    (select count(*) from catalogo_avaliacoes where comprador_id = p_usuario_id)
  into v_contagem;

  select * into v_cfg from avaliacao_ciclo_config
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

    insert into avaliacao_bonus_pagamentos (usuario_id, lote_numero, valor)
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
        ('bonus_avaliacao', p_usuario_id, p_usuario_id, v_cidade, v_cidade, v_cfg.bonus,
         'Bônus por avaliação deixada — lote ' || v_lote, 'concluida', now())
      returning * into v_transacao;

      update avaliacao_bonus_pagamentos set moeda_conecta_transacao_id = v_transacao.id where id = v_pagamento_id;

      lote_numero := v_lote;
      valor := v_cfg.bonus;
      return next;
    end if;
  end loop;
end;
$$;

alter table avaliacao_ciclo_config enable row level security;
alter table avaliacao_bonus_pagamentos enable row level security;
create policy "avaliacao_ciclo_config_publica" on avaliacao_ciclo_config for all using (true) with check (true);
create policy "avaliacao_bonus_pagamentos_publica" on avaliacao_bonus_pagamentos for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto -- escrita de dinheiro so' acontece pela RPC security
-- definer acima, nunca por insert/update direto do client.
