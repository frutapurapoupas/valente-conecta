-- Caminho: C:\valente_conecta\supabase\migrations\086_catalogo_colaborativo_bonus_moderacao.sql
--
-- Campanha de bonus em Moeda Conecta pra quem cadastra produto GENUINAMENTE
-- NOVO no catalogo colaborativo do PDV (ea8c8d8, app/pdv/responder-demanda):
-- EAN novo ou, na ausencia de EAN, o SKU unico gerado. Sem prazo fixo -- so
-- "acaba" quando o admin master desativar a config da cidade, o que deve
-- acontecer quando a base tiver todos os EAN oficiais que circulam ali
-- (confirmado com o dono do projeto).
--
-- Como Moeda Conecta e' gasta de verdade em qualquer comercio da cidade, a
-- foto do codigo de barras (prova de que o produto existe) passa por
-- aprovacao humana do admin master ANTES de qualquer credito -- e fica, pela
-- primeira vez no projeto, num bucket PRIVADO (todo upload existente ate'
-- aqui, 010_storage_catalogo.sql e 022_midia_institucional.sql, e' publico
-- sem moderacao nenhuma).
--
-- Duas regras confirmadas com o dono do projeto:
--   1) Foto do codigo de barras (ou da embalagem, se nao tiver codigo)
--      passa a ser OBRIGATORIA pra publicar produto novo -- validado na rota
--      (app/api/pdv/responder-demanda), nao aqui no banco.
--   2) Foto recusada pode ser REENVIADA pro mesmo produto -- por isso
--      pdv_catalogo_colaborativo_moderacao tem uma linha UNICA por produto
--      (unique(produto_catalogo_id)), reaberta de 'recusado' pra 'pendente'
--      no reenvio, em vez de acumular uma linha por tentativa.

-- ============================================================
-- Bucket privado -- primeiro do projeto. SEM NENHUMA policy em
-- storage.objects pra ele: RLS de storage.objects ja vem ligado por padrao
-- no Supabase, entao sem policy nenhum papel alem de service_role consegue
-- ler ou escrever aqui. So' rotas server-side usando createAdminClient()
-- (lib/supabase/server.ts) tem acesso.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('catalogo-comprovantes', 'catalogo-comprovantes', false)
on conflict (id) do nothing;

-- ============================================================
-- pdv_produtos_catalogo.foto_codigo_barras_url guardava URL publica (bucket
-- 'catalogo'); a partir de agora guarda PATH dentro do bucket privado
-- catalogo-comprovantes. Usos confirmados so' em arquivos desta propria
-- feature (responder-demanda, CapturaCodigoBarras, catalogoColaborativoService)
-- -- rename seguro.
-- ============================================================
alter table pdv_produtos_catalogo rename column foto_codigo_barras_url to foto_codigo_barras_path;

-- ============================================================
-- Fila de moderacao. Uma linha por produto pra sempre (unique
-- produto_catalogo_id) -- reenvio apos recusa REABRE a mesma linha
-- (status volta pra 'pendente'), nao cria linha nova.
-- ============================================================
create table if not exists pdv_catalogo_colaborativo_moderacao (
  id uuid primary key default gen_random_uuid(),
  produto_catalogo_id uuid not null unique references pdv_produtos_catalogo(id) on delete cascade,
  estoque_item_id uuid references pdv_estoque_itens(id) on delete set null,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  cidade text not null,
  tipo_identificador text not null check (tipo_identificador in ('ean', 'sku_sem_ean')),
  ean text,
  sku text not null,
  nome_produto text not null,
  foto_codigo_barras_path text not null,
  foto_produto_url text,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado')),
  motivo_recusa text,
  aprovado_por uuid references usuarios(id),
  processado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pdv_catalogo_moderacao_status on pdv_catalogo_colaborativo_moderacao(status, created_at desc);
create index if not exists idx_pdv_catalogo_moderacao_usuario on pdv_catalogo_colaborativo_moderacao(usuario_id);

-- ============================================================
-- Idempotencia do lote pago -- mesmo padrao de referral_bonus_pagamentos
-- (036_bonus_indicacao_e_compensacao.sql), sem coluna categoria (aqui e' 1
-- valor unico por cidade, nao quebrado por segmento de produto).
-- ============================================================
create table if not exists catalogo_colaborativo_bonus_pagamentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  cidade text not null,
  lote_numero integer not null,
  valor numeric(12,2) not null,
  moeda_conecta_transacao_id uuid references moeda_conecta_transacoes(id),
  created_at timestamptz not null default now(),
  unique (usuario_id, lote_numero)
);

create index if not exists idx_catalogo_bonus_pagamentos_usuario on catalogo_colaborativo_bonus_pagamentos(usuario_id);

