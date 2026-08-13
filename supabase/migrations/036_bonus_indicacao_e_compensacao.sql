-- Caminho: C:\valente_conecta\supabase\migrations\036_bonus_indicacao_e_compensacao.sql
--
-- Duas mudancas pedidas pelo dono do projeto:
--
-- 1) BONUS POR INDICACAO CONFIGURAVEL POR CIDADE, PAGO EM MOEDA CONECTA
--    Antes: um unico documento global (admin_configuracoes/referral_config)
--    e pagamento sob solicitacao em PIX real (indicacao_payout_requests).
--    Agora: cada cidade tem sua propria regra por categoria
--    (usuarios_gerais / empresas_lojas / profissionais_liberais), e assim
--    que o usuario bate a meta de um lote o sistema credita automaticamente
--    em Moeda Conecta (nao fica mais esperando pedido de PIX) — o saldo
--    fica utilizavel em qualquer estabelecimento da cidade base dele.
--    referral_bonus_pagamentos existe so' pra nunca pagar o mesmo lote duas
--    vezes (unique usuario+categoria+lote).
--
-- 2) COMPENSACAO EM REAL PRO FORNECEDOR NAO-USUARIO
--    Fluxo: portador do credito indica um fornecedor que ainda nao e'
--    usuario, faz a compra usando Moeda Conecta informalmente, o fornecedor
--    aceita a negociacao. O PORTADOR DO CREDITO solicita a compensacao (nao
--    o fornecedor, que nao tem conta no app) — mas quem RECEBE o dinheiro
--    real e' o FORNECEDOR (confirmado explicitamente pelo dono do projeto,
--    invertendo minha sugestao inicial). O valor sai do saldo do portador
--    na hora da solicitacao (fica reservado, nao gasto de verdade ainda) e
--    o admin master marca como paga depois de repassar o PIX pro fornecedor
--    fora do sistema, tipicamente no fechamento do mes (mes_referencia so'
--    registra o mes da operacao pra o admin conseguir agrupar/filtrar — o
--    projeto nao tem job agendado, o processamento em si e' manual).

alter table moeda_conecta_transacoes drop constraint if exists moeda_conecta_transacoes_tipo_check;
alter table moeda_conecta_transacoes add constraint moeda_conecta_transacoes_tipo_check
  check (tipo in ('transferencia', 'pagamento_comercio', 'recarga', 'ajuste_admin', 'bonus_indicacao', 'compensacao_fornecedor'));

create table if not exists referral_config_cidades (
  id uuid primary key default gen_random_uuid(),
  cidade text not null,
  categoria text not null check (categoria in ('usuarios_gerais', 'empresas_lojas', 'profissionais_liberais')),
  nome text not null,
  bonus numeric(12,2) not null default 0 check (bonus >= 0),
  meta integer not null default 1 check (meta > 0),
  ativo boolean not null default false,
  descricao text,
  updated_at timestamptz not null default now(),
  unique (cidade, categoria)
);

create table if not exists referral_bonus_pagamentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  cidade text not null,
  categoria text not null,
  lote_numero integer not null,
  valor numeric(12,2) not null,
  moeda_conecta_transacao_id uuid references moeda_conecta_transacoes(id),
  created_at timestamptz not null default now(),
  unique (usuario_id, categoria, lote_numero)
);

create index if not exists idx_referral_bonus_pagamentos_usuario on referral_bonus_pagamentos(usuario_id);

create table if not exists compensacoes_fornecedor (
  id uuid primary key default gen_random_uuid(),
  portador_id uuid not null references usuarios(id),
  cidade text not null,
  fornecedor_nome text not null,
  fornecedor_whatsapp text,
  valor numeric(12,2) not null check (valor > 0),
  descricao text,
  mes_referencia text not null,
  status text not null default 'solicitada' check (status in ('solicitada', 'paga', 'recusada')),
  moeda_conecta_transacao_id uuid references moeda_conecta_transacoes(id),
  processado_por uuid references usuarios(id),
  processado_em timestamptz,
  motivo_recusa text,
  created_at timestamptz not null default now()
);

create index if not exists idx_compensacoes_fornecedor_status on compensacoes_fornecedor(status, mes_referencia);
create index if not exists idx_compensacoes_fornecedor_portador on compensacoes_fornecedor(portador_id, created_at desc);

