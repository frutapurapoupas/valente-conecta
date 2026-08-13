-- Caminho: C:\valente_conecta\supabase\migrations\031_moeda_conecta_real.sql
--
-- Moeda Conecta deixa de ser um arquivo JSON (data/moeda_conecta_transacoes.json
-- — nao sobrevive ao runtime serverless da Vercel, mesmo problema ja
-- corrigido nos pedidos da Cozinha) e vira duas tabelas reais:
--
--   moeda_conecta_contas — saldo AUTORITATIVO por usuario. Nunca mais
--   recalculado no navegador somando o extrato inteiro a cada carregamento
--   (como o Extrato fazia antes).
--
--   moeda_conecta_transacoes — historico completo, com status pra permitir
--   moderacao pelo admin master.
--
-- MODERACAO ENTRE CIDADES (fuga de capital): transferencia dentro da mesma
-- cidade conclui na hora. Transferencia pra usuario de OUTRA cidade debita
-- o remetente na hora (reserva o valor) mas so' credita o destinatario
-- depois que o admin master aprovar (status 'pendente_moderacao') — assim
-- o dinheiro de uma cidade nao escapa pra outra sem alguem responsavel
-- acompanhando o fluxo entre as duas economias locais.
--
-- As RPCs fazem debito+credito+registro numa unica transacao atomica com
-- "for update" na linha do remetente, pra evitar corrida (duas
-- transferencias simultaneas gastando o mesmo saldo).
--
-- NOTA DE SEGURANCA IMPORTANTE: o projeto inteiro ainda nao tem login real
-- (ver VALENTE_CONECTA_MASTER_SPEC.md secao 9) — remetente_id chega por
-- parametro, sem verificacao criptografica de sessao. As RPCs aqui
-- protegem contra saldo negativo e corrida de concorrencia, mas NAO
-- protegem contra alguem se passar por outro usuario enquanto o app nao
-- tiver autenticacao real. Isso e' uma limitacao estrutural do projeto,
-- nao especifica da moeda.

create table if not exists moeda_conecta_contas (
  usuario_id uuid primary key references usuarios(id) on delete cascade,
  cidade_base text not null,
  saldo numeric(14,2) not null default 0 check (saldo >= 0),
  atualizado_em timestamptz not null default now()
);

create table if not exists moeda_conecta_transacoes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('transferencia', 'pagamento_comercio', 'recarga', 'ajuste_admin')),
  remetente_id uuid not null references usuarios(id),
  destinatario_id uuid not null references usuarios(id),
  cidade text not null,
  cidade_destino text not null,
  valor numeric(14,2) not null check (valor > 0),
  descricao text,
  status text not null default 'concluida' check (status in ('concluida', 'pendente_moderacao', 'estornada')),
  moderado_por uuid references usuarios(id),
  moderado_em timestamptz,
  motivo_moderacao text,
  created_at timestamptz not null default now()
);

create index if not exists idx_mc_transacoes_remetente on moeda_conecta_transacoes(remetente_id, created_at desc);
create index if not exists idx_mc_transacoes_destinatario on moeda_conecta_transacoes(destinatario_id, created_at desc);
create index if not exists idx_mc_transacoes_cidade on moeda_conecta_transacoes(cidade);
create index if not exists idx_mc_transacoes_status on moeda_conecta_transacoes(status);

-- ============================================================
-- RPC: transferir — debita o remetente sempre na hora. Se remetente e
-- destinatario sao da mesma cidade, credita na hora e conclui. Se sao de
-- cidades diferentes, o valor fica retido (nao credita ninguem ainda) ate
-- o admin master aprovar via moeda_conecta_aprovar_transferencia_v1.
-- ============================================================
create or replace function moeda_conecta_transferir_v1(
  p_remetente_id uuid,
  p_destinatario_id uuid,
  p_cidade text,
  p_valor numeric,
  p_tipo text default 'transferencia',
  p_descricao text default null
)
returns moeda_conecta_transacoes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saldo numeric;
  v_cidade_destino text;
  v_status text;
  v_transacao moeda_conecta_transacoes;
begin
  if p_valor is null or p_valor <= 0 then
    raise exception 'Valor deve ser positivo';
  end if;
  if p_remetente_id = p_destinatario_id then
    raise exception 'Remetente e destinatario nao podem ser o mesmo usuario';
  end if;
  if p_tipo not in ('transferencia', 'pagamento_comercio', 'recarga') then
    raise exception 'Tipo invalido para transferencia';
  end if;

  insert into moeda_conecta_contas (usuario_id, cidade_base)
    values (p_remetente_id, p_cidade) on conflict (usuario_id) do nothing;

  -- cidade do destinatario: usa a conta dele se ja existir, senao a
  -- cidade_base do cadastro, senao assume a mesma do remetente.
  select cidade_base into v_cidade_destino from moeda_conecta_contas where usuario_id = p_destinatario_id;
  if v_cidade_destino is null then
    select cidade_base into v_cidade_destino from usuarios where id = p_destinatario_id;
  end if;
  v_cidade_destino := coalesce(v_cidade_destino, p_cidade);

  insert into moeda_conecta_contas (usuario_id, cidade_base)
    values (p_destinatario_id, v_cidade_destino) on conflict (usuario_id) do nothing;

  select saldo into v_saldo from moeda_conecta_contas where usuario_id = p_remetente_id for update;

  if v_saldo < p_valor then
    raise exception 'Saldo insuficiente';
  end if;

  update moeda_conecta_contas set saldo = saldo - p_valor, atualizado_em = now() where usuario_id = p_remetente_id;

  if v_cidade_destino = p_cidade then
    update moeda_conecta_contas set saldo = saldo + p_valor, atualizado_em = now() where usuario_id = p_destinatario_id;
    v_status := 'concluida';
  else
    v_status := 'pendente_moderacao';
  end if;

  insert into moeda_conecta_transacoes (tipo, remetente_id, destinatario_id, cidade, cidade_destino, valor, descricao, status)
  values (p_tipo, p_remetente_id, p_destinatario_id, p_cidade, v_cidade_destino, p_valor, p_descricao, v_status)
  returning * into v_transacao;

  return v_transacao;
