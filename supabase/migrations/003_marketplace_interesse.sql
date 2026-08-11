-- Caminho: C:\valente_conecta\supabase\migrations\003_marketplace_interesse.sql
--
-- Fundacao do marketplace: vitrine publica + modelo de interesse pago.
-- Ver VALENTE_CONECTA_MODULO_MARKETPLACE_MONETIZACAO.md, secao 2.
--
-- NOTA: nao existe tabela `usuarios` nem sistema de login no projeto ainda
-- (ver VALENTE_CONECTA_MASTER_SPEC.md, secao 9 — login e a ultima etapa
-- antes do lancamento). Por isso as colunas *_id abaixo sao uuid livres,
-- sem FK, seguindo o mesmo padrao ja usado em mototaxi_corridas.passageiro_id
-- (005_mototaxi.sql). Quando o login existir, adicionar as FKs e apertar as
-- policies de RLS marcadas como temporarias.

create extension if not exists pgcrypto;

-- ============================================================
-- 1. perfis_fornecedor — unico lugar que guarda dado de contato.
--    catalogo_itens nunca guarda telefone/whatsapp/endereco exato.
-- ============================================================
create table if not exists perfis_fornecedor (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique, -- sem FK: ver nota acima
  nome_exibicao text not null,
  telefone text not null,
  whatsapp text,
  endereco text,
  latitude double precision,
  longitude double precision,
  plano text not null default 'gratis' check (plano in ('gratis','profissional','loja','premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. catalogo_itens — vitrine publica (produto, servico, imovel, vaga...)
-- ============================================================
create table if not exists catalogo_itens (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null, -- sem FK; deve bater com perfis_fornecedor.usuario_id
  modulo text not null,  -- 'agua-gas' | 'servicos' | 'mercados' | 'imoveis' | 'emprego' | 'construcao' | 'saude' | 'pet' | 'cozinha' | ...
  categoria text not null,
  titulo text not null,
  descricao_publica text,
  preco numeric(12,2), -- null = "sob consulta"
  midia jsonb not null default '[]', -- [{tipo:'imagem'|'video', url, thumb_url, ordem}]
  latitude double precision,
  longitude double precision,
  status text not null default 'ativo' check (status in ('ativo','pausado','removido')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_catalogo_itens_modulo on catalogo_itens(modulo);
create index if not exists idx_catalogo_itens_categoria on catalogo_itens(categoria);
create index if not exists idx_catalogo_itens_status on catalogo_itens(status);
create index if not exists idx_catalogo_itens_dono on catalogo_itens(dono_id);
-- 'simple' (nao 'portuguese'): prefixo digitado aos poucos ("feij" enquanto
-- o usuario ainda digita "feijao") precisa bater literalmente com o inicio
-- do texto guardado. Com dicionario de portugues, a raiz gramatical da
-- palavra as vezes diverge do prefixo digitado (ex: raiz "feija", prefixo
-- "feij" nao bate) e a busca "conforme digita" falha de forma imprevisivel.
create index if not exists idx_catalogo_itens_busca on catalogo_itens
  using gin (to_tsvector('simple', coalesce(titulo,'') || ' ' || coalesce(descricao_publica,'')));

-- ============================================================
-- 3. interesses — manifestacao de interesse comprador -> item
-- ============================================================
create table if not exists interesses (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references catalogo_itens(id) on delete cascade,
  comprador_id uuid not null,
  fornecedor_id uuid not null, -- desnormalizado de catalogo_itens.dono_id, facilita RLS/consulta
  status_comprador text not null default 'pendente_pagamento'
    check (status_comprador in ('pendente_pagamento','liberado','isento_assinatura')),
  status_fornecedor text not null default 'pendente_pagamento'
    check (status_fornecedor in ('pendente_pagamento','liberado','isento_assinatura')),
  valor_taxa_comprador numeric(12,2) not null default 0, -- snapshot da taxa no momento
  valor_taxa_fornecedor numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_interesses_item on interesses(item_id);
create index if not exists idx_interesses_comprador on interesses(comprador_id);
create index if not exists idx_interesses_fornecedor on interesses(fornecedor_id);
create index if not exists idx_interesses_created on interesses(created_at desc); -- indicador de "alta demanda" na busca

-- ============================================================
-- 4. taxas_config — configuravel pelo admin master (mais especifico vence)
-- ============================================================
create table if not exists taxas_config (
  id uuid primary key default gen_random_uuid(),
  escopo text not null default 'global', -- 'global' | 'modulo:xxx' | 'categoria:xxx'
  tipo text not null check (tipo in ('taxa_comprador','taxa_fornecedor','assinatura_unica')),
  valor numeric(12,2) not null default 0,
  ativo boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (escopo, tipo)
);

-- semente: taxas globais desligadas por padrao (contato aberto ate o admin master configurar)
insert into taxas_config (escopo, tipo, valor, ativo)
values
  ('global', 'taxa_comprador', 0, false),
  ('global', 'taxa_fornecedor', 0, false),
  ('global', 'assinatura_unica', 0, false)
on conflict (escopo, tipo) do nothing;

-- ============================================================
-- 5. assinaturas_usuario — pagamento unico de adesao geral
-- ============================================================
create table if not exists assinaturas_usuario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  status text not null default 'ativa' check (status in ('ativa','expirada','cancelada')),
  valor_pago numeric(12,2) not null default 0,
  valido_ate timestamptz, -- null = vitalicia
  created_at timestamptz not null default now()
);

create index if not exists idx_assinaturas_usuario on assinaturas_usuario(usuario_id);

-- ============================================================
-- 6. pagamentos — generica, reaproveitavel por todo o ecossistema financeiro
-- ============================================================
create table if not exists pagamentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  origem text not null check (origem in ('interesse_comprador','interesse_fornecedor','assinatura','bonus_indicacao')),
  referencia_id uuid, -- aponta para interesses.id ou assinaturas_usuario.id
  valor numeric(12,2) not null default 0,
  metodo text check (metodo in ('pix','cartao','saldo_carteira')),
  status text not null default 'pendente' check (status in ('pendente','aprovado','recusado','estornado')),
  created_at timestamptz not null default now()
);

create index if not exists idx_pagamentos_usuario on pagamentos(usuario_id);
create index if not exists idx_pagamentos_referencia on pagamentos(referencia_id);

-- ============================================================
-- RPC: busca_vitrine — agrega catalogo + distancia (haversine) + demanda
-- numa unica ida, evitando N+1 no frontend.
-- Ver VALENTE_CONECTA_MODULO_MARKETPLACE_MONETIZACAO.md secao 4.
-- ============================================================
-- NOTA IMPORTANTE: neste projeto Supabase, "create or replace function"
-- numa funcao ja existente fica servindo uma versao presa em cache (o
-- pooler de conexoes mantem plano antigo atrelado ao OID da funcao, que
-- "or replace" nao troca). Confirmado duas vezes durante o desenvolvimento
-- (busca_vitrine -> catalogo_busca_vitrine -> catalogo_busca_vitrine_v2).
-- Regra dai em diante: qualquer mudanca de logica nesta funcao exige nome
-- novo (sufixo de versao), nunca so' um "create or replace" no nome atual.
create or replace function catalogo_busca_vitrine_v2(
  termo text default null,
  modulo_filtro text default null,
  categoria_filtro text default null,
  lat_usuario double precision default null,
  lng_usuario double precision default null,
  limite integer default 30,
  offset_ integer default 0
)
returns table (
  id uuid,
  modulo text,
  categoria text,
  titulo text,
  descricao_publica text,
  preco numeric,
  midia jsonb,
  distancia_km double precision,
  interesses_recentes bigint,
  menor_preco_categoria boolean
)
language sql
stable
as $$
  -- termo_tsquery: cada palavra digitada vira um prefixo ("feij" -> "feij:*"),
  -- assim "busca conforme digita" encontra "feijão" sem precisar da palavra
  -- inteira. nullif garante que termo so' pontuacao/espaco vira null (sem filtro).
  with parametros as (
    select nullif(
      (
        select string_agg(regexp_replace(w, '[^\w]', '', 'g') || ':*', ' & ')
        from unnest(regexp_split_to_array(trim(coalesce(termo, '')), '\s+')) as w
        where regexp_replace(w, '[^\w]', '', 'g') <> ''
      ),
      ''
    ) as termo_tsquery
  ),
  base as (
    select
      c.id, c.modulo, c.categoria, c.titulo, c.descricao_publica, c.preco, c.midia,
      p.termo_tsquery,
      case
        when lat_usuario is null or lng_usuario is null or c.latitude is null or c.longitude is null
          then null
        else (
          2 * 6371 * asin(sqrt(
            sin(radians((c.latitude - lat_usuario) / 2)) ^ 2 +
            cos(radians(lat_usuario)) * cos(radians(c.latitude)) *
            sin(radians((c.longitude - lng_usuario) / 2)) ^ 2
          ))
        )
      end as distancia_km
    from catalogo_itens c, parametros p
    where c.status = 'ativo'
      and (modulo_filtro is null or c.modulo = modulo_filtro)
      and (categoria_filtro is null or c.categoria = categoria_filtro)
      and (
        p.termo_tsquery is null or
        to_tsvector('simple', coalesce(c.titulo,'') || ' ' || coalesce(c.descricao_publica,''))
          @@ to_tsquery('simple', p.termo_tsquery)
      )
  ),
  demanda as (
    select item_id, count(*) as total
    from interesses
    where created_at > now() - interval '30 days'
    group by item_id
  ),
  menor_preco as (
    select categoria, min(preco) as preco_min
    from base
    where preco is not null
    group by categoria
  )
  select
    b.id, b.modulo, b.categoria, b.titulo, b.descricao_publica, b.preco, b.midia,
    b.distancia_km,
    coalesce(d.total, 0) as interesses_recentes,
    (b.preco is not null and mp.preco_min is not null and b.preco = mp.preco_min) as menor_preco_categoria
  from base b
  left join demanda d on d.item_id = b.id
  left join menor_preco mp on mp.categoria = b.categoria
  order by
    case when b.termo_tsquery is not null then
      ts_rank(
        to_tsvector('simple', coalesce(b.titulo,'') || ' ' || coalesce(b.descricao_publica,'')),
        to_tsquery('simple', b.termo_tsquery)
      )
    else 0 end desc,
    b.distancia_km asc nulls last,
    coalesce(d.total, 0) desc
  limit limite offset offset_;
$$;

-- ============================================================
-- RPC: meu_perfil_fornecedor — dono le seu proprio perfil (admin da loja)
-- ============================================================
create or replace function meu_perfil_fornecedor(p_usuario_id uuid)
returns setof perfis_fornecedor
language sql
security definer
set search_path = public
as $$
  select * from perfis_fornecedor where usuario_id = p_usuario_id;
$$;

-- ============================================================
-- RPC: salvar_perfil_fornecedor_v1 — cria/atualiza o proprio perfil.
-- Nao da' pra fazer isso com upsert direto na tabela pelo client: o Postgres
-- precisa de policy de SELECT pra resolver "ON CONFLICT" (decidir se e'
-- insert ou update), e perfis_fornecedor de proposito nao tem policy de
-- select publica (e' assim que o contato fica protegido). Solucao: RPC
-- security definer faz o upsert com privilegio de dono da tabela, ignorando
-- RLS internamente, sem nunca expor select direto pro client.
-- ============================================================
create or replace function salvar_perfil_fornecedor_v1(
  p_usuario_id uuid,
  p_nome_exibicao text,
  p_telefone text,
  p_whatsapp text default null,
  p_endereco text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_plano text default 'gratis'
)
returns perfis_fornecedor
language sql
security definer
set search_path = public
as $$
  insert into perfis_fornecedor (usuario_id, nome_exibicao, telefone, whatsapp, endereco, latitude, longitude, plano, updated_at)
  values (p_usuario_id, p_nome_exibicao, p_telefone, p_whatsapp, p_endereco, p_latitude, p_longitude, p_plano, now())
  on conflict (usuario_id) do update set
    nome_exibicao = excluded.nome_exibicao,
    telefone = excluded.telefone,
    whatsapp = excluded.whatsapp,
    endereco = excluded.endereco,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    plano = excluded.plano,
    updated_at = now()
  returning *;
$$;

-- ============================================================
-- RPC: contato_liberado_comprador — so devolve contato do fornecedor se o
-- interesse ja estiver liberado (pago ou isento por assinatura). E o unico
-- caminho pelo qual o telefone do fornecedor deve chegar ao comprador.
-- ============================================================
create or replace function contato_liberado_comprador(p_interesse_id uuid)
returns table (telefone text, whatsapp text, nome_exibicao text)
language sql
security definer
set search_path = public
as $$
  select pf.telefone, pf.whatsapp, pf.nome_exibicao
  from interesses i
  join perfis_fornecedor pf on pf.usuario_id = i.fornecedor_id
  where i.id = p_interesse_id
    and i.status_comprador in ('liberado', 'isento_assinatura');
$$;

-- NOTA: o equivalente para o fornecedor ver o contato do comprador depende
-- de uma tabela de contato de comprador (hoje inexistente — provavelmente
-- sera `usuarios`/`perfis_comprador` quando o login for implementado, ver
-- MASTER_SPEC secao 9). Adicionar `contato_liberado_fornecedor` nesse momento.

-- ============================================================
-- RLS
-- ============================================================
alter table perfis_fornecedor enable row level security;
alter table catalogo_itens enable row level security;
alter table interesses enable row level security;
alter table taxas_config enable row level security;
alter table assinaturas_usuario enable row level security;
alter table pagamentos enable row level security;

-- catalogo_itens: e a vitrine publica — leitura total liberada. Escrita
-- publica por ora (sem login), ver nota de seguranca no final do arquivo.
create policy "catalogo_itens_leitura_publica" on catalogo_itens
  for select using (true);
create policy "catalogo_itens_escrita_publica" on catalogo_itens
  for all using (true) with check (true);

-- perfis_fornecedor: SEM policy de select. O contato so deve sair pelas RPCs
-- security definer acima (meu_perfil_fornecedor / contato_liberado_comprador),
-- nunca por select direto do client — essa e a garantia real do modelo
-- "vitrine aberta, contato pago" mesmo antes de existir autenticacao.
create policy "perfis_fornecedor_insercao_publica" on perfis_fornecedor
  for insert with check (true);
create policy "perfis_fornecedor_atualizacao_publica" on perfis_fornecedor
  for update using (true) with check (true);

create policy "interesses_leitura_publica" on interesses
  for select using (true);
create policy "interesses_escrita_publica" on interesses
  for all using (true) with check (true);

create policy "taxas_config_leitura_publica" on taxas_config
  for select using (true);
create policy "taxas_config_escrita_publica" on taxas_config
  for all using (true) with check (true);

create policy "assinaturas_usuario_leitura_publica" on assinaturas_usuario
  for select using (true);
create policy "assinaturas_usuario_escrita_publica" on assinaturas_usuario
  for all using (true) with check (true);

create policy "pagamentos_leitura_publica" on pagamentos
  for select using (true);
create policy "pagamentos_escrita_publica" on pagamentos
  for all using (true) with check (true);

-- NOTA DE SEGURANCA: como em 005_mototaxi.sql e 007_pontos_referencia.sql,
-- as policies "publicas" acima (exceto perfis_fornecedor, ja restrita) sao
-- temporarias, para o app funcionar sem login. Quando a autenticacao for
-- implementada (ultima etapa antes do lancamento, ver MASTER_SPEC secao 9),
-- restringir cada uma a auth.uid() = dono_id / comprador_id / fornecedor_id /
-- usuario_id conforme o caso.