-- ============================================================
-- RPC: processa bonus de indicacao do usuario — calcula quantos lotes ja
-- foram completados em cada categoria (usando a mesma definicao de
-- "validado" ja usada em /qr-code: usuario com trial_end_at no futuro,
-- estabelecimento com status aprovado/pago) e credita em Moeda Conecta
-- qualquer lote novo que ainda nao esteja em referral_bonus_pagamentos.
-- Idempotente: chamar de novo sem lote novo nao credita nada de novo.
-- ============================================================
create or replace function referral_processar_bonus_v1(p_usuario_id uuid)
returns table (categoria text, lote_numero integer, valor numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cidade text;
  v_count_gerais integer;
  v_count_empresas integer;
  v_count_profissionais integer;
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

  select count(*) into v_count_gerais from usuarios
    where convidado_por_id = p_usuario_id and trial_end_at is not null and trial_end_at > now();
  select count(*) into v_count_empresas from indicacoes_estabelecimentos
    where usuario_id = p_usuario_id and tipo = 'comercio' and status in ('aprovado', 'pago');
  select count(*) into v_count_profissionais from indicacoes_estabelecimentos
    where usuario_id = p_usuario_id and tipo = 'servico' and status in ('aprovado', 'pago');

  for v_cfg in
    select rc.categoria, rc.bonus, rc.meta,
      case rc.categoria
        when 'usuarios_gerais' then v_count_gerais
        when 'empresas_lojas' then v_count_empresas
        when 'profissionais_liberais' then v_count_profissionais
      end as contagem
    from referral_config_cidades rc
    where rc.cidade = v_cidade and rc.ativo = true and rc.meta > 0 and rc.bonus > 0
  loop
    v_lotes := floor(v_cfg.contagem::numeric / v_cfg.meta);
    if v_lotes < 1 then
      continue;
    end if;

    for v_lote in 1..v_lotes loop
      v_pagamento_id := null;

      insert into referral_bonus_pagamentos (usuario_id, cidade, categoria, lote_numero, valor)
      values (p_usuario_id, v_cidade, v_cfg.categoria, v_lote, v_cfg.bonus)
      on conflict (usuario_id, categoria, lote_numero) do nothing
      returning id into v_pagamento_id;

      if v_pagamento_id is not null then
        insert into moeda_conecta_contas (usuario_id, cidade_base)
          values (p_usuario_id, v_cidade) on conflict (usuario_id) do nothing;

        update moeda_conecta_contas set saldo = saldo + v_cfg.bonus, atualizado_em = now()
          where usuario_id = p_usuario_id;

        insert into moeda_conecta_transacoes
          (tipo, remetente_id, destinatario_id, cidade, cidade_destino, valor, descricao, status, moderado_em)
        values
          ('bonus_indicacao', p_usuario_id, p_usuario_id, v_cidade, v_cidade, v_cfg.bonus,
           'Bônus de indicação — lote ' || v_lote || ' (' || v_cfg.categoria || ')', 'concluida', now())
        returning * into v_transacao;

        update referral_bonus_pagamentos set moeda_conecta_transacao_id = v_transacao.id where id = v_pagamento_id;

        categoria := v_cfg.categoria;
        lote_numero := v_lote;
        valor := v_cfg.bonus;
        return next;
      end if;
    end loop;
  end loop;
end;
$$;

-- ============================================================
-- RPC: portador do credito solicita compensacao em real pra um fornecedor
-- que ainda nao e' usuario do app. Debita o saldo do portador na hora
-- (reserva o valor) e registra a solicitacao pendente pro admin master
-- processar o pagamento de verdade (PIX manual pro fornecedor).
-- ============================================================
create or replace function moeda_conecta_solicitar_compensacao_v1(
  p_portador_id uuid,
  p_fornecedor_nome text,
  p_fornecedor_whatsapp text,
  p_valor numeric,
  p_descricao text default null
)
returns compensacoes_fornecedor
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saldo numeric;
  v_cidade text;
  v_transacao moeda_conecta_transacoes;
  v_compensacao compensacoes_fornecedor;
begin
  if p_valor is null or p_valor <= 0 then
    raise exception 'Valor deve ser positivo';
  end if;
  if p_fornecedor_nome is null or trim(p_fornecedor_nome) = '' then
    raise exception 'Nome do fornecedor é obrigatório';
  end if;

  select saldo, cidade_base into v_saldo, v_cidade from moeda_conecta_contas where usuario_id = p_portador_id for update;
  if v_saldo is null then
    raise exception 'Usuário ainda não tem conta na Moeda Conecta';
  end if;
  if v_saldo < p_valor then
    raise exception 'Saldo insuficiente';
  end if;

  update moeda_conecta_contas set saldo = saldo - p_valor, atualizado_em = now() where usuario_id = p_portador_id;

  insert into moeda_conecta_transacoes
    (tipo, remetente_id, destinatario_id, cidade, cidade_destino, valor, descricao, status)
  values
    ('compensacao_fornecedor', p_portador_id, p_portador_id, v_cidade, v_cidade, p_valor,
     coalesce(nullif(trim(p_descricao), ''), 'Compra em ' || trim(p_fornecedor_nome)), 'pendente_moderacao')
  returning * into v_transacao;

  insert into compensacoes_fornecedor
    (portador_id, cidade, fornecedor_nome, fornecedor_whatsapp, valor, descricao, mes_referencia, moeda_conecta_transacao_id)
  values
    (p_portador_id, v_cidade, trim(p_fornecedor_nome), nullif(trim(coalesce(p_fornecedor_whatsapp, '')), ''), p_valor,
     nullif(trim(coalesce(p_descricao, '')), ''), to_char(now(), 'YYYY-MM'), v_transacao.id)
  returning * into v_compensacao;

  return v_compensacao;
end;
$$;

-- ============================================================
-- RPC: admin master confirma que ja pagou o fornecedor em real (fora do
-- sistema). So' muda status, o saldo do portador ja tinha sido debitado na
-- solicitacao.
-- ============================================================
create or replace function moeda_conecta_confirmar_compensacao_v1(
  p_compensacao_id uuid,
  p_admin_id uuid
)
returns compensacoes_fornecedor
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comp compensacoes_fornecedor;
begin
  select * into v_comp from compensacoes_fornecedor where id = p_compensacao_id for update;
  if v_comp is null then
    raise exception 'Compensação não encontrada';
  end if;
  if v_comp.status <> 'solicitada' then
    raise exception 'Compensação já foi processada';
  end if;

  update compensacoes_fornecedor
    set status = 'paga', processado_por = p_admin_id, processado_em = now()
    where id = p_compensacao_id
    returning * into v_comp;

  update moeda_conecta_transacoes
    set status = 'concluida', moderado_por = p_admin_id, moderado_em = now()
    where id = v_comp.moeda_conecta_transacao_id;

  return v_comp;
end;
$$;

-- ============================================================
-- RPC: admin master recusa a solicitacao — devolve o saldo reservado pro
-- portador do credito.
-- ============================================================
create or replace function moeda_conecta_recusar_compensacao_v1(
  p_compensacao_id uuid,
  p_admin_id uuid,
  p_motivo text default null
)
returns compensacoes_fornecedor
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comp compensacoes_fornecedor;
begin
  select * into v_comp from compensacoes_fornecedor where id = p_compensacao_id for update;
  if v_comp is null then
    raise exception 'Compensação não encontrada';
  end if;
  if v_comp.status <> 'solicitada' then
    raise exception 'Compensação já foi processada';
  end if;

  update moeda_conecta_contas set saldo = saldo + v_comp.valor, atualizado_em = now() where usuario_id = v_comp.portador_id;

  update compensacoes_fornecedor
    set status = 'recusada', processado_por = p_admin_id, processado_em = now(), motivo_recusa = p_motivo
    where id = p_compensacao_id
    returning * into v_comp;

  update moeda_conecta_transacoes
    set status = 'estornada', moderado_por = p_admin_id, moderado_em = now(), motivo_moderacao = p_motivo
    where id = v_comp.moeda_conecta_transacao_id;

  return v_comp;
end;
$$;

alter table referral_config_cidades enable row level security;
alter table referral_bonus_pagamentos enable row level security;
alter table compensacoes_fornecedor enable row level security;
create policy "referral_config_cidades_publica" on referral_config_cidades for all using (true) with check (true);
create policy "referral_bonus_pagamentos_publica" on referral_bonus_pagamentos for all using (true) with check (true);
create policy "compensacoes_fornecedor_publica" on compensacoes_fornecedor for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto — escrita de dinheiro so' acontece pelas RPCs security
-- definer acima, nunca por insert/update direto do client nas tabelas.