-- ============================================================
-- Config do bonus por cidade -- mesmo padrao de referral_config_cidades,
-- sem categoria. ativo=false ate' o admin master configurar valor real pela
-- tela nova -- nao inventamos preco aqui.
-- ============================================================
create table if not exists catalogo_colaborativo_bonus_config_cidades (
  id uuid primary key default gen_random_uuid(),
  cidade text not null unique,
  bonus numeric(12,2) not null default 0 check (bonus >= 0),
  meta integer not null default 1 check (meta > 0),
  ativo boolean not null default false,
  descricao text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- moeda_conecta_transacoes ganha um tipo novo pra esse credito.
-- ============================================================
alter table moeda_conecta_transacoes drop constraint if exists moeda_conecta_transacoes_tipo_check;
alter table moeda_conecta_transacoes add constraint moeda_conecta_transacoes_tipo_check
  check (tipo in (
    'transferencia', 'pagamento_comercio', 'recarga', 'ajuste_admin',
    'bonus_indicacao', 'compensacao_fornecedor',
    'bonus_catalogo_colaborativo'
  ));

-- ============================================================
-- RPC: processa o bonus do usuario -- conta quantos itens APROVADOS ele tem
-- na fila de moderacao, calcula quantos lotes ja foram completados e
-- credita em Moeda Conecta qualquer lote novo que ainda nao esteja em
-- catalogo_colaborativo_bonus_pagamentos. Idempotente: chamar de novo sem
-- lote novo nao credita nada de novo (mesmo padrao de
-- referral_processar_bonus_v1).
-- ============================================================
create or replace function catalogo_colaborativo_processar_bonus_v1(p_usuario_id uuid)
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
    from pdv_catalogo_colaborativo_moderacao
    where usuario_id = p_usuario_id and status = 'aprovado';

  select * into v_cfg from catalogo_colaborativo_bonus_config_cidades
    where cidade = v_cidade and ativo = true and meta > 0 and bonus > 0;
  if not found then
    return;
  end if;

  v_lotes := floor(v_contagem::numeric / v_cfg.meta);
  if v_lotes < 1 then
    return;
  end if;

  for v_lote in 1..v_lotes loop
    v_pagamento_id := null;

    insert into catalogo_colaborativo_bonus_pagamentos (usuario_id, cidade, lote_numero, valor)
    values (p_usuario_id, v_cidade, v_lote, v_cfg.bonus)
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
        ('bonus_catalogo_colaborativo', p_usuario_id, p_usuario_id, v_cidade, v_cidade, v_cfg.bonus,
         'Bônus catálogo colaborativo — lote ' || v_lote, 'concluida', now())
      returning * into v_transacao;

      update catalogo_colaborativo_bonus_pagamentos set moeda_conecta_transacao_id = v_transacao.id where id = v_pagamento_id;

      lote_numero := v_lote;
      valor := v_cfg.bonus;
      return next;
    end if;
  end loop;
end;
$$;

-- ============================================================
-- RPC: admin master aprova um item da fila -- dispara o calculo de bonus.
-- ============================================================
create or replace function catalogo_colaborativo_aprovar_moderacao_v1(p_moderacao_id uuid, p_admin_id uuid)
returns pdv_catalogo_colaborativo_moderacao
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item pdv_catalogo_colaborativo_moderacao;
begin
  select * into v_item from pdv_catalogo_colaborativo_moderacao where id = p_moderacao_id for update;
  if v_item is null then
    raise exception 'Item de moderação não encontrado';
  end if;
  if v_item.status <> 'pendente' then
    raise exception 'Item já foi processado';
  end if;

  update pdv_catalogo_colaborativo_moderacao
    set status = 'aprovado', aprovado_por = p_admin_id, processado_em = now(), updated_at = now()
    where id = p_moderacao_id
    returning * into v_item;

  perform catalogo_colaborativo_processar_bonus_v1(v_item.usuario_id);

  return v_item;
end;
$$;

-- ============================================================
-- RPC: admin master recusa um item -- sem estorno (nenhum debito aconteceu
-- ate' aqui, o credito so' existe depois da aprovacao).
-- ============================================================
create or replace function catalogo_colaborativo_recusar_moderacao_v1(p_moderacao_id uuid, p_admin_id uuid, p_motivo text default null)
returns pdv_catalogo_colaborativo_moderacao
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item pdv_catalogo_colaborativo_moderacao;
begin
  select * into v_item from pdv_catalogo_colaborativo_moderacao where id = p_moderacao_id for update;
  if v_item is null then
    raise exception 'Item de moderação não encontrado';
  end if;
  if v_item.status <> 'pendente' then
    raise exception 'Item já foi processado';
  end if;

  update pdv_catalogo_colaborativo_moderacao
    set status = 'recusado', aprovado_por = p_admin_id, processado_em = now(), motivo_recusa = p_motivo, updated_at = now()
    where id = p_moderacao_id
    returning * into v_item;

  return v_item;
end;
$$;

alter table pdv_catalogo_colaborativo_moderacao enable row level security;
alter table catalogo_colaborativo_bonus_pagamentos enable row level security;
alter table catalogo_colaborativo_bonus_config_cidades enable row level security;
create policy "pdv_catalogo_colaborativo_moderacao_publica" on pdv_catalogo_colaborativo_moderacao for all using (true) with check (true);
create policy "catalogo_colaborativo_bonus_pagamentos_publica" on catalogo_colaborativo_bonus_pagamentos for all using (true) with check (true);
create policy "catalogo_colaborativo_bonus_config_cidades_publica" on catalogo_colaborativo_bonus_config_cidades for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto -- escrita de dinheiro so' acontece pelas RPCs security
-- definer acima, nunca por insert/update direto do client nas tabelas.
