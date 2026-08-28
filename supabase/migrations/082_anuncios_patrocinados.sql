-- Caminho: C:\valente_conecta\supabase\migrations\082_anuncios_patrocinados.sql
--
-- Anuncio patrocinado (imagem ou video) comprado pelo comerciante, exibido
-- em pop-up na busca pra usuario sem plano pago quando a busca bate com as
-- palavras-chave escolhidas pelo anunciante. Pagamento simples (nao e'
-- split marketplace, plataforma fica com 100%), preco configuravel pelo
-- admin master via admin_configuracoes (nasce com preco 0 = compra
-- desativada ate configurar). Periodo so' comeca a contar quando o admin
-- aprova o anuncio (nao no pagamento), pra nao gastar dias parado esperando
-- revisao — ver app/api/webhooks/mercadopago/route.ts (processWebhookAnuncioPatrocinado).

create table anuncios_patrocinados (
  id uuid primary key default gen_random_uuid(),
  anunciante_id uuid not null references usuarios(id),
  catalogo_item_id uuid not null references catalogo_itens(id),
  titulo text not null,
  midia jsonb not null,
  palavras_chave text[] not null,
  valor numeric(12,2) not null,
  periodo_dias int not null default 30,
  status text not null default 'pendente_pagamento'
    check (status in ('pendente_pagamento','pendente_aprovacao','aprovado','rejeitado')),
  mp_preference_id text,
  mp_payment_id text,
  inicio_em timestamptz,
  fim_em timestamptz,
  motivo_rejeicao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_anuncios_ativos on anuncios_patrocinados(status, fim_em) where status = 'aprovado';

-- "ativo" = aprovado, ainda dentro do periodo, e o item promovido continua
-- publicado — checado ao vivo, sem cron (mesmo espirito de plano_geral_valido_ate).
create or replace function anuncio_encontrar_por_termos_v1(p_termos text[])
returns anuncios_patrocinados
language sql stable as $$
  select a.* from anuncios_patrocinados a
  where a.status = 'aprovado' and a.fim_em > now()
    and exists (select 1 from catalogo_itens ci where ci.id = a.catalogo_item_id and ci.status = 'ativo')
    and exists (
      select 1 from unnest(a.palavras_chave) kw
      join unnest(p_termos) t on kw ilike '%' || t || '%' or t ilike '%' || kw || '%'
    )
  order by random() limit 1;
$$;

-- Cota diaria de exibicao (mesmo padrao de 077_busca_inteligente_ia.sql) —
-- lista COMPLETA dos servicos ja existentes hoje em plano_geral_limites,
-- confirmada ao vivo no banco antes de escrever esta migration; nao inclui
-- so' o valor novo, senao a constraint rejeita todas as linhas atuais.
alter table plano_geral_limites drop constraint if exists plano_geral_limites_servico_check;
alter table plano_geral_limites add constraint plano_geral_limites_servico_check
  check (servico in (
    'carona_desbloqueio', 'fila_hospital', 'mototaxi', 'agua_gas', 'academia',
    'busca_google', 'desbloqueio_contato', 'busca_inteligente_ia', 'anuncio_popup'
  ));
insert into plano_geral_limites (tier, servico, limite, periodo) values ('gratis', 'anuncio_popup', 1, 'diario')
  on conflict do nothing;

insert into admin_configuracoes (chave, valor, descricao)
select 'anuncio_patrocinado_config', '{"preco": 0, "periodoDias": 30}',
  'Preço e duração do destaque patrocinado exibido em pop-up na busca (preço 0 = compra desativada até o admin configurar)'
where not exists (select 1 from admin_configuracoes where chave = 'anuncio_patrocinado_config');
