-- Caminho: C:\valente_conecta\supabase\migrations\093_cadastro_consumidor_produto.sql
--
-- Cadastro colaborativo de produto feito por CONSUMIDORES (nao lojistas),
-- comprovado por foto da nota fiscal/cupom + foto do produto + foto do QR
-- code da nota. Diferente da fila de moderacao do lojista (086), aqui a
-- APROVACAO do lojista escolhido pelo consumidor e' o que libera a
-- visibilidade no catalogo colaborativo -- antes de aprovado, o item nao
-- existe em pdv_produtos_catalogo ainda (evita sujeira/spam de cadastro
-- anonimo). Depois de aprovado, qualquer OUTRO lojista ja encontra o
-- produto pronto (nome+foto) via encontrarOuCriarProdutoCatalogo(), sem
-- precisar reaprovar.

create table if not exists consumidor_cadastros_produto (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,      -- consumidor que cadastrou
  fornecedor_id uuid not null references usuarios(id) on delete cascade,   -- lojista escolhido (loja onde comprou), quem aprova
  cidade text not null,
  nome_produto text not null,
  categoria text not null check (categoria in ('mercado','farmacia','auto_pecas','acougue','moda','papelaria','geral')),
  ean text,
  preco_pago numeric(12,2),
  detalhes text,
  foto_produto_url text not null,          -- bucket publico "catalogo"
  foto_nota_fiscal_path text not null,     -- bucket privado "catalogo-comprovantes"
  foto_qrcode_path text not null,          -- bucket privado "catalogo-comprovantes"
  qrcode_conteudo text,                    -- texto decodificado do QR, se leu (auditoria, nao parseado)
  status text not null default 'pendente' check (status in ('pendente','aprovado','recusado')),
  motivo_recusa text,
  aprovado_por uuid references usuarios(id),
  produto_catalogo_id uuid references pdv_produtos_catalogo(id),
  processado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_consumidor_cadastros_fornecedor on consumidor_cadastros_produto(fornecedor_id, status);
create index if not exists idx_consumidor_cadastros_usuario on consumidor_cadastros_produto(usuario_id);

-- ============================================================
-- Config do ciclo por CATEGORIA (nao por cidade, diferente do padrao usado
-- em campanha_viral_cidades/catalogo_colaborativo_bonus_config_cidades) --
-- admin master informa quantos cadastros aprovados fecham um ciclo e o
-- valor do bonus, por categoria de produto. ativo=false ate configurar de
-- verdade, nao inventamos preco aqui.
-- ============================================================
create table if not exists consumidor_cadastro_ciclo_config (
  id uuid primary key default gen_random_uuid(),
  categoria text not null unique check (categoria in ('mercado','farmacia','auto_pecas','acougue','moda','papelaria','geral')),
  meta integer not null default 1 check (meta > 0),
  bonus numeric(12,2) not null default 0 check (bonus >= 0),
  ativo boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Idempotencia do lote pago, mesmo padrao de catalogo_colaborativo_bonus_pagamentos
-- (086), so' que quebrado por categoria (cada categoria fecha ciclo separado).
create table if not exists consumidor_cadastro_bonus_pagamentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  categoria text not null,
  lote_numero integer not null,
  valor numeric(12,2) not null,
  moeda_conecta_transacao_id uuid references moeda_conecta_transacoes(id),
  created_at timestamptz not null default now(),
  unique (usuario_id, categoria, lote_numero)
);

create index if not exists idx_consumidor_bonus_pagamentos_usuario on consumidor_cadastro_bonus_pagamentos(usuario_id);

alter table moeda_conecta_transacoes drop constraint if exists moeda_conecta_transacoes_tipo_check;
alter table moeda_conecta_transacoes add constraint moeda_conecta_transacoes_tipo_check
  check (tipo in (
    'transferencia', 'pagamento_comercio', 'recarga', 'ajuste_admin',
    'bonus_indicacao', 'compensacao_fornecedor',
    'bonus_catalogo_colaborativo', 'bonus_cadastro_consumidor'
  ));

-- ============================================================
-- RPC: processa o bonus do consumidor pra UMA categoria -- mesmo esqueleto
-- de catalogo_colaborativo_processar_bonus_v1 (086), trocando cidade por
-- categoria como dimensao da config e dos lotes. Idempotente: chamar de
-- novo sem lote novo nao credita nada de novo.
-- ============================================================
create or replace function consumidor_cadastro_processar_bonus_v1(p_usuario_id uuid, p_categoria text)
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
    from consumidor_cadastros_produto
    where usuario_id = p_usuario_id and categoria = p_categoria and status = 'aprovado';

  select * into v_cfg from consumidor_cadastro_ciclo_config
    where categoria = p_categoria and ativo = true and meta > 0 and bonus > 0;
  if not found then
    return;
  end if;

  v_lotes := floor(v_contagem::numeric / v_cfg.meta);
  if v_lotes < 1 then
    return;
  end if;

  for v_lote in 1..v_lotes loop
    v_pagamento_id := null;

    insert into consumidor_cadastro_bonus_pagamentos (usuario_id, categoria, lote_numero, valor)
    values (p_usuario_id, p_categoria, v_lote, v_cfg.bonus)
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
        ('bonus_cadastro_consumidor', p_usuario_id, p_usuario_id, v_cidade, v_cidade, v_cfg.bonus,
         'Bônus cadastro de produto (' || p_categoria || ') — lote ' || v_lote, 'concluida', now())
      returning * into v_transacao;

      update consumidor_cadastro_bonus_pagamentos set moeda_conecta_transacao_id = v_transacao.id where id = v_pagamento_id;

      lote_numero := v_lote;
      valor := v_cfg.bonus;
      return next;
    end if;
  end loop;
end;
$$;

alter table consumidor_cadastros_produto enable row level security;
alter table consumidor_cadastro_ciclo_config enable row level security;
alter table consumidor_cadastro_bonus_pagamentos enable row level security;
create policy "consumidor_cadastros_produto_publica" on consumidor_cadastros_produto for all using (true) with check (true);
create policy "consumidor_cadastro_ciclo_config_publica" on consumidor_cadastro_ciclo_config for all using (true) with check (true);
create policy "consumidor_cadastro_bonus_pagamentos_publica" on consumidor_cadastro_bonus_pagamentos for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto -- escrita de dinheiro so' acontece pela RPC security
-- definer acima, nunca por insert/update direto do client.