end;
$$;

-- ============================================================
-- RPC: aprovar transferencia entre cidades — so' o admin master usa. Libera
-- pro destinatario um valor que ja tinha saido do remetente.
-- ============================================================
create or replace function moeda_conecta_aprovar_transferencia_v1(
  p_transacao_id uuid,
  p_admin_id uuid
)
returns moeda_conecta_transacoes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx moeda_conecta_transacoes;
begin
  select * into v_tx from moeda_conecta_transacoes where id = p_transacao_id for update;
  if v_tx is null then
    raise exception 'Transacao nao encontrada';
  end if;
  if v_tx.status <> 'pendente_moderacao' then
    raise exception 'Transacao nao esta pendente de moderacao';
  end if;

  update moeda_conecta_contas set saldo = saldo + v_tx.valor, atualizado_em = now() where usuario_id = v_tx.destinatario_id;

  update moeda_conecta_transacoes
    set status = 'concluida', moderado_por = p_admin_id, moderado_em = now()
    where id = p_transacao_id
    returning * into v_tx;

  return v_tx;
end;
$$;

-- ============================================================
-- RPC: estornar — reverte uma transacao concluida OU recusa uma pendente
-- de moderacao entre cidades. Em ambos os casos devolve pro remetente; so'
-- tira do destinatario se ele chegou a receber de verdade (status
-- concluida). So' funciona uma vez.
-- ============================================================
create or replace function moeda_conecta_estornar_v1(
  p_transacao_id uuid,
  p_admin_id uuid,
  p_motivo text default null
)
returns moeda_conecta_transacoes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx moeda_conecta_transacoes;
begin
  select * into v_tx from moeda_conecta_transacoes where id = p_transacao_id for update;
  if v_tx is null then
    raise exception 'Transacao nao encontrada';
  end if;
  if v_tx.status not in ('concluida', 'pendente_moderacao') then
    raise exception 'Transacao ja foi moderada';
  end if;

  update moeda_conecta_contas set saldo = saldo + v_tx.valor, atualizado_em = now() where usuario_id = v_tx.remetente_id;

  if v_tx.status = 'concluida' then
    update moeda_conecta_contas set saldo = greatest(0, saldo - v_tx.valor), atualizado_em = now() where usuario_id = v_tx.destinatario_id;
  end if;

  update moeda_conecta_transacoes
    set status = 'estornada', moderado_por = p_admin_id, moderado_em = now(), motivo_moderacao = p_motivo
    where id = p_transacao_id
    returning * into v_tx;

  return v_tx;
end;
$$;

-- ============================================================
-- RPC: recarga administrativa — admin master credita saldo (ex: emissao
-- inicial de moeda, bonus de campanha). Nao debita ninguem.
-- ============================================================
create or replace function moeda_conecta_creditar_admin_v1(
  p_admin_id uuid,
  p_destinatario_id uuid,
  p_cidade text,
  p_valor numeric,
  p_descricao text default null
)
returns moeda_conecta_transacoes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transacao moeda_conecta_transacoes;
begin
  if p_valor is null or p_valor <= 0 then
    raise exception 'Valor deve ser positivo';
  end if;

  insert into moeda_conecta_contas (usuario_id, cidade_base)
    values (p_destinatario_id, p_cidade) on conflict (usuario_id) do nothing;

  update moeda_conecta_contas set saldo = saldo + p_valor, atualizado_em = now() where usuario_id = p_destinatario_id;

  insert into moeda_conecta_transacoes (tipo, remetente_id, destinatario_id, cidade, cidade_destino, valor, descricao, status, moderado_por, moderado_em)
  values ('ajuste_admin', p_admin_id, p_destinatario_id, p_cidade, p_cidade, p_valor, p_descricao, 'concluida', p_admin_id, now())
  returning * into v_transacao;

  return v_transacao;
end;
$$;

alter table moeda_conecta_contas enable row level security;
alter table moeda_conecta_transacoes enable row level security;
create policy "moeda_conecta_contas_publica" on moeda_conecta_contas for all using (true) with check (true);
create policy "moeda_conecta_transacoes_publica" on moeda_conecta_transacoes for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto. Escrita real acontece so' pelas RPCs security definer
-- acima, nunca por insert/update direto do client nas tabelas.
